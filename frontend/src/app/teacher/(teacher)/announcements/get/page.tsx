"use client"

import AnnouncementCard from "@/components/announcementCard"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import api from "@/lib/api"
import { useAppStore } from "@/lib/store"
import { Announcement, PaginatedResponse } from "@/lib/types"
import { PlusCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { JSX, useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] =
    useState<PaginatedResponse<Announcement> | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser, setUser } = useAppStore()
  const limit = 6
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!currentUser) {
      const storedUser = localStorage.getItem("currentUser")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    }
  }, [currentUser, setUser])

  const buildEndpoint = (page: number): string => {
    const collegeId = currentUser?.collegeid || currentUser?.collegeid
    let endpoint = `/announcements/${collegeId}?page=${page}&limit=${limit}`
    if (activeTab === "college") {
      endpoint += "&type=college"
    } else if (activeTab === "department") {
      endpoint += "&type=department"
    }
    console.log("Built endpoint:", endpoint)
    return endpoint
  }

  const fetchAnnouncements = useCallback(
    async (page: number) => {
      if (!currentUser) return
      setIsLoading(true)
      setError(null)
      try {
        const endpoint = buildEndpoint(page)
        if (!endpoint) throw new Error("Endpoint is empty")
        const response = await api.get<PaginatedResponse<Announcement>>(
          endpoint
        )
        const newAnnouncements = response.data.data
        setAnnouncements((prev) =>
          prev && page > 1
            ? { ...response.data, data: [...prev.data, ...newAnnouncements] }
            : response.data
        )
        setTotalPages(response.data.pagination.pages)
      } catch (err: any) {
        console.error("Failed to fetch announcements:", err)
        setError("Failed to load announcements. Please try again later.")
        toast("Failed to load announcements. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    },
    [activeTab, currentUser]
  )

  useEffect(() => {
    if (currentUser) {
      setAnnouncements(null)
      setCurrentPage(1)
      fetchAnnouncements(1)
    }
  }, [activeTab, currentUser, fetchAnnouncements])

  useEffect(() => {
    if (isLoading || currentPage >= totalPages) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = currentPage + 1
          setCurrentPage(nextPage)
          fetchAnnouncements(nextPage)
        }
      },
      { threshold: 0.5 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [isLoading, currentPage, totalPages, fetchAnnouncements])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setAnnouncements(null)
    setCurrentPage(1)
  }

  const canCreateAnnouncement =
    currentUser?.role === "admin" || currentUser?.role === "teacher"

  return (
    <div className="container mx-auto px-4 py-8">
      {!currentUser ? (
        <div className="py-10 text-center">Loading user data...</div>
      ) : (
        <>
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
                onClick={() => {
                  setAnnouncements(null)
                  setCurrentPage(1)
                  fetchAnnouncements(1)
                }}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden md:inline">Refresh</span>
              </Button>
              {canCreateAnnouncement && (
                <Button size="sm" asChild className="flex items-center gap-1">
                  <Link href="/announcements/create">
                    <PlusCircle className="h-4 w-4" />
                    Create Announcement
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Announcements</TabsTrigger>
              <TabsTrigger value="college">College</TabsTrigger>
              {currentUser?.role !== "admin" && (
                <TabsTrigger value="department">Department</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {renderAnnouncementContent()}
            </TabsContent>
            <TabsContent value="college" className="mt-0">
              {renderAnnouncementContent()}
            </TabsContent>
            {currentUser?.role !== "admin" && (
              <TabsContent value="department" className="mt-0">
                {renderAnnouncementContent()}
              </TabsContent>
            )}
          </Tabs>

          <div ref={loadMoreRef} className="h-8"></div>
        </>
      )}
    </div>
  )

  function renderAnnouncementContent(): JSX.Element {
    if (isLoading && (!announcements || announcements.data.length === 0)) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-64">
                <Skeleton className="h-full w-full" />
              </div>
            ))}
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    if (!announcements || announcements.data.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No announcements available.</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {announcements.data.map((announcement: Announcement) => (
          <AnnouncementCard
            key={announcement._id}
            announcement={announcement}
          />
        ))}
      </div>
    )
  }
}
