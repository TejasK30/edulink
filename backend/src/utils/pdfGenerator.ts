import fs from "fs"
import path from "path"
import PDFDocument from "pdfkit"
import { IFeePayment } from "../models/FeePayment"
import { UserModel } from "../models/user"
import { formatCurrency, maskCardNumber } from "../helpers"
import { RECEIPT_VALIDITY_DAYS } from "../constants"

const RECEIPT_DIR = path.join(process.cwd(), "uploads", "receipts")
if (!fs.existsSync(RECEIPT_DIR)) {
  fs.mkdirSync(RECEIPT_DIR, { recursive: true })
}

export const generateReceipt = async (
  payment: IFeePayment,
  student: UserModel
): Promise<string> => {
  const timestamp = new Date().getTime()
  const filename = `receipt_${payment._id}_${timestamp}.pdf`
  const filePath = path.join(RECEIPT_DIR, filename)

  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
    info: {
      Title: `Fee Receipt - ${payment.transactionId}`,
      Author: "EduLink University",
      Subject: "Fee Payment Receipt",
      Keywords: "receipt, fee, payment",
      CreationDate: new Date(),
    },
  })
  const stream = fs.createWriteStream(filePath)

  return new Promise((resolve, reject) => {
    doc.pipe(stream)

    doc.font("Helvetica")

    const validUntil = new Date(payment.paymentDate)
    validUntil.setDate(validUntil.getDate() + RECEIPT_VALIDITY_DAYS)

    doc
      .fontSize(24)
      .text("EduLink University", { align: "center" })
      .moveDown(0.2)

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#3778C2").moveDown(0.5)

    doc
      .fontSize(16)
      .fillColor("#333333")
      .text("OFFICIAL FEE RECEIPT", { align: "center" })
      .moveDown(0.5)

    doc
      .rect(50, doc.y, 500, 130)
      .fillAndStroke("#F5FAFF", "#3778C2")
      .moveDown(0.5)

    const receiptY = doc.y - 120
    doc
      .fillColor("#333333")
      .fontSize(10)
      .text(`Receipt No: ${payment.transactionId}`, 70, receiptY)
      .text(
        `Date: ${payment.paymentDate.toLocaleDateString()}`,
        70,
        receiptY + 20
      )
      .text(
        `Transaction Status: ${payment.paymentStatus.toUpperCase()}`,
        70,
        receiptY + 40
      )
      .text(
        `Payment Method: ${formatPaymentMethod(payment)}`,
        70,
        receiptY + 60
      )
      .text(
        `Valid Until: ${validUntil.toLocaleDateString()}`,
        70,
        receiptY + 80
      )
      .text(`Student ID: ${payment.studentId}`, 300, receiptY)
      .text(`Student Name: ${student.name}`, 300, receiptY + 20)
      .text(`Email: ${student.email}`, 300, receiptY + 40)

    if (
      payment.isInstallment &&
      payment.installmentNumber &&
      payment.totalInstallments
    ) {
      doc.text(
        `Installment: ${payment.installmentNumber} of ${payment.totalInstallments}`,
        300,
        receiptY + 60
      )

      if (payment.remainingAmount && payment.remainingAmount > 0) {
        doc.text(
          `Remaining Amount: ${formatCurrency(payment.remainingAmount)}`,
          300,
          receiptY + 80
        )
      } else {
        doc.text(`Installment Status: COMPLETED`, 300, receiptY + 80)
      }
    }

    doc.moveDown(7)

    doc
      .fontSize(12)
      .fillColor("#3778C2")
      .text("FEE DETAILS", { align: "left", underline: true })
      .moveDown(0.5)

    const tableTop = doc.y
    const tableHeaders = [
      { x: 70, width: 200, label: "Fee Type" },
      { x: 270, width: 100, label: "Amount" },
      { x: 370, width: 130, label: "Description" },
    ]

    doc.rect(50, tableTop - 5, 500, 20).fill("#3778C2")

    doc.fillColor("#FFFFFF")
    tableHeaders.forEach((header) => {
      doc.text(header.label, header.x, tableTop, {
        width: header.width,
        align: "left",
      })
    })

    doc.moveDown()

    doc.fillColor("#333333")

    let tableY = doc.y
    const rowHeight = 25
    payment.feeDetails.forEach((detail, i) => {
      if (i % 2 === 0) {
        doc.rect(50, tableY - 5, 500, rowHeight).fill("#F5F5F5")
      }

      doc
        .fillColor("#333333")
        .text(
          capitalizeFirstLetter(detail.feeType) + " Fee",
          tableHeaders[0].x,
          tableY,
          { width: tableHeaders[0].width }
        )
        .text(formatCurrency(detail.amount), tableHeaders[1].x, tableY, {
          width: tableHeaders[1].width,
        })
        .text(getFeeDescription(detail.feeType), tableHeaders[2].x, tableY, {
          width: tableHeaders[2].width,
        })

      tableY += rowHeight
    })

    doc.rect(50, tableTop - 5, 500, tableY - tableTop + 10).stroke("#CCCCCC")

    doc.rect(50, tableY + 5, 500, 30).fillAndStroke("#3778C2", "#3778C2")

    doc
      .fillColor("#FFFFFF")
      .fontSize(12)
      .text("Total Amount", tableHeaders[0].x, tableY + 15, {
        width: tableHeaders[0].width,
      })
      .text(
        formatCurrency(payment.amountPaid),
        tableHeaders[1].x,
        tableY + 15,
        { width: tableHeaders[1].width }
      )

    doc.moveDown(3)

    if (payment.paymentMethod) {
      doc
        .fillColor("#3778C2")
        .fontSize(12)
        .text("PAYMENT INFORMATION", { align: "left", underline: true })
        .moveDown(0.5)

      doc
        .fillColor("#333333")
        .fontSize(10)
        .text(`Payment Method: ${formatPaymentMethod(payment)}`)
        .text(`Transaction ID: ${payment.transactionId}`)
        .text(
          `Payment Date: ${payment.paymentDate.toLocaleDateString()} ${formatTime(
            payment.paymentDate
          )}`
        )
        .moveDown(2)
    }

    doc
      .fillColor("#666666")
      .fontSize(9)
      .text(
        "This is a computer-generated receipt and does not require a signature.",
        { align: "center" }
      )
      .moveDown(0.5)
      .text(
        `Valid for ${RECEIPT_VALIDITY_DAYS} days from the date of payment.`,
        { align: "center" }
      )
      .moveDown(0.5)
      .text(
        "For any queries regarding this payment, please contact the accounts department.",
        { align: "center" }
      )

    doc.rect(450, 700, 80, 80).stroke()
    doc
      .fontSize(8)
      .text("Scan to verify", 450, 785, { width: 80, align: "center" })

    doc.end()

    stream.on("finish", () => {
      resolve(filename)
    })

    stream.on("error", (err) => {
      reject(err)
    })
  })
}

export const getReceiptPath = (filename: string): string => {
  return path.join(RECEIPT_DIR, filename)
}

const formatPaymentMethod = (payment: IFeePayment): string => {
  if (!payment.paymentMethod) return "Unknown"

  switch (payment.paymentMethod) {
    case "CARD":
      return "CARD"
    case "UPI":
      return "UPI"
    case "NET_BANKING":
      return "Net Banking"
    case "WALLET":
      return "Wallet"
    default:
      return payment.paymentMethod
  }
}

const getFeeDescription = (feeType: string): string => {
  switch (feeType) {
    case "tuition":
      return "Academic tuition fees for the semester"
    case "exam":
      return "Examination and assessment fees"
    case "hostel":
      return "Residential accommodation charges"
    default:
      return "Miscellaneous fees"
  }
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
