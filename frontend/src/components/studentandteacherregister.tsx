"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import api from "@/lib/api"
import { useAuth } from "@/lib/auth-provider"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

const userFormSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
    role: z.enum(["student", "teacher"]),
    collegeId: z.string().min(1, { message: "Please select a college" }),
    departmentId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type UserFormValues = z.infer<typeof userFormSchema>

interface StudentTeacherRegistrationFormProps {
  onBack: () => void
}

export function StudentTeacherRegistrationForm({
  onBack,
}: StudentTeacherRegistrationFormProps) {
  const { register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [colleges, setColleges] = useState<
    { _id: string; collegeName: string }[]
  >([])
  const [departments, setDepartments] = useState<
    { _id: string; name: string }[]
  >([])
  const router = useRouter()
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
      collegeId: "",
      departmentId: "",
    },
  })
  const { watch } = form
  const selectedCollegeId = watch("collegeId")
  async function onSubmit(values: UserFormValues) {
    setIsLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...payload } = values
      await register(payload)
      router.push("/login")
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await api.get("auth/colleges")
        if (response.status === 200 && response.data) {
          setColleges(response.data.data)
        } else {
          console.error("Failed to fetch colleges: Unexpected response")
        }
      } catch (error) {
        console.error("Error fetching colleges:", error)
      }
    }
    fetchColleges()
  }, [])
  useEffect(() => {
    const fetchDepartmentsByCollege = async (collegeId: string) => {
      if (collegeId) {
        try {
          const response = await api.get(
            `auth/colleges/${collegeId}/departments`
          )
          if (response.status === 200 && response.data) {
            setDepartments(response.data.data)
          } else {
            console.error("Failed to fetch departments: Unexpected response")
            setDepartments([])
          }
        } catch (error) {
          console.error("Error fetching departments:", error)
          setDepartments([])
        }
      } else {
        setDepartments([])
      }
    }
    fetchDepartmentsByCollege(selectedCollegeId)
  }, [selectedCollegeId])
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
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
                <Input placeholder="Enter your email" {...field} />
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
                  type="password"
                  placeholder="Create a password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="collegeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>College</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your college" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colleges.map((college) => (
                    <SelectItem key={college._id} value={college._id}>
                      {college.collegeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {selectedCollegeId && (
          <FormField
            control={form.control}
            name="departmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={departments.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department._id} value={department._id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Register"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full mt-2"
          onClick={onBack}
        >
          Back
        </Button>
      </form>
    </Form>
  )
}
