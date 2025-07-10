import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Job } from "@/types/admin.types"
import { formatDate } from "@/lib/dashboard/utils"

export default function JobPostings({ postings }: { postings: Job[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">Recent Job Postings</h2>
        <Button size="sm">Add New Posting</Button>
      </div>
      {postings.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No job postings available
          </CardContent>
        </Card>
      ) : (
        postings.map((job) => (
          <Card key={job._id}>
            <CardHeader>
              <div className="flex justify-between w-full">
                <CardTitle>{job.companyName}</CardTitle>
                <Badge variant="outline">{formatDate(job.createdAt)}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {job.jobDescription.length > 200
                  ? `${job.jobDescription.slice(0, 200)}…`
                  : job.jobDescription}
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={job.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apply Link
                  </a>
                </Button>
                <Button size="sm">Edit Posting</Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
