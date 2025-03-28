// User model
import mongoose, { Schema, Document } from "mongoose"

export enum UserRole {
  STUDENT = "student",
  TEACHER = "teacher",
  ADMIN = "admin",
}

export interface UserModel extends Document {
  name: string
  email: string
  password: string
  role: UserRole
  college: mongoose.Types.ObjectId
  department?: mongoose.Types.ObjectId
  createdAt?: Date
  updatedAt?: Date
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
    },
    college: { type: Schema.Types.ObjectId, ref: "College", required: true },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
  },
  { timestamps: true }
)

const User = mongoose.model<UserModel>("User", UserSchema)
export default User
