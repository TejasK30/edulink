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
import { useAuth } from "@/lib/auth-provider"
import { announcementFormSchema } from "@/lib/schemas/announcement"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z as zod } from "zod"

export default function CreateAnnouncementForm() {
  const router = useRouter()
  const { user } = useAuth()

  const form = useForm<zod.infer<typeof announcementFormSchema>>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: { title: "", content: "" },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: zod.infer<typeof announcementFormSchema>) => {
      const payload = {
        ...values,
        collegeId: user.collegeId,
        authorId: user.id,
        authorRole: user.role === "admin" ? "admin" : "teacher",
      }
      const response = await api.post(`/announcements/${user.id}`, payload)
      if (!response.data.success) {
        throw new Error(response.data.message || "Unknown error")
      }
      return response.data
    },
    onSuccess: () => {
      toast.success("Announcement posted successfully!")
      form.reset()
      router.push("/admin/announcements/get")
    },
    onError: (error: any) => {
      console.error("Error creating announcement:", error)
      toast.error("Failed to create announcement. Please try again.")
    },
  })

  const onSubmit = (values: zod.infer<typeof announcementFormSchema>) => {
    mutate(values)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create Announcement</CardTitle>
          <CardDescription>
            Share important information with students and faculty.
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
                      Keep it clear and concise.
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
            <CardFooter className="flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
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
    </div>
  )
}
