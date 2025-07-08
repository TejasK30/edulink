import { Skeleton } from "@/components/ui/skeleton"

interface AnnouncementsSkeletonProps {
  count?: number
}

export default function AnnouncementsSkeleton({
  count = 6,
}: AnnouncementsSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="h-64">
            <Skeleton className="h-full w-full" />
          </div>
        ))}
    </div>
  )
}
