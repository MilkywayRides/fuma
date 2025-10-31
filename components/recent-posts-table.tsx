"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, MessageSquare, Flame } from "lucide-react"

interface Post {
  id: number
  title: string
  published: boolean
  createdAt: Date
  authorName: string | null
}

interface Comment {
  id: number
  content: string
  authorName: string | null
  postTitle: string | null
  createdAt: Date
  likes: number
}

interface HypedMessage {
  id: number
  message: string
  userName: string | null
  createdAt: Date
  hypes: number
}

export function RecentPostsTable({ posts, comments, hypedMessages }: { posts: Post[]; comments: Comment[]; hypedMessages: HypedMessage[] }) {

  return (
    <div className="px-4 lg:px-6">
      <Tabs defaultValue="posts" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Latest posts, comments, and community messages</p>
          </div>
          <TabsList>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Posts</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Comments</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              <span className="hidden sm:inline">Community</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <Card className="shadow-sm overflow-hidden">
            <TabsContent value="posts" className="m-0 p-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No posts yet. Create your first post!
                        </TableCell>
                      </TableRow>
                    ) : (
                      posts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">{post.title}</TableCell>
                          <TableCell>{post.authorName || "Unknown"}</TableCell>
                          <TableCell>
                            <Badge variant={post.published ? "default" : "secondary"}>
                              {post.published ? "Published" : "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/posts/${post.id}/edit`}>Edit</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="comments" className="m-0 p-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Comment</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Post</TableHead>
                      <TableHead>Likes</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No comments yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      comments.map((comment) => (
                        <TableRow key={comment.id}>
                          <TableCell className="max-w-md truncate">{comment.content}</TableCell>
                          <TableCell>{comment.authorName || "Unknown"}</TableCell>
                          <TableCell className="max-w-xs truncate">{comment.postTitle || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{comment.likes}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="community" className="m-0 p-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Message</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Hypes</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hypedMessages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No community messages yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      hypedMessages.map((msg) => (
                        <TableRow key={msg.id}>
                          <TableCell className="max-w-md">{msg.message}</TableCell>
                          <TableCell>{msg.userName || "Unknown"}</TableCell>
                          <TableCell>
                            <Badge variant="default" className="gap-1">
                              <Flame className="h-3 w-3" />
                              {msg.hypes}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Card>
        </Tabs>
    </div>
  )
}
