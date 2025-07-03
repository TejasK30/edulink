"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { zodResolver } from "@hookform/resolvers/zod"
import { Filter, Plus, Search } from "lucide-react"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import {
  useCreateUser,
  useDeleteUser,
  useDepartments,
  useUpdateUser,
  useUserDetails,
} from "@/hooks/useUserActions"
import { useAuth } from "@/lib/auth-provider"
import {
  User,
  userFormSchema,
  UserFormValues,
} from "@/lib/schemas/users.schema"
import { UserForm } from "./admin/users/UserForm"
import { UserProfile } from "./admin/users/UserProfile"

interface UserListPageProps {
  role: string
  users: User[]
}

const UserListPage: React.FC<UserListPageProps> = ({ role, users }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const { user: currentUser } = useAuth()
  const collegeId = currentUser?.collegeId || ""

  const { data: departments = [] } = useDepartments(
    collegeId,
    role === "teacher" || role === "student"
  )

  const { data: userDetails, isLoading: isLoadingDetails } = useUserDetails(
    role,
    selectedUser?._id || "",
    viewDialogOpen && !!selectedUser
  )

  const createUserMutation = useCreateUser(role, collegeId)
  const updateUserMutation = useUpdateUser(role, collegeId)
  const deleteUserMutation = useDeleteUser(role, collegeId)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
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

  const handleViewOpen = (user: User) => {
    setSelectedUser(user)
    setViewDialogOpen(true)
  }

  const handleViewClose = () => {
    setViewDialogOpen(false)
    setSelectedUser(null)
  }

  const handleEditOpen = (user: User) => {
    setSelectedUser(user)
    setEditDialogOpen(true)
    form.reset({
      _id: user._id,
      name: user.name,
      email: user.email,
      password: "",
      department: user.department?._id || "",
    })
  }

  const handleEditClose = () => {
    setEditDialogOpen(false)
    setSelectedUser(null)
    form.reset()
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
    form.reset()
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete._id, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setUserToDelete(null)
        },
      })
    }
  }

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false)
    setUserToDelete(null)
  }

  const handleAddUser = (values: UserFormValues) => {
    createUserMutation.mutate(values, {
      onSuccess: () => handleAddClose(),
    })
  }

  const handleEditUser = (values: UserFormValues) => {
    if (selectedUser) {
      updateUserMutation.mutate(
        { userId: selectedUser._id, userData: values },
        { onSuccess: () => handleEditClose() }
      )
    }
  }

  const roleTitle = role.charAt(0).toUpperCase() + role.slice(1)

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
              Add {roleTitle}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{roleTitle} ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
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
                        <DropdownMenuItem onSelect={() => handleViewOpen(user)}>
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleEditOpen(user)}>
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
              ))}
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

          {isLoadingDetails && (
            <div className="text-center py-8">Loading profile data...</div>
          )}

          {!isLoadingDetails && !userDetails && (
            <div className="text-center py-8 text-red-500">
              Failed to load profile data.
            </div>
          )}

          {userDetails && <UserProfile user={userDetails} role={role} />}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleViewClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={handleEditClose}>
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
              <UserForm
                form={form}
                role={role}
                departments={departments}
                isEditing={true}
                selectedUser={selectedUser}
              />
              <DialogFooter className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleEditClose}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending
                    ? `Updating ${role}...`
                    : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={addDialogOpen} onOpenChange={handleAddClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New {roleTitle}</DialogTitle>
            <DialogDescription>
              Create a new {role.toLowerCase()} account
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAddUser)}
              className="space-y-4"
            >
              <UserForm
                form={form}
                role={role}
                departments={departments}
                isEditing={false}
              />
              <DialogFooter className="sm:justify-start">
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending
                    ? `Creating ${role}...`
                    : `Create ${role}`}
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
              Are you sure you want to delete {userToDelete?.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={handleDeleteClose}
              disabled={deleteUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? `Deleting ${role}...` : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserListPage
