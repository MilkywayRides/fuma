import { db } from '@/lib/db';
import { user, posts, comments, flowcharts, siteVisits } from '@/lib/db/schema';
import { sql, count, desc } from 'drizzle-orm';
import { DashboardStats } from '@/components/dashboard-stats';

export default async function AdminPage() {
  const [[totalUsers], [totalPosts], [totalComments], [totalFlowcharts]] = await Promise.all([
    db.select({ count: count() }).from(user),
    db.select({ count: count() }).from(posts),
    db.select({ count: count() }).from(comments),
    db.select({ count: count() }).from(flowcharts),
  ]);

  const [userStats] = await db.select({
    admins: sql<number>`count(*) filter (where ${user.role} = 'Admin')`,
    superAdmins: sql<number>`count(*) filter (where ${user.role} = 'SuperAdmin')`,
    banned: sql<number>`count(*) filter (where ${user.banned} = true)`,
    active: sql<number>`count(*) filter (where ${user.banned} = false)`,
  }).from(user);

  const [postStats] = await db.select({
    published: sql<number>`count(*) filter (where ${posts.published} = true)`,
    drafts: sql<number>`count(*) filter (where ${posts.published} = false)`,
  }).from(posts);

  const [flowStats] = await db.select({
    published: sql<number>`count(*) filter (where ${flowcharts.published} = true)`,
    drafts: sql<number>`count(*) filter (where ${flowcharts.published} = false)`,
  }).from(flowcharts);

  const topPosts = await db.select({
    id: posts.id,
    title: posts.title,
    commentCount: sql<number>`count(${comments.id})`,
  }).from(posts)
    .leftJoin(comments, sql`${comments.postId} = ${posts.id}`)
    .groupBy(posts.id, posts.title)
    .orderBy(sql`count(${comments.id}) desc`)
    .limit(5);

  const recentActivity = await db.select({
    id: posts.id,
    title: posts.title,
    published: posts.published,
    createdAt: posts.createdAt,
    authorName: user.name,
  }).from(posts)
    .leftJoin(user, sql`${posts.authorId} = ${user.id}`)
    .orderBy(desc(posts.createdAt))
    .limit(8);

  const activeUsers = await db.select({
    id: user.id,
    name: user.name,
    postCount: sql<number>`count(${posts.id})`,
  }).from(user)
    .leftJoin(posts, sql`${posts.authorId} = ${user.id}`)
    .groupBy(user.id, user.name)
    .orderBy(sql`count(${posts.id}) desc`)
    .limit(5);

  const commentActivity = await db.select({
    userId: user.id,
    userName: user.name,
    commentCount: sql<number>`count(${comments.id})`,
  }).from(user)
    .leftJoin(comments, sql`${comments.authorId} = ${user.id}`)
    .groupBy(user.id, user.name)
    .orderBy(sql`count(${comments.id}) desc`)
    .limit(5);

  const postEngagement = await db.select({
    postId: posts.id,
    title: posts.title,
    likes: sql<number>`sum(${comments.likes})`,
    dislikes: sql<number>`sum(${comments.dislikes})`,
  }).from(posts)
    .leftJoin(comments, sql`${comments.postId} = ${posts.id}`)
    .groupBy(posts.id, posts.title)
    .orderBy(sql`sum(${comments.likes}) desc`)
    .limit(5);

  const recentComments = await db.select({
    id: comments.id,
    content: comments.content,
    authorName: user.name,
    postTitle: posts.title,
    createdAt: comments.createdAt,
  }).from(comments)
    .leftJoin(user, sql`${comments.authorId} = ${user.id}`)
    .leftJoin(posts, sql`${comments.postId} = ${posts.id}`)
    .orderBy(desc(comments.createdAt))
    .limit(6);

  const growthData = await db.select({
    date: sql<string>`date_trunc('day', ${user.createdAt})`,
    userCount: sql<number>`count(*)`,
  }).from(user)
    .groupBy(sql`date_trunc('day', ${user.createdAt})`)
    .orderBy(sql`date_trunc('day', ${user.createdAt}) desc`)
    .limit(7);

  const trafficData = await db.select({
    date: sql<string>`date_trunc('day', ${siteVisits.createdAt})`,
    visits: sql<number>`count(*)`,
    uniqueVisitors: sql<number>`count(distinct ${siteVisits.ipAddress})`,
  }).from(siteVisits)
    .groupBy(sql`date_trunc('day', ${siteVisits.createdAt})`)
    .orderBy(sql`date_trunc('day', ${siteVisits.createdAt}) desc`)
    .limit(30);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your application</p>
      </div>
      <DashboardStats 
        totalUsers={totalUsers.count}
        totalPosts={totalPosts.count}
        totalComments={totalComments.count}
        totalFlowcharts={totalFlowcharts.count}
        userStats={userStats}
        postStats={postStats}
        flowStats={flowStats}
        topPosts={topPosts}
        recentActivity={recentActivity}
        activeUsers={activeUsers}
        commentActivity={commentActivity}
        postEngagement={postEngagement}
        recentComments={recentComments}
        growthData={growthData}
        trafficData={trafficData}
      />
    </div>
  );
}
