import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import User from "../models/user"

export interface JwtPayload {
  id: string
  role: string
  collegeId: string
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const token = req.cookies.token

  console.log(token)

  if (!token) {
    return res.status(401).json({ message: "Access token missing" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    req.user = {
      id: user.id,
      role: user.role,
      collegeId: user.college.toString(),
    }

    next()
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}

export const authorizeRole = (
  requiredRole: "admin" | "teacher" | "student"
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (req.user) {
        if (req.user.role !== requiredRole) {
          res
            .status(403)
            .json({ message: "Forbidden: insufficient privileges" })
          return
        }
      }

      next()
    } catch (error) {
      console.error("Token verification error:", error)
      res.status(401).json({ message: "Invalid token" })
    }
  }
}
