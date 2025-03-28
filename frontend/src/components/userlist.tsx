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
import { User, UserRoleType } from "@/lib/store"
import { Filter, Search } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface UserListPageProps {
  role: UserRoleType
  users: (User & {})[]
}

const UserListPage: React.FC<UserListPageProps> = ({ role, users }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<(User & {}) | null>(null)

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
        {selectedUser?.role === "student" && <></>}
        {(selectedUser?.role === "admin" ||
          selectedUser?.role === "teacher") && (
          <>
            {selectedUser?.departments && (
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <Label
                  htmlFor={`${isEditable ? "edit" : "view"}-departments`}
                  className="text-left sm:text-right"
                >
                  Departments
                </Label>
                <Input
                  id={`${isEditable ? "edit" : "view"}-departments`}
                  value={selectedUser?.departments.join(", ") || ""}
                  disabled={!isEditable}
                  className={`w-full col-span-3 ${
                    !isEditable ? "bg-muted" : ""
                  }`}
                />
              </div>
            )}
            {selectedUser?.admins && (
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <Label
                  htmlFor={`${isEditable ? "edit" : "view"}-admins`}
                  className="text-left sm:text-right"
                >
                  Admins
                </Label>
                <Input
                  id={`${isEditable ? "edit" : "view"}-admins`}
                  value={selectedUser?.admins.join(", ") || ""}
                  disabled={!isEditable}
                  className={`w-full col-span-3 ${
                    !isEditable ? "bg-muted" : ""
                  }`}
                />
              </div>
            )}
            {selectedUser?.teachers && (
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <Label
                  htmlFor={`${isEditable ? "edit" : "view"}-teachers`}
                  className="text-left sm:text-right"
                >
                  Teachers
                </Label>
                <Input
                  id={`${isEditable ? "edit" : "view"}-teachers`}
                  value={selectedUser?.teachers.join(", ") || ""}
                  disabled={!isEditable}
                  className={`w-full col-span-3 ${
                    !isEditable ? "bg-muted" : ""
                  }`}
                />
              </div>
            )}
            {selectedUser?.students && (
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <Label
                  htmlFor={`${isEditable ? "edit" : "view"}-students`}
                  className="text-left sm:text-right"
                >
                  Students
                </Label>
                <Input
                  id={`${isEditable ? "edit" : "view"}-students`}
                  value={selectedUser?.students.join(", ") || ""}
                  disabled={!isEditable}
                  className={`w-full col-span-3 ${
                    !isEditable ? "bg-muted" : ""
                  }`}
                />
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex w-full items-center space-x-2 md:w-2/3">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search by name, ID, or email...`}
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
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
    </div>
  )
}

export default UserListPage
