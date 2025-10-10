'use client';

import { Users, FileText, MessageSquare, Workflow, TrendingUp, Activity } from 'lucide-react';

interface UserStats {
  admins: number;
  superAdmins: number;
  banned: number;
  active: number;
}

interface PostStats {
  published: number;
  drafts: number;
}

interface FlowStats {
  published: number;
  drafts: number;
}

interface TopPost {
  id: number;
  title: string;
  commentCount: number;
}

interface RecentActivity {
  id: number;
  title: string;
  published: boolean;
  createdAt: Date;
  authorName: string | null;
}

interface ActiveUser {
  id: string;
  name: string;
  postCount: number;
}

interface CommentActivity {
  userId: string;
  userName: string;
  commentCount: number;
}

interface PostEngagement {
  postId: number;
  title: string;
  likes: number;
  dislikes: number;
}

interface RecentComment {
  id: number;
  content: string;
  authorName: string | null;
  postTitle: string | null;
  createdAt: Date;
}

interface GrowthData {
  date: string;
  userCount: number;
}

interface TrafficData {
  date: string;
  visits: number;
  uniqueVisitors: number;
}

export function DashboardStats({ 
  totalUsers,
  totalPosts,
  totalComments,
  totalFlowcharts,
  userStats, 
  postStats,
  flowStats,
  topPosts,
  recentActivity,
  activeUsers,
  commentActivity,
  postEngagement,
  recentComments,
  growthData,
  trafficData,
}: { 
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalFlowcharts: number;
  userStats: UserStats;
  postStats: PostStats;
  flowStats: FlowStats;
  topPosts: TopPost[];
  recentActivity: RecentActivity[];
  activeUsers: ActiveUser[];
  commentActivity: CommentActivity[];
  postEngagement: PostEngagement[];
  recentComments: RecentComment[];
  growthData: GrowthData[];
  trafficData: TrafficData[];
}) {
  const overviewData = [
    { name: 'Users', value: totalUsers, color: '#3b82f6' },
    { name: 'Posts', value: totalPosts, color: '#10b981' },
    { name: 'Comments', value: totalComments, color: '#f59e0b' },
    { name: 'Flowcharts', value: totalFlowcharts, color: '#8b5cf6' },
  ];

  const userRoleData = [
    { name: 'Active Users', value: userStats.active, color: '#10b981' },
    { name: 'Admins', value: userStats.admins, color: '#3b82f6' },
    { name: 'Super Admins', value: userStats.superAdmins, color: '#8b5cf6' },
    { name: 'Banned', value: userStats.banned, color: '#ef4444' },
  ];

  const maxValue = Math.max(...overviewData.map(d => d.value));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold">{totalUsers}</p>
            </div>
            <Users className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="border rounded-lg p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Posts</p>
              <p className="text-3xl font-bold">{totalPosts}</p>
            </div>
            <FileText className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="border rounded-lg p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Comments</p>
              <p className="text-3xl font-bold">{totalComments}</p>
            </div>
            <MessageSquare className="h-10 w-10 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        <div className="border rounded-lg p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Flowcharts</p>
              <p className="text-3xl font-bold">{totalFlowcharts}</p>
            </div>
            <Workflow className="h-10 w-10 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      <TrafficChart data={trafficData} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Content Overview
          </h3>
          <div className="space-y-4">
            {overviewData.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm font-bold">{item.value}</span>
                </div>
                <div className="flex-1 bg-muted rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all" 
                    style={{ 
                      width: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Distribution
          </h3>
          <div className="flex items-center justify-center h-48">
            <div className="relative w-48 h-48">
              {userRoleData.map((item, index) => {
                const total = userRoleData.reduce((sum, d) => sum + d.value, 0);
                const percentage = (item.value / total) * 100;
                const prevPercentage = userRoleData.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 100, 0);
                return (
                  <div
                    key={item.name}
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(${item.color} ${prevPercentage}% ${prevPercentage + percentage}%, transparent ${prevPercentage + percentage}%)`,
                    }}
                  />
                );
              })}
              <div className="absolute inset-8 bg-background rounded-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold">{totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {userRoleData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Posts by Comments
          </h3>
          <div className="space-y-3">
            {topPosts.map((post, index) => (
              <div key={post.id} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground">{post.commentCount} comments</p>
                </div>
                <div className="w-16 h-2 bg-muted rounded-full">
                  <div 
                    className="h-2 bg-primary rounded-full"
                    style={{ width: `${(post.commentCount / Math.max(...topPosts.map(p => p.commentCount))) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Most Active Authors
          </h3>
          <div className="space-y-3">
            {activeUsers.map((user, index) => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.postCount} posts</p>
                </div>
                <div className="w-16 h-2 bg-muted rounded-full">
                  <div 
                    className="h-2 bg-green-600 rounded-full"
                    style={{ width: `${(user.postCount / Math.max(...activeUsers.map(u => u.postCount))) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Post Status</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <span className="text-sm">Published</span>
                <span className="text-sm font-bold">{postStats.published}</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-600" style={{ width: `${(postStats.published / (postStats.published + postStats.drafts)) * 100}%` }} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <span className="text-sm">Drafts</span>
                <span className="text-sm font-bold">{postStats.drafts}</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gray-600" style={{ width: `${(postStats.drafts / (postStats.published + postStats.drafts)) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Flowchart Status</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <span className="text-sm">Published</span>
                <span className="text-sm font-bold">{flowStats.published}</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-purple-600" style={{ width: `${(flowStats.published / (flowStats.published + flowStats.drafts)) * 100}%` }} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <span className="text-sm">Drafts</span>
                <span className="text-sm font-bold">{flowStats.drafts}</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gray-600" style={{ width: `${(flowStats.drafts / (flowStats.published + flowStats.drafts)) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </h3>
        <div className="space-y-2">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors">
              <div className={`w-2 h-2 rounded-full ${activity.published ? 'bg-green-600' : 'bg-gray-600'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.title}</p>
                <p className="text-xs text-muted-foreground">
                  by {activity.authorName} • {new Date(activity.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                activity.published ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }`}>
                {activity.published ? 'Published' : 'Draft'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Most Active Commenters
          </h3>
          <div className="space-y-3">
            {commentActivity.map((user, index) => (
              <div key={user.userId} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.userName}</p>
                  <p className="text-xs text-muted-foreground">{user.commentCount} comments</p>
                </div>
                <div className="w-16 h-2 bg-muted rounded-full">
                  <div 
                    className="h-2 bg-orange-600 rounded-full"
                    style={{ width: `${(user.commentCount / Math.max(...commentActivity.map(u => u.commentCount))) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Most Liked Posts
          </h3>
          <div className="space-y-3">
            {postEngagement.map((post, index) => (
              <div key={post.postId} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{post.title}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>👍 {post.likes}</span>
                    <span>👎 {post.dislikes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Recent Comments
        </h3>
        <div className="space-y-3">
          {recentComments.map((comment) => (
            <div key={comment.id} className="p-3 border rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{comment.authorName}</span>
                <span className="text-xs text-muted-foreground">on</span>
                <span className="text-xs text-muted-foreground truncate">{comment.postTitle}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{comment.content}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(comment.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          User Growth (Last 7 Days)
        </h3>
        <div className="flex items-end justify-between gap-2 h-48">
          {growthData.reverse().map((day) => {
            const maxCount = Math.max(...growthData.map(d => d.userCount));
            const height = maxCount > 0 ? (day.userCount / maxCount) * 100 : 0;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs font-bold">{day.userCount}</div>
                <div 
                  className="w-full bg-blue-600 rounded-t transition-all hover:bg-blue-700"
                  style={{ height: `${height}%` }}
                />
                <div className="text-xs text-muted-foreground">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import React from 'react';

const chartConfig = {
  visits: {
    label: 'Total Visits',
    color: 'hsl(var(--chart-1))',
  },
  uniqueVisitors: {
    label: 'Unique Visitors',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

function TrafficChart({ data }: { data: TrafficData[] }) {
  const [xAxis, setXAxis] = React.useState<number | null>(null);
  
  const chartData = data.reverse().map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    visits: d.visits,
    uniqueVisitors: d.uniqueVisitors,
  }));

  if (data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Site Traffic</CardTitle>
          <CardDescription>Total visits and unique visitors over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No traffic data yet. Visit some pages to start tracking.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Site Traffic</CardTitle>
        <CardDescription>Total visits and unique visitors over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart
            data={chartData}
            width="100%"
            onMouseMove={(e) => setXAxis(e.chartX as number)}
            onMouseLeave={() => setXAxis(null)}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="grad-visits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-visits)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-visits)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="grad-unique" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-uniqueVisitors)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-uniqueVisitors)" stopOpacity={0} />
              </linearGradient>
              {xAxis && (
                <linearGradient id="mask-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="50%" stopColor="white" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              )}
              {xAxis && (
                <mask id="highlight-mask">
                  <rect x={xAxis - 150} y={0} width={300} height="100%" fill="url(#mask-grad)" />
                </mask>
              )}
            </defs>
            <Area
              dataKey="uniqueVisitors"
              type="natural"
              fill="url(#grad-unique)"
              stroke="var(--color-uniqueVisitors)"
              stackId="a"
              strokeWidth={0.8}
              mask={xAxis ? 'url(#highlight-mask)' : undefined}
            />
            <Area
              dataKey="visits"
              type="natural"
              fill="url(#grad-visits)"
              stroke="var(--color-visits)"
              stackId="a"
              strokeWidth={0.8}
              mask={xAxis ? 'url(#highlight-mask)' : undefined}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
