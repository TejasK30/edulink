"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
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
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { CalendarIcon } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/lib/auth-provider"
import { semesterFormSchema } from "@/lib/schemas/semster.schema"
import { toast } from "sonner"
import * as z from "zod"
import api from "@/lib/api"
import { useDepartments } from "@/hooks/useSemester"

export function SemesterForm() {
  const { user } = useAuth()
  const collegeId = user?.collegeId
  const queryClient = useQueryClient()
  const { data: departments = [] } = useDepartments(collegeId)

  const form = useForm<z.infer<typeof semesterFormSchema>>({
    resolver: zodResolver(semesterFormSchema),
    defaultValues: {
      name: "",
      year: new Date().getFullYear().toString(),
      departmentId: "",
      isActive: false,
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof semesterFormSchema>) => {
      const payload = {
        ...values,
        year: parseInt(values.year),
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      }
      const res = await api.post(`/admin/semesters/${collegeId}`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success("Semester created")
      queryClient.invalidateQueries({ queryKey: ["semesters"] })
      form.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create semester")
    },
  })

  const onSubmit = (values: z.infer<typeof semesterFormSchema>) => {
    mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["startDate", "endDate"].map((name) => (
            <FormField
              key={name}
              control={form.control}
              name={name as "startDate" | "endDate"}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    {name === "startDate" ? "Start Date" : "End Date"}
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full text-left font-normal"
                        >
                          {field.value
                            ? format(field.value, "PPP")
                            : "Pick a date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
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
          ))}
        </div>
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between border p-3 rounded-lg">
              <div>
                <FormLabel>Active Semester</FormLabel>
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
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Creating..." : "Create Semester"}
        </Button>
      </form>
    </Form>
  )
}
