"use client"

import AnnouncementsEmpty from "@/components/student/announcementpage/AnnouncementEmptyState"
import AnnouncementsError from "@/components/student/announcementpage/AnnouncementError"
import AnnouncementsHeader from "@/components/student/announcementpage/AnnouncementHeader"
import AnnouncementsList from "@/components/student/announcementpage/AnnouncementList"
import AnnouncementsSkeleton from "@/components/student/announcementpage/AnnouncementSkeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import api from "@/lib/api"
import { useAuth } from "@/lib/auth-provider"
import { Announcement, PaginatedResponse } from "@/lib/types"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"

export default function AnnouncementsPage() {
  const { user: currentUser } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState<"all" | "college" | "department">(
    "all"
  )
  const [accumulatedData, setAccumulatedData] = useState<Announcement[]>([])
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const limit = 6

  // Build API endpoint
  const buildEndpoint = (page: number) => {
    const collegeId = currentUser?.collegeId
    let endpoint = `/announcements/${collegeId}?page=${page}&limit=${limit}`
    if (activeTab === "college") {
      endpoint += "&type=college"
    } else if (activeTab === "department") {
      endpoint += "&type=department"
    }
    return endpoint
  }

  // React‑Query fetch
  const {
    data: announcements,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<PaginatedResponse<Announcement>, Error>({
    queryKey: ["announcements", currentUser?.collegeId, activeTab, currentPage],
    queryFn: async () => {
      if (!currentUser) throw new Error("No user")
      const res = await api.get<PaginatedResponse<Announcement>>(
        buildEndpoint(currentPage)
      )
      return res.data
    },
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })

  // Accumulate pages
  useEffect(() => {
    if (!announcements) return
    if (currentPage === 1) {
      setAccumulatedData(announcements.data)
    } else {
      setAccumulatedData((prev) => [...prev, ...announcements.data])
    }
  }, [announcements, currentPage])

  // Reset on tab change
  useEffect(() => {
    setCurrentPage(1)
    setAccumulatedData([])
  }, [activeTab])

  // Infinite scroll
  useEffect(() => {
    if (isLoading || isFetching || !announcements) return
    const total = announcements.pagination.pages
    if (currentPage >= total) return

    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setCurrentPage((p) => p + 1),
      { threshold: 0.5 }
    )

    if (loadMoreRef.current) obs.observe(loadMoreRef.current)
    return () => {
      if (loadMoreRef.current) obs.unobserve(loadMoreRef.current)
    }
  }, [isLoading, isFetching, announcements, currentPage])

  const handleTabChange = (value: string) => {
    setActiveTab(value as any)
  }
  const handleRefresh = () => {
    setCurrentPage(1)
    setAccumulatedData([])
    refetch()
  }
  const canCreate =
    currentUser?.role === "admin" || currentUser?.role === "teacher"

  if (!currentUser) {
    return <div className="py-10 text-center">Loading user data...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AnnouncementsHeader
        canCreateAnnouncement={canCreate}
        onRefresh={handleRefresh}
      />

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Announcements</TabsTrigger>
          <TabsTrigger value="college">College</TabsTrigger>
          {currentUser.role !== "admin" && (
            <TabsTrigger value="department">Department</TabsTrigger>
          )}
        </TabsList>

        {["all", "college", "department"].map(
          (tab) =>
            (tab !== "department" || currentUser.role !== "admin") && (
              <TabsContent key={tab} value={tab} className="mt-0">
                <AnnouncementContent
                  announcements={announcements}
                  isLoading={isLoading && currentPage === 1}
                  error={error}
                  accumulatedData={accumulatedData}
                  isFetching={isFetching}
                />
              </TabsContent>
            )
        )}
      </Tabs>

      <div ref={loadMoreRef} className="h-8" />
    </div>
  )
}

// ——————————————————————————————————————————————
// Child component handles all the display logic
interface AnnouncementContentProps {
  announcements?: PaginatedResponse<Announcement>
  isLoading: boolean
  error: any
  accumulatedData: Announcement[]
  isFetching: boolean
}

function AnnouncementContent({
  announcements,
  isLoading,
  error,
  accumulatedData,
  isFetching,
}: AnnouncementContentProps) {
  // fallback to page 1 data if nothing has been accumulated yet
  const firstPage = announcements?.data ?? []
  const allData = accumulatedData.length > 0 ? accumulatedData : firstPage

  if (isLoading) {
    return <AnnouncementsSkeleton />
  }
  if (error) {
    return <AnnouncementsError error={error} />
  }
  if (allData.length === 0 && !isFetching) {
    return <AnnouncementsEmpty />
  }

  return (
    <div>
      <AnnouncementsList announcements={allData} />
      {isFetching && (
        <div className="mt-4">
          <AnnouncementsSkeleton count={3} />
        </div>
      )}
    </div>
  )
}
