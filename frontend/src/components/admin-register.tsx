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
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api"
import { AdminRegisterData, useAuth } from "@/lib/auth-provider"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

const adminFormSchema = z
  .object({
    adminName: z
      .string()
      .min(2, { message: "Name must be at least 2 characters" }),
    adminEmail: z
      .string()
      .email({ message: "Please enter a valid email address" }),
    adminPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    adminConfirmPassword: z.string(),
    collegeOption: z.enum(["existing", "new"]).default("existing"),
    existingCollegeId: z.string().optional(),
    collegeName: z.string().optional().nullable(),
    collegeLocation: z.string().optional().nullable(),
    departments: z.string().optional().nullable(),
  })
  .refine((data) => data.adminPassword === data.adminConfirmPassword, {
    message: "Passwords do not match",
    path: ["adminConfirmPassword"],
  })
  .refine(
    (data) =>
      data.collegeOption === "existing" ||
      (data.collegeOption === "new" && data.collegeName),
    {
      message: "College name is required when creating a new college",
      path: ["collegeName"],
    }
  )

type AdminFormValues = z.infer<typeof adminFormSchema>

interface AdminRegistrationFormProps {
  onBack: () => void
}

export function AdminRegistrationForm({ onBack }: AdminRegistrationFormProps) {
  const { registerAdminWithCollege } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [colleges, setColleges] = useState<
    { _id: string; collegeName: string }[]
  >([])
  const router = useRouter()

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      adminName: "",
      adminEmail: "",
      adminPassword: "",
      adminConfirmPassword: "",
      collegeOption: "existing",
      existingCollegeId: undefined,
      collegeName: "",
      collegeLocation: "",
      departments: "",
    },
  })

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

  async function onSubmit(values: AdminFormValues) {
    setIsLoading(true)
    try {
      const payload: Partial<AdminRegisterData> = {
        adminName: values.adminName,
        adminEmail: values.adminEmail,
        adminPassword: values.adminPassword,
        collegeOption: values.collegeOption,
        departments: values.departments
          ? values.departments.split(",").map((dept) => dept.trim())
          : [],
      }

      if (values.collegeOption === "existing") {
        if (!values.existingCollegeId) {
          throw new Error("Please select an existing college")
        }
        payload.existingCollegeId = values.existingCollegeId
      } else {
        if (!values.collegeName) {
          throw new Error("College name is required for a new college")
        }
        payload.collegeName = values.collegeName
        payload.collegeLocation = values.collegeLocation
      }

      await registerAdminWithCollege(payload as AdminRegisterData)
      router.push("/admin/dashboard")
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="adminName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter admin's full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="adminEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter admin's email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="adminPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Create admin password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="adminConfirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Admin Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm admin password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="collegeOption"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-2">
              <FormLabel>Select College Option</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="existing">Existing College</SelectItem>
                    <SelectItem value="new">Create New College</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch().collegeOption === "existing" && (
          <FormField
            control={form.control}
            name="existingCollegeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Existing College</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select College" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map((college) => (
                        <SelectItem key={college._id} value={college._id}>
                          {college.collegeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch().collegeOption === "new" && (
          <>
            <h4 className="text-lg font-semibold mt-4">New College Details</h4>
            <FormField
              control={form.control}
              name="collegeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>College Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter college name"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="collegeLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>College Location </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter college location"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departments (comma-separated)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter departments (e.g., Computer Science, Electrical Engineering)"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Register Admin"}
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
