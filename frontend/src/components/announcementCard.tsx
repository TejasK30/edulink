import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Announcement } from "@/lib/types"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { FC } from "react"

interface AnnouncementCardProps {
  announcement: Announcement
}

const AnnouncementCard: FC<AnnouncementCardProps> = ({ announcement }) => {
  const formattedDate = format(
    new Date(announcement.createdAt),
    "MMM dd, yyyy • h:mm a"
  )

  return (
    <Card className="h-full transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg md:text-xl line-clamp-2">
            {announcement.title}
          </CardTitle>
          <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize whitespace-nowrap">
            {announcement.authorRole}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="text-sm text-muted-foreground mb-2 flex items-center">
          <span className="font-medium">Description:</span>
          <span className="ml-1">{announcement.authorId.name}</span>
        </div>
        <div className="text-sm min-h-[60px] max-h-[120px] overflow-hidden text-ellipsis">
          {announcement.content}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex-col items-start gap-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <CalendarIcon className="h-3 w-3" />
          <span>{formattedDate}</span>
        </div>
      </CardFooter>
    </Card>
  )
}

export default AnnouncementCard
