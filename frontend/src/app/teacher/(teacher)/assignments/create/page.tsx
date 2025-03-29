"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import api from "@/lib/api"
import { toast } from "sonner"
import { useAppStore } from "@/lib/store"

export default function CreateAssignmentPage() {
  const router = useRouter()
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [questions, setQuestions] = useState<string[]>(Array(6).fill(""))
  const [title, setTitle] = useState("")
  const [name, setName] = useState("")
  const [selectedCollege, setSelectedCollege] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const { currentUser } = useAppStore()

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[index] = value
    setQuestions(newQuestions)
  }

  const handleCreateAssignment = async () => {
    if (
      !selectedCollege ||
      !selectedDepartment ||
      !selectedCourse ||
      !title ||
      !name ||
      questions.some((q) => !q) ||
      !dueDate ||
      !currentUser?._id
    ) {
      toast.error("Please fill in all the required fields.")
      return
    }

    try {
      const response = await api.post(
        `/teacher/assignments/teacher/${currentUser._id}`,
        {
          collegeId: selectedCollege,
          departmentId: selectedDepartment,
          courseId: selectedCourse,
          title,
          name,
          questions,
          dueDate: dueDate.toISOString(),
        }
      )

      if (response.status === 201) {
        toast.success("Assignment created successfully!")
        router.push("/assignments/list")
      } else {
        toast.error("Failed to create assignment.")
      }
    } catch (error: any) {
      toast.error("Error creating assignment", { description: error.message })
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Assignments
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Create New Assignment
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            Create a new assignment for your course
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Assignment Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter assignment title"
                      className="w-full"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Assignment Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter assignment name"
                      className="w-full"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <Card className="bg-secondary/50">
                    <CardHeader>
                      <CardTitle className="text-lg md:text-xl">
                        Assignment Questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {questions.map((question, index) => (
                          <div key={index} className="space-y-2">
                            <Label htmlFor={`question-${index + 1}`}>
                              Question {index + 1}
                            </Label>
                            <Textarea
                              id={`question-${index + 1}`}
                              placeholder={`Enter question ${index + 1}`}
                              value={question}
                              onChange={(e) =>
                                handleQuestionChange(index, e.target.value)
                              }
                              className="min-h-[100px] w-full"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>College</Label>
                    <Select
                      value={selectedCollege}
                      onValueChange={setSelectedCollege}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select college" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="67e6358bc74281e357286e7c">
                          abc college
                        </SelectItem>
                        {/* Add other college options dynamically if needed */}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select
                      value={selectedDepartment}
                      onValueChange={setSelectedDepartment}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="67e6358bc74281e357286e82">
                          cse
                        </SelectItem>
                        <SelectItem value="67e6358bc74281e357286e83">
                          ece
                        </SelectItem>
                        <SelectItem value="67e6358bc74281e357286e84">
                          ai
                        </SelectItem>
                        <SelectItem value="67e6358bc74281e357286e85">
                          ds
                        </SelectItem>
                        <SelectItem value="67e6358bc74281e357286e86">
                          civil
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Course</Label>
                    <Select
                      value={selectedCourse}
                      onValueChange={setSelectedCourse}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="67e681d0626e84d197c5b3ad">
                          Advanced AI Techniques (AI201) - Semester 1 2023
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PPP") : "Select due date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col justify-between gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button className="w-full" onClick={handleCreateAssignment}>
                Create Assignment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
