import { JobPosting } from "@/types/student.types"
import { TabsContent } from "../../ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card"
import { Badge, BriefcaseIcon } from "lucide-react"
import { EmptyState } from "./EmptyState"

export const JobsTab = ({ jobs }: { jobs: JobPosting[] }) => (
  <TabsContent value="jobs" className="space-y-4">
    <h2 className="text-xl font-semibold">Job Opportunities</h2>
    {jobs.length > 0 ? (
      <div className="grid gap-4">
        {jobs.map((job: JobPosting) => (
          <Card key={job._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{job.companyName}</CardTitle>
                  <CardDescription>
                    Posted on {new Date(job.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge>New</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm line-clamp-3">{job.jobDescription}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-xs text-muted-foreground">
                Posted by {job.role === "admin" ? "Administration" : "Faculty"}
              </div>
              <a
                href={job.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Apply Now
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={BriefcaseIcon}
        title="No Job Postings"
        description="There are no job opportunities posted at the moment."
      />
    )}
  </TabsContent>
)
