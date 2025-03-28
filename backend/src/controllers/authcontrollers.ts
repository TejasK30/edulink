import { Request, Response } from "express"
import College, { ICollege } from "../models/College"
import bcrypt from "bcryptjs"
import { z } from "zod"
import User, { UserRole } from "../models/user"
import jwt from "jsonwebtoken"
import Department, { IDepartment } from "../models/Department"
import mongoose from "mongoose"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const userRegistrationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["student", "teacher"]),
  collegeId: z.string(),
  departmentId: z.string().optional(),
})

const adminRegistrationSchema = z.object({
  adminName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" }),
  adminEmail: z
    .string()
    .email({ message: "Please enter a valid email address" }),
  adminPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  collegeOption: z.enum(["existing", "new"]).default("existing"),
  existingCollegeId: z.string().optional(),
  collegeName: z.string().optional().nullable(),
  collegeLocation: z.string().optional().nullable(),
  departments: z.array(z.string()).optional().nullable(),
})
export const registerUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const validatedData = userRegistrationSchema.parse(req.body)
    const { name, email, password, role, collegeId, departmentId } =
      validatedData

    const collegeExists = await College.findById(collegeId)
    if (!collegeExists) {
      return res.status(400).json({ message: "Invalid college ID" })
    }

    if (departmentId) {
      const departmentExists = await Department.findOne({
        _id: departmentId,
        collegeId,
      })
      if (!departmentExists) {
        return res
          .status(400)
          .json({ message: "Invalid department ID for the selected college" })
      }
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      college: collegeId,
      department:
        role === "student" || role === "teacher" ? departmentId : undefined,
    })

    const savedUser = await newUser.save()

    if ((role === "student" || role === "teacher") && departmentId) {
      if (role === "student") {
        await Department.findByIdAndUpdate(departmentId, {
          $push: { students: savedUser._id },
        })
        await College.findByIdAndUpdate(collegeId, {
          $push: { students: savedUser._id },
        })
      } else if (role === "teacher") {
        await Department.findByIdAndUpdate(departmentId, {
          $push: { teachers: savedUser._id },
        })
        await College.findByIdAndUpdate(collegeId, {
          $push: { teachers: savedUser._id },
        })
      }
    } else {
      await College.findByIdAndUpdate(collegeId, {
        $push: {
          [role === "student" ? "students" : "teachers"]: savedUser._id,
        },
      })
    }

    return res.status(201).json({ message: "Registration successful" })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid input data", errors: error.errors })
    }
    console.error("Error registering user:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}
const registerAdminWithCollege = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const validatedData = adminRegistrationSchema.parse(req.body)
    const {
      adminName,
      adminEmail,
      adminPassword,
      collegeOption,
      existingCollegeId,
      collegeName,
      collegeLocation,
      departments,
    } = validatedData

    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    if (collegeOption === "existing") {
      if (!existingCollegeId) {
        return res
          .status(400)
          .json({ message: "Existing college ID is required" })
      }
      const existingCollege = await College.findById(existingCollegeId)
      if (!existingCollege) {
        return res.status(404).json({ message: "Existing college not found" })
      }
      const existingAdmin = await User.findOne({
        email: adminEmail,
        college: existingCollege._id,
      })
      if (existingAdmin) {
        return res.status(409).json({
          message: "Admin with this email already exists in this college",
        })
      }
      const newAdmin = new User({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        college: existingCollege._id,
      })
      const savedAdmin = await newAdmin.save()
      await College.findByIdAndUpdate(existingCollegeId, {
        $push: { admins: savedAdmin._id },
      })
      return res
        .status(201)
        .json({ message: "Admin added to existing college successfully" })
    } else if (collegeOption === "new") {
      if (!collegeName) {
        return res.status(400).json({ message: "College name is required" })
      }
      const existingCollegeWithName = await College.findOne({ collegeName })
      if (existingCollegeWithName) {
        return res
          .status(409)
          .json({ message: "College with this name already exists" })
      }
      const newCollege = new College({
        collegeName: collegeName,
        collegeAddress: collegeLocation,
        admins: [],
        departments: [],
      })
      const savedCollege = await newCollege.save()
      const existingAdmin = await User.findOne({ email: adminEmail })
      if (existingAdmin) {
        return res.status(409).json({ message: "Admin email already exists" })
      }
      const newAdmin = new User({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        college: savedCollege._id,
      })
      const savedAdmin = await newAdmin.save()
      await College.findByIdAndUpdate(savedCollege._id, {
        $push: { admins: savedAdmin._id },
      })
      const departmentIds: mongoose.Types.ObjectId[] = []
      if (departments && Array.isArray(departments) && departments.length > 0) {
        const departmentDocs = departments.map((deptName: string) => ({
          collegeId: savedCollege._id,
          name: deptName,
          students: [],
          teachers: [],
        }))
        const createdDepartments = (await Department.insertMany(
          departmentDocs
        )) as IDepartment[]
        departmentIds.push(
          ...createdDepartments.map(
            (dept) => dept._id as mongoose.Types.ObjectId
          )
        )
        await College.findByIdAndUpdate(savedCollege._id, {
          $push: { departments: { $each: departmentIds } },
        })
      }
      return res
        .status(201)
        .json({ message: "Admin and College registration successful" })
    } else {
      return res
        .status(400)
        .json({ message: "Invalid college option selected" })
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid input data", errors: error.errors })
    }
    console.error("Error registering admin:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}
const addCollege = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, location } = req.body

    const existingCollege = await College.findOne({ name })
    if (existingCollege) {
      return res
        .status(409)
        .json({ message: "College with this name already exists" })
    }

    const newCollege = new College({ name, location })
    await newCollege.save()

    res.status(201).json({ message: "College added successfully" })
  } catch (error: any) {
    console.error("Error adding college:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

const loginUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const validatedData = loginSchema.parse(req.body)
    const { email, password } = validatedData

    const user = await User.findOne({ email })
      .select("+password")
      .populate<{ college: ICollege }>("college")

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, collegeId: user.college?._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    )

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    })

    let userData: any

    if (user.role === UserRole.STUDENT) {
      userData = {
        userid: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegname: user.college?.collegeName,
        collegeid: user.college?._id,
      }
    } else if (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER) {
      userData = {
        userid: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeid: user.college?._id,
        collegname: user.college?.collegeName,
        departments: user.college?.departments,
        admins: user.college?.admins,
        teachers: user.college?.teachers,
        students: user.college?.students,
      }
    }

    return res.status(200).json({
      message: "Login successful",
      user: userData,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid input data", errors: error.errors })
    }
    console.error("Login error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

const getColleges = async (req: Request, res: Response): Promise<any> => {
  try {
    const colleges = await College.find().select("_id collegeName")
    res.status(200).json(colleges)
  } catch (error) {
    console.error("Error fetching colleges:", error)
    res.status(500).json({ message: "Failed to fetch colleges" })
  }
}

const logoutUser = (req: Request, res: Response): void => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })
  res.status(200).json({ message: "Logged out successfully" })
}

export const getDepartmentsByCollege = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { collegeId } = req.params
    const departments = await Department.find({
      collegeId: new mongoose.Types.ObjectId(collegeId),
    })
    return res.status(200).json(departments)
  } catch (error: any) {
    console.error("Error fetching departments by college:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export {
  registerAdminWithCollege,
  addCollege,
  loginUser,
  getColleges,
  logoutUser,
}
