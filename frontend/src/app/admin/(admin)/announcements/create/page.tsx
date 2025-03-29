"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api"
import { useAppStore } from "@/lib/store"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z as zod } from "zod"

const formSchema = zod.object({
  title: zod
    .string()
    .min(5, { message: "Title must be at least 5 characters long" })
    .max(100, { message: "Title must not exceed 100 characters" }),
  content: zod
    .string()
    .min(10, { message: "Content must be at least 10 characters long" })
    .max(5000, { message: "Content must not exceed 5000 characters" }),
})

export default function CreateAnnouncementForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { currentUser } = useAppStore()

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const form = useForm<zod.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", content: "" },
  })

  async function onSubmit(values: zod.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const payload = {
        ...values,
        collegeId: currentUser?.collegeid,
        authorId: currentUser?._id,
        authorRole: currentUser?.role === "admin" ? "admin" : "teacher",
      }

      const response = await api.post(
        `/announcements/${currentUser?._id}`,
        payload
      )
      if (response.data.success) {
        toast("Success Announcement has been created successfully.")
        form.reset()
        router.push("/admin/announcements/get")
      } else {
        toast("Error Failed to create announcement. " + response.data.message)
      }
    } catch (error: any) {
      console.error("Error creating announcement:", error)
      toast("Error Failed to create announcement. Please try again")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Create Announcement</CardTitle>
            <CardDescription>
              Share important information with students and faculty
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter announcement title"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Keep it clear and concise
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter announcement details"
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => form.reset()}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Post Announcement"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      )}
    </div>
  )
}
