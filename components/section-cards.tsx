import { Users, FileText, MessageSquare, Workflow, DollarSign } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards({
  totalUsers,
  totalPosts,
  totalComments,
  totalFlowcharts,
  publishedPosts,
  draftPosts,
  totalEarnings,
}: {
  totalUsers: number
  totalPosts: number
  totalComments: number
  totalFlowcharts: number
  publishedPosts: number
  draftPosts: number
  totalEarnings: number
}) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Registered users on platform</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPosts.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{publishedPosts} published, {draftPosts} drafts</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Comments</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalComments.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total user engagement</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Flowcharts</CardTitle>
          <Workflow className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFlowcharts.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Created flowcharts</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${(totalEarnings / 100).toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">From book purchases</p>
        </CardContent>
      </Card>
    </div>
  )
}
