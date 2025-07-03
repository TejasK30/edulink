import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import React from "react"
import { UseFormReturn } from "react-hook-form"
import { Department, User, UserFormValues } from "@/lib/schemas/users.schema"

interface UserFormProps {
  form: UseFormReturn<UserFormValues>
  role: string
  departments: Department[]
  isEditing?: boolean
  selectedUser?: User | null
  isEditable?: boolean
}

export const UserForm: React.FC<UserFormProps> = ({
  form,
  role,
  departments,
  isEditing = false,
  selectedUser,
  isEditable = true,
}) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter full name"
                disabled={!isEditable}
                {...field}
              />
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
                placeholder="Enter email"
                disabled={!isEditable}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isEditable && (
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={
                    isEditing
                      ? "Leave blank to keep current password"
                      : "Create password"
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {(role === "teacher" || role === "student") && (
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!isEditable}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept._id} value={dept._id}>
                        {dept.name}
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

      {isEditing && selectedUser && (
        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
          <Label htmlFor="user-id-edit" className="text-left sm:text-right">
            ID
          </Label>
          <Input
            id="user-id-edit"
            value={selectedUser._id}
            disabled
            className="w-full col-span-3 bg-muted"
          />
        </div>
      )}
    </div>
  )
}
