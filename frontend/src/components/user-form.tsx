"use client"

import { useAppStore } from "@/lib/store"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

// Zod validation schema
const userFormSchema = z.object({
  userId: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
})

type UserFormInputs = z.infer<typeof userFormSchema>

interface UserFormProps {
  role: "student" | "teacher" | "admin"
}

const UserForm: React.FC<UserFormProps> = ({ role }) => {
  const [action, setAction] = useState<"create" | "update" | "delete">("create")
  const { currentUser } = useAppStore()

  const form = useForm<UserFormInputs>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      userId: "",
      name: "",
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: UserFormInputs) => {
    try {
      switch (action) {
        case "create":
          await axios.post("/api/users", {
            ...data,
            role,
            college: currentUser?.collegeId,
          })
          toast({
            title: "Success",
            description: "User created successfully.",
            variant: "default",
          })
          break
        case "update":
          if (!data.userId) {
            toast({
              title: "Error",
              description: "User ID is required for update.",
              variant: "destructive",
            })
            return
          }
          await axios.put(`/api/users/${data.userId}`, {
            ...data,
            role,
          })
          toast({
            title: "Success",
            description: "User updated successfully.",
            variant: "default",
          })
          break
        case "delete":
          if (!data.userId) {
            toast({
              title: "Error",
              description: "User ID is required for deletion.",
              variant: "destructive",
            })
            return
          }
          await axios.delete(`/api/users/${data.userId}`)
          toast({
            title: "Success",
            description: "User deleted successfully.",
            variant: "default",
          })
          break
      }
      form.reset()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "An error occurred.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center capitalize">
          {action} {role} User
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="create"
          onValueChange={(value) =>
            setAction(value as "create" | "update" | "delete")
          }
          className="w-full mb-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="update">Update</TabsTrigger>
            <TabsTrigger value="delete">Delete</TabsTrigger>
          </TabsList>
        </Tabs>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {(action === "update" || action === "delete") && (
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter User ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(action === "create" || action === "update") && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Email"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Password"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default UserForm
