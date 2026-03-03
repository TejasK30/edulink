import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import User from "../models/user"
import { redis } from "../config/redis"

export interface JwtPayload {
  id: string
  role: string
  collegeId: string
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({ message: "Access token missing" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload

    const cacheKey = `user:${decoded.id}`

    let userData = await redis.get(cacheKey)

    if (!userData) {
      const user = await User.findById(decoded.id)

      if (!user) {
        return res.status(401).json({ message: "User not found" })
      }

      userData = JSON.stringify({
        id: user.id,
        role: user.role,
        collegeId: user.college.toString(),
      })

      await redis.set(cacheKey, userData, "EX", 120)
    }

    req.user = JSON.parse(userData)

    next()
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}

type Role = "admin" | "teacher" | "student"

export const authorizeRole = (requiredRoles: Role | Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (req.user) {
        const userRole: Role = req.user.role as Role
        const allowedRoles = Array.isArray(requiredRoles)
          ? requiredRoles
          : [requiredRoles]

        if (!allowedRoles.includes(userRole)) {
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
