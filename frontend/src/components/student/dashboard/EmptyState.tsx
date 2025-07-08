import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "../../ui/card"

export const EmptyState = ({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex flex-col items-center justify-center text-center p-6">
        <Icon size={48} className="text-green-500 mb-4" />
        <h3 className="text-xl font-medium mb-1">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </CardContent>
  </Card>
)
