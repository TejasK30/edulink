"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAppStore, User, UserRoleType } from "@/lib/store"
import { Filter, Plus, Search } from "lucide-react"
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import api from "@/lib/api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { toast } from "sonner"
import { useForm } from "react-hook-form"

interface UserListPageProps {
  role: UserRoleType
  users: (User & {})[]
}

const addUserFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  department: z.string().optional(),
})

type AddUserFormValues = z.infer<typeof addUserFormSchema>

const UserListPage: React.FC<UserListPageProps> = ({ role, users }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<(User & {}) | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const { currentUser } = useAppStore()
  const [departments, setDepartments] = useState<
    { _id: string; name: string }[]
  >([])
  const [isAddingUser, setIsAddingUser] = useState(false)

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      department: "",
    },
  })

  const filteredUsers = users.filter(
    (user) =>
      user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?._id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewOpen = (user: User & {}) => {
    setSelectedUser(user)
    setViewDialogOpen(true)
  }

  const handleEditOpen = (user: User & {}) => {
    setSelectedUser(user)
    setEditDialogOpen(true)
  }

  const handleAddOpen = () => {
    setAddDialogOpen(true)
    form.reset({
      name: "",
      email: "",
      password: "",
      department: "",
    })
  }

  const handleAddClose = () => {
    setAddDialogOpen(false)
  }

  async function handleAddUser(values: AddUserFormValues) {
    setIsAddingUser(true)
    try {
      const payload: any = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: role.toLowerCase(),
      }
      if (role === "teacher" || role === "student") {
        payload.department = values.department
      }
      const response = await api.post(
        `/admin/users/${currentUser?.collegeid}/create`,
        payload
      )
      if (response.status === 201) {
        toast(`${role} created successfully!`)
        handleAddClose()
      } else {
        toast(`Failed to create ${role}.`)
      }
    } catch (error: any) {
      toast(`Error creating ${role}. \ndescription: ${error.message}`)
      console.error(error)
    } finally {
      setIsAddingUser(false)
    }
  }

  const renderUserDialogContent = (isEditable: boolean) => {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-4 space-y-2 sm:space-y-0">
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
              <Label
                htmlFor={`${isEditable ? "edit" : "view"}-name`}
                className="text-left sm:text-right"
              >
                Name
              </Label>
              <Input
                id={`${isEditable ? "edit" : "view"}-name`}
                value={selectedUser?.name || ""}
                disabled={!isEditable}
                className={`w-full col-span-3 ${!isEditable ? "bg-muted" : ""}`}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 mt-2">
              <Label
                htmlFor={`${isEditable ? "edit" : "view"}-email`}
                className="text-left sm:text-right"
              >
                Email
              </Label>
              <Input
                id={`${isEditable ? "edit" : "view"}-email`}
                value={selectedUser?.email || ""}
                disabled={!isEditable}
                className={`w-full col-span-3 ${!isEditable ? "bg-muted" : ""}`}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
          <Label
            htmlFor={`${isEditable ? "edit" : "view"}-id`}
            className="text-left sm:text-right"
          >
            ID
          </Label>
          <Input
            id={`${isEditable ? "edit" : "view"}-id`}
            value={selectedUser?._id || ""}
            disabled
            className="w-full col-span-3 bg-muted"
          />
        </div>
      </div>
    )
  }

  useEffect(() => {
    const fetchDepartmentsByCollege = async (collegeid: string) => {
      if (collegeid) {
        try {
          const response = await api.get(
            `/auth/colleges/${collegeid}/departments`
          )
          if (response.status === 200 && response.data) {
            setDepartments(response.data)
          } else {
            console.error("Failed to fetch departments for college:", collegeid)
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
    fetchDepartmentsByCollege(currentUser?.collegeid || "")
  }, [currentUser?.collegeid])

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex w-full items-center space-x-2 md:w-2/3">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or email..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleAddOpen}>
              <Plus className="mr-2 h-4 w-4" />
              Add {role.charAt(0).toUpperCase() + role.slice(1)}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {role === "student"
                    ? "Student ID"
                    : role === "teacher"
                    ? "Teacher ID"
                    : "Admin ID"}
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                {role === "student" && <TableHead>Program</TableHead>}
                {role === "student" && <TableHead>Year</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(
                (user) =>
                  user && (
                    <TableRow key={user._id}>
                      <TableCell>{user._id}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {user.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      {role === "student" && <TableCell>{"N/A"}</TableCell>}
                      {role === "student" && <TableCell>{"N/A"}</TableCell>}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <span className="text-xl">⋯</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => handleViewOpen(user)}
                            >
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => handleEditOpen(user)}
                            >
                              Edit Details
                            </DropdownMenuItem>
                            {role === "student" && (
                              <DropdownMenuItem>
                                Academic Record
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Profile</DialogTitle>
            <DialogDescription>
              Detailed information about the selected user
            </DialogDescription>
          </DialogHeader>
          {renderUserDialogContent(false)}
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Details</DialogTitle>
            <DialogDescription>
              Modify the details of the selected user
            </DialogDescription>
          </DialogHeader>
          {renderUserDialogContent(true)}
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={addDialogOpen} onOpenChange={handleAddClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Add New {role.charAt(0).toUpperCase() + role.slice(1)}
            </DialogTitle>
            <DialogDescription>
              Create a new {role.toLowerCase()} account
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAddUser)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
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
                      <Input placeholder="Enter email" {...field} />
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
                        placeholder="Create password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((department) => (
                              <SelectItem
                                key={department._id}
                                value={department._id}
                              >
                                {department.name}
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
              <DialogFooter className="sm:justify-start">
                <Button type="submit" disabled={isAddingUser}>
                  {isAddingUser ? `Creating ${role}...` : `Create ${role}`}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserListPage
