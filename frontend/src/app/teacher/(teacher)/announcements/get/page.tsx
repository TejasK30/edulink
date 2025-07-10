"use client"

import AnnouncementCard from "@/components/announcementCard"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import api from "@/lib/api"
import { useAuth } from "@/lib/auth-provider"
import { Announcement } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { PlusCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function AnnouncementsPage() {
  const { user, isLoading: userLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<string>("all")

  const isUserReady = !userLoading && !!user?.collegeId

  const {
    data: announcements = [],
    isLoading,
    isError,
    refetch,
    error,
  } = useQuery<Announcement[], Error>({
    queryKey: ["announcements", user?.collegeId, activeTab],
    enabled: isUserReady,
    queryFn: async () => {
      if (!user?.collegeId) {
        throw new Error("User college ID not available")
      }

      let endpoint = `/announcements/${user.collegeId}`
      if (activeTab === "college") {
        endpoint += "?type=college"
      } else if (activeTab === "department") {
        endpoint += "?type=department"
      }

      const response = await api.get(endpoint)
      return response.data.data
    },
  })

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="py-10 text-center">Loading user data...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="py-10 text-center">
          <Alert variant="destructive">
            <AlertDescription>
              Unable to load user data. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">
            Stay updated with important information
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden md:inline">Refresh</span>
          </Button>
          {(user.role === "admin" || user.role === "teacher") && (
            <Button size="sm" asChild className="flex items-center gap-1">
              <Link href="/announcements/create">
                <PlusCircle className="h-4 w-4" />
                Create Announcement
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Announcements</TabsTrigger>
          <TabsTrigger value="college">College</TabsTrigger>
          {user.role !== "admin" && (
            <TabsTrigger value="department">Department</TabsTrigger>
          )}
        </TabsList>

        {["all", "college", "department"].map(
          (tab) =>
            (tab !== "department" || user.role !== "admin") && (
              <TabsContent key={tab} value={tab} className="mt-0">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array(6)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="h-64">
                          <Skeleton className="h-full w-full" />
                        </div>
                      ))}
                  </div>
                ) : isError ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Failed to load announcements. Please try again later.
                      {error && (
                        <div className="mt-2 text-sm">
                          Error: {error.message}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ) : announcements.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No announcements available.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {announcements.map((announcement: Announcement) => (
                      <AnnouncementCard
                        key={announcement._id}
                        announcement={announcement}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            )
        )}
      </Tabs>
    </div>
  )
}
