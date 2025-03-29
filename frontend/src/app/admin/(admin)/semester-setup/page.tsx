"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import api from "@/lib/api"
import { useAppStore } from "@/lib/store"

type Department = {
  _id: string
  name: string
}

type Semester = {
  _id: string
  name: string
  year: number
  departmentId: string
  startDate: string
  endDate: string
  isActive: boolean
}

const semesterFormSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Semester name must be at least 2 characters." }),
    year: z.string().refine((val) => !isNaN(parseInt(val)), {
      message: "Year must be a valid number.",
    }),
    departmentId: z.string().min(1, { message: "Please select a department." }),
    startDate: z.date({ required_error: "Please select a start date." }),
    endDate: z.date({ required_error: "Please select an end date." }),
    isActive: z.boolean().default(false),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  })

export default function SemestersPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const { currentUser } = useAppStore()
  const collegeId = currentUser?.collegeid

  const form = useForm<z.infer<typeof semesterFormSchema>>({
    resolver: zodResolver(semesterFormSchema),
    defaultValues: {
      name: "",
      year: new Date().getFullYear().toString(),
      departmentId: "",
      isActive: false,
    },
  })

  useEffect(() => {
    const fetchDepartmentsByCollege = async (collegeId: string) => {
      if (collegeId) {
        try {
          const response = await api.get(
            `auth/colleges/${collegeId}/departments`
          )
          if (response.status === 200 && response.data) {
            setDepartments(response.data)
          } else {
            toast("Failed to fetch departments: Unexpected response")
            setDepartments([])
          }
        } catch (error) {
          toast("Error fetching departments")
          setDepartments([])
        }
      } else {
        setDepartments([])
      }
    }
    fetchDepartmentsByCollege(collegeId!)
  }, [collegeId])

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const semResponse = await api.get(
          `admin/colleges/${collegeId}/semesters`
        )
        setSemesters(semResponse.data)
      } catch (error) {
        toast("Failed to load semesters. Please try again later.")
      }
    }
    fetchSemesters()
  }, [collegeId])

  async function onSubmit(values: z.infer<typeof semesterFormSchema>) {
    try {
      setIsLoading(true)
      const dataToSend = {
        ...values,
        year: parseInt(values.year),
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      }
      const response = await api.post(
        `admin/semesters/${collegeId}`,
        dataToSend
      )
      toast("Semester Created")
      setSemesters([...semesters, response.data])
      form.reset()
    } catch (error: any) {
      toast(error.response?.data?.message || "Failed to create semester")
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleSemesterStatus(id: string, currentStatus: boolean) {
    try {
      const response = await api.patch(`/semesters/${id}`, {
        isActive: !currentStatus,
      })
      toast(`Semester is now ${!currentStatus ? "active" : "inactive"}.`)
      setSemesters(
        semesters.map((sem) =>
          sem._id === id ? { ...sem, isActive: !currentStatus } : sem
        )
      )
    } catch (error: any) {
      toast(error.response?.data?.message || "Failed to update semester")
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Semester</CardTitle>
            <CardDescription>
              Add a new semester to your college calendar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Fall Semester" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept._id} value={dept._id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active Semester</FormLabel>
                        <FormDescription>
                          Mark this as the active semester
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Semester"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Semesters</CardTitle>
            <CardDescription>Manage your college semesters.</CardDescription>
          </CardHeader>
          <CardContent>
            {semesters.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No semesters created yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {semesters.map((sem) => {
                    const startDate = new Date(sem.startDate)
                    const endDate = new Date(sem.endDate)
                    return (
                      <TableRow key={sem._id}>
                        <TableCell className="font-medium">
                          {sem.name}
                        </TableCell>
                        <TableCell>{sem.year}</TableCell>
                        <TableCell>
                          {format(startDate, "MMM d")} -{" "}
                          {format(endDate, "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={sem.isActive}
                            onCheckedChange={() =>
                              toggleSemesterStatus(sem._id, sem.isActive)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
