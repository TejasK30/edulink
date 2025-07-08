import { Alert, AlertDescription } from "@/components/ui/alert"

interface AnnouncementsErrorProps {
  error: any
}

export default function AnnouncementsError({ error }: AnnouncementsErrorProps) {
  return (
    <Alert variant="destructive">
      <AlertDescription>
        {error?.message ||
          "Failed to load announcements. Please try again later."}
      </AlertDescription>
    </Alert>
  )
}
