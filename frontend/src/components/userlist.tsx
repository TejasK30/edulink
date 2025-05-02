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
} from "./ui/form"
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

interface DetailedUser {
  _id: string
  name: string
  email: string
  role: UserRoleType
  createdAt: string
  updatedAt: string
  department?: { _id: string; name: string }
  enrolledCourses?: {
    _id: string
    name: string
    code: string
    credits: number
  }[]
  attendance?: {
    _id: string
    courseId: { _id: string; name: string; code: string }
    date: string
    status: string
  }[]
  grades?: {
    _id: string
    courseId: { _id: string; name: string; code: string }
    gradeValue: number
    gradeType: string
    updatedAt: string
  }[]
  teachingCourses?: {
    _id: string
    name: string
    code: string
    credits: number
    enrolledStudents: number
  }[]
  feedbacks?: {
    _id: string
    rating: number
    message: string
    createdAt: string
  }[]
}

const addUserFormSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .optional(),
  department: z.string().optional(),
})

type AddUserFormValues = z.infer<typeof addUserFormSchema>

interface UserListPageProps {
  role: UserRoleType
  users: (User & {})[]
}

const UserListPage: React.FC<UserListPageProps> = ({ role, users }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<(User & {}) | null>(null)
  const [isDeletingUser, setIsDeletingUser] = useState(false)

  const [selectedUserForEdit, setSelectedUserForEdit] = useState<
    (User & {}) | null
  >(null)
  const [detailedUserData, setDetailedUserData] = useState<DetailedUser | null>(
    null
  )
  const [isLoadingDetailedUser, setIsLoadingDetailedUser] = useState(false)

  const { currentUser, fetchStudents, fetchTeachers, fetchAdmins } =
    useAppStore()
  const [departments, setDepartments] = useState<
    { _id: string; name: string }[]
  >([])

  const [isAddingUser, setIsAddingUser] = useState(false)
  const [isEditingUser, setIsEditingUser] = useState(false)

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserFormSchema),
    defaultValues: {
      _id: "",
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

  const handleViewOpen = async (user: User & {}) => {
    setDetailedUserData(null)
    setIsLoadingDetailedUser(true)
    setViewDialogOpen(true)

    try {
      const response = await api.get(`/admin/users/${role}/${user._id}`)
      if (response.status === 200) {
        setDetailedUserData(response.data as DetailedUser)
      } else {
        toast.error(
          `Failed to fetch detailed ${role} data: ${
            response.data?.error || "Unknown error"
          }`
        )
        setDetailedUserData(null)
      }
    } catch (error: any) {
      console.error("Error fetching detailed user data:", error)
      toast.error(
        `Error fetching detailed ${role} data. \nDescription: ${
          error.response?.data?.error || error.message
        }`
      )
      setDetailedUserData(null)
    } finally {
      setIsLoadingDetailedUser(false)
    }
  }

  const handleViewClose = () => {
    setViewDialogOpen(false)
    setDetailedUserData(null)
  }

  const handleEditOpen = (user: User & {}) => {
    setSelectedUserForEdit(user)
    setEditDialogOpen(true)
    form.reset({
      _id: user._id,
      name: user.name,
      email: user.email,
      password: "",
      department: (user as any).department?._id || "",
    })
  }

  const handleAddOpen = () => {
    setAddDialogOpen(true)
    form.reset({
      _id: "",
      name: "",
      email: "",
      password: "",
      department: "",
    })
  }

  const handleAddClose = () => {
    setAddDialogOpen(false)
  }

  const handleEditClose = () => {
    setEditDialogOpen(false)
    setSelectedUserForEdit(null)
  }

  const handleDeleteClick = (user: User & {}) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    setIsDeletingUser(true)
    try {
      const response = await api.delete(`/admin/users/${userToDelete._id}`)

      if (response.status === 200) {
        toast(`${role} deleted successfully!`)
        handleDeleteClose()
        if (role === "student") {
          await fetchStudents(currentUser?.collegeid || "")
        } else if (role === "teacher") {
          await fetchTeachers(currentUser?.collegeid || "")
        } else if (role === "admin") {
          await fetchAdmins(currentUser?.collegeid || "")
        }
      } else {
        toast.error(`Failed to delete ${role}.`)
      }
    } catch (error: any) {
      console.error("Error deleting user:", error)
      toast.error(
        `Error deleting ${role}. \nDescription: ${
          error.response?.data?.error || error.message
        }`
      )
    } finally {
      setIsDeletingUser(false)
    }
  }

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false)
    setUserToDelete(null)
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
        if (role === "student") {
          await fetchStudents(currentUser?.collegeid || "")
        } else if (role === "teacher") {
          await fetchTeachers(currentUser?.collegeid || "")
        } else if (role === "admin") {
          await fetchAdmins(currentUser?.collegeid || "")
        }
      } else {
        toast(`Failed to create ${role}.`)
      }
    } catch (error: any) {
      toast(
        `Error creating ${role}. \ndescription: ${
          error.response?.data?.error || error.message
        }`
      )
      console.error(error)
    } finally {
      setIsAddingUser(false)
    }
  }

  async function handleEditUser(values: AddUserFormValues) {
    setIsEditingUser(true)
    try {
      const { _id, ...updatedData } = values
      if (!selectedUserForEdit?._id) {
        toast.error("Error: User ID not available for editing.")
        setIsEditingUser(false)
        return
      }
      const payload: any = { ...updatedData }
      if (!payload.password) {
        delete payload.password
      }
      if (
        (role === "teacher" || role === "student") &&
        payload.department === ""
      ) {
        delete payload.department
      }

      const response = await api.put(
        `/admin/users/${selectedUserForEdit._id}`,
        payload
      )
      if (response.status === 200) {
        toast(`${role} updated successfully!`)
        handleEditClose()
        if (role === "student") {
          await fetchStudents(currentUser?.collegeid || "")
        } else if (role === "teacher") {
          await fetchTeachers(currentUser?.collegeid || "")
        } else if (role === "admin") {
          await fetchAdmins(currentUser?.collegeid || "")
        }
      } else {
        toast(`Failed to update ${role}.`)
      }
    } catch (error: any) {
      toast(
        `Error updating ${role}. \ndescription: ${
          error.response?.data?.error || error.message
        }`
      )
      console.error(error)
    } finally {
      setIsEditingUser(false)
    }
  }

  const renderUserFormFields = (isEditable: boolean) => {
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
                      editDialogOpen
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
        {editDialogOpen && selectedUserForEdit && (
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
            <Label htmlFor="user-id-edit" className="text-left sm:text-right">
              ID
            </Label>
            <Input
              id="user-id-edit"
              value={selectedUserForEdit._id || ""}
              disabled
              className="w-full col-span-3 bg-muted"
            />
          </div>
        )}
      </div>
    )
  }

  useEffect(() => {
    const fetchDepartmentsByCollege = async (collegeid: string) => {
      if (collegeid && (role === "teacher" || role === "student")) {
        try {
          const response = await api.get(
            `/auth/colleges/${collegeid}/departments`
          )
          if (
            response.status === 200 &&
            response.data &&
            Array.isArray(response.data.data)
          ) {
            setDepartments(response.data.data)
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
  }, [currentUser?.collegeid, role])

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
                            <DropdownMenuItem
                              onSelect={() => handleDeleteClick(user)}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
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

      <Dialog open={viewDialogOpen} onOpenChange={handleViewClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Profile</DialogTitle>
            <DialogDescription>
              Detailed information about the selected user
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetailedUser && (
            <div className="text-center py-8">Loading profile data...</div>
          )}

          {!isLoadingDetailedUser && !detailedUserData && (
            <div className="text-center py-8 text-red-500">
              Failed to load profile data.
            </div>
          )}

          {!isLoadingDetailedUser && detailedUserData && (
            <div className="space-y-6 text-sm">
              <section className="space-y-2">
                <h4 className="text-base font-semibold">Basic Information</h4>
                <p>
                  <strong>Name:</strong> {detailedUserData.name}
                </p>
                <p>
                  <strong>Email:</strong> {detailedUserData.email}
                </p>
                <p>
                  <strong>Role:</strong>{" "}
                  {detailedUserData.role.charAt(0).toUpperCase() +
                    detailedUserData.role.slice(1)}
                </p>
                {detailedUserData.department && (
                  <p>
                    <strong>Department:</strong>{" "}
                    {detailedUserData.department.name}
                  </p>
                )}
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(detailedUserData.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>Updated At:</strong>{" "}
                  {new Date(detailedUserData.updatedAt).toLocaleString()}
                </p>
                <p>
                  <strong>ID:</strong> {detailedUserData._id}
                </p>
              </section>

              {role === "student" && (
                <section className="space-y-4">
                  <h4 className="text-base font-semibold">
                    Academic Information
                  </h4>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Enrolled Courses</h5>
                    {detailedUserData.enrolledCourses &&
                    detailedUserData.enrolledCourses.length > 0 ? (
                      <ul className="list-disc list-inside ml-4">
                        {detailedUserData.enrolledCourses.map((course) => (
                          <li key={course._id}>
                            {course.code} - {course.name} ({course.credits}{" "}
                            credits)
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-xs">
                        Not enrolled in any courses.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Attendance</h5>
                    {detailedUserData.attendance &&
                    detailedUserData.attendance.length > 0 ? (
                      <ul className="list-disc list-inside ml-4">
                        {detailedUserData.attendance.map((att) => (
                          <li key={att._id}>
                            {att.courseId.code} - {att.courseId.name}:{" "}
                            {new Date(att.date).toLocaleDateString()} -{" "}
                            {att.status}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-xs">
                        No attendance records.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Grades</h5>
                    {detailedUserData.grades &&
                    detailedUserData.grades.length > 0 ? (
                      <ul className="list-disc list-inside ml-4">
                        {detailedUserData.grades.map((grade) => (
                          <li key={grade._id}>
                            {grade.courseId.code} - {grade.courseId.name}:{" "}
                            {grade.gradeType} - {grade.gradeValue} (Last
                            updated:{" "}
                            {new Date(grade.updatedAt).toLocaleDateString()})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-xs">
                        No grade records.
                      </p>
                    )}
                  </div>
                </section>
              )}

              {role === "teacher" && (
                <section className="space-y-4">
                  <h4 className="text-base font-semibold">
                    Teaching Information
                  </h4>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Teaching Courses</h5>
                    {detailedUserData.teachingCourses &&
                    detailedUserData.teachingCourses.length > 0 ? (
                      <ul className="list-disc list-inside ml-4">
                        {detailedUserData.teachingCourses.map((course) => (
                          <li key={course._id}>
                            {course.code} - {course.name} ({course.credits}{" "}
                            credits) - {course.enrolledStudents} enrolled
                            students
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-xs">
                        Not assigned to teach any courses.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Feedbacks</h5>
                    {detailedUserData.feedbacks &&
                    detailedUserData.feedbacks.length > 0 ? (
                      <ul className="list-disc list-inside ml-4">
                        {detailedUserData.feedbacks.map((feedback) => (
                          <li key={feedback._id}>
                            Rating: {feedback.rating}/5 - "{feedback.message}"
                            (on{" "}
                            {new Date(feedback.createdAt).toLocaleDateString()})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-xs">
                        No feedback received yet.
                      </p>
                    )}
                  </div>
                </section>
              )}

              {role === "admin" && (
                <div className="space-y-2">
                  <h5 className="text-base font-semibold">
                    Additional Information
                  </h5>
                  <p className="text-muted-foreground text-sm">
                    No additional role-specific information available.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleViewClose}>
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
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleEditUser)}
              className="space-y-4"
            >
              {renderUserFormFields(true)}
              <DialogFooter className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleEditClose}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isEditingUser}>
                  {isEditingUser ? `Updating ${role}...` : `Save Changes`}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={addDialogOpen} onOpenChange={handleAddClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Add New {role.charAt(0).toUpperCase() + role.slice(1)}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Create a new {role.toLowerCase()} account
          </DialogDescription>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAddUser)}
              className="space-y-4"
            >
              {renderUserFormFields(true)}
              <DialogFooter className="sm:justify-start">
                <Button type="submit" disabled={isAddingUser}>
                  {isAddingUser ? `Creating ${role}...` : `Create ${role}`}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={handleDeleteClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              {userToDelete?.name || "this user"}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={handleDeleteClose}
              disabled={isDeletingUser}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeletingUser}
            >
              {isDeletingUser ? `Deleting ${role}...` : `Delete`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserListPage
