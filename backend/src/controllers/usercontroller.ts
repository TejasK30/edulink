import { Request, Response } from "express"
import User from "../models/user"

export const getUsersByRole = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { role, collegeId } = req.query
    console.log(role, collegeId)
    if (!role || !collegeId) {
      return res
        .status(400)
        .json({ message: "Role and collegeId query parameters are required" })
    }

    const users = await User.find({
      role: role.toString(),
      college: collegeId,
    })

    return res.json(users)
  } catch (error: any) {
    console.error("Error fetching users by role and collegeId:", error)
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message })
  }
}
