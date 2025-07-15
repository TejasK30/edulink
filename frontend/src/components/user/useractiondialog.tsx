"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/providers/auth-provider"
import { userFormSchema } from "@/lib/schemas/user.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useEffect } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

type UserFormInputs = z.infer<typeof userFormSchema>

interface User {
  _id: string
  name: string
  email: string
  role: string
}

interface UserActionDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  action: "update" | "delete"
  role: "student" | "teacher" | "admin"
  collegeId: string
}

const UserActionDialog: React.FC<UserActionDialogProps> = ({
  isOpen,
  onOpenChange,
  user,
  action,
  role,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormInputs>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      userId: user?._id || "",
      name: user?.name || "",
      email: user?.email || "",
      password: "",
    },
  })

  useEffect(() => {
    reset({
      userId: user?._id || "",
      name: user?.name || "",
      email: user?.email || "",
      password: "",
    })
  }, [user, action, reset])

  const onSubmit: SubmitHandler<UserFormInputs> = async (data) => {
    try {
      if (action === "update") {
        if (!data.userId) {
          toast("User ID is required for update")
          return
        }
        await axios.put(`/api/users/${data.userId}`, {
          name: data.name,
          email: data.email,
          password: data.password,
          role,
        })
        toast("User updated successfully")
      } else if (action === "delete") {
        if (!data.userId) {
          toast("User ID is required for deletion")
          return
        }
        await axios.delete(`/api/users/${data.userId}`)
        toast("User deleted successfully")
      }
      onOpenChange(false)
    } catch (err: any) {
      toast(err.response?.data?.message || "An error occurred")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {action === "update" ? "Update" : "Delete"} {role} User
          </DialogTitle>
          <DialogDescription>
            {action === "update"
              ? "Update the details of the user."
              : "Are you sure you want to delete this user?"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {action === "update" && (
            <>
              <input type="hidden" {...register("userId")} />
              <div>
                <label className="block text-sm font-medium">Name</label>
                <Input placeholder="Enter Name" {...register("name")} />
                {errors.name && (
                  <p className="text-red-400 text-sm">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <Input
                  placeholder="Enter Email"
                  type="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">Password</label>
                <Input
                  placeholder="Enter New Password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-400 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </>
          )}
          {action === "delete" && (
            <input type="hidden" {...register("userId")} />
          )}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {action === "update" ? "Update" : "Delete"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UserActionDialog
