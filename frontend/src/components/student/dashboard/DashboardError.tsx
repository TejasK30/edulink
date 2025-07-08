import { AlertCircleIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"

export const ErrorCard = ({ error }: { error: string }) => (
  <Card className="border-red-200 bg-red-50">
    <CardHeader>
      <CardTitle className="text-red-600 flex items-center">
        <AlertCircleIcon className="mr-2" size={20} />
        Error Loading Dashboard
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-red-600">{error}</p>
    </CardContent>
  </Card>
)
