import AnnouncementCard from "@/components/announcementCard"
import { Announcement } from "@/lib/types"

interface AnnouncementsListProps {
  announcements: Announcement[]
}

export default function AnnouncementsList({
  announcements,
}: AnnouncementsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {announcements.map((announcement: Announcement) => (
        <AnnouncementCard key={announcement._id} announcement={announcement} />
      ))}
    </div>
  )
}
