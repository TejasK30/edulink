import { Button } from "@/components/ui/button"
import { PlusCircle, RefreshCw } from "lucide-react"
import Link from "next/link"

interface AnnouncementsHeaderProps {
  canCreateAnnouncement: boolean
  onRefresh: () => void
}

export default function AnnouncementsHeader({
  canCreateAnnouncement,
  onRefresh,
}: AnnouncementsHeaderProps) {
  return (
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
          onClick={onRefresh}
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
  )
}
