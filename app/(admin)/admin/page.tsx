import { db } from '@/lib/db';
import { user, blogPosts, comments, flowcharts, siteVisits, flowchartEmbeds } from '@/lib/db/schema';
import { sql, count, desc } from 'drizzle-orm';
import { DashboardStats } from '@/components/dashboard-stats';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Admin',
};

// Force dynamic rendering so Next.js doesn't try to prerender this page at build
// time and run database queries against an unavailable dev database.
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [[totalUsers], [totalPosts], [totalComments], [totalFlowcharts]] = await Promise.all([
    db.select({ count: count() }).from(user),
    db.select({ count: count() }).from(blogPosts),
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
    published: sql<number>`count(*) filter (where ${blogPosts.published} = true)`,
    drafts: sql<number>`count(*) filter (where ${blogPosts.published} = false)`,
  }).from(blogPosts);

  const [flowStats] = await db.select({
    published: sql<number>`count(*) filter (where ${flowcharts.published} = true)`,
    drafts: sql<number>`count(*) filter (where ${flowcharts.published} = false)`,
  }).from(flowcharts);

  const topPosts = await db.select({
    id: blogPosts.id,
    title: blogPosts.title,
    commentCount: sql<number>`count(${comments.id})`,
  }).from(blogPosts)
    .leftJoin(comments, sql`${comments.postId} = ${blogPosts.id}`)
    .groupBy(blogPosts.id, blogPosts.title)
    .orderBy(sql`count(${comments.id}) desc`)
    .limit(5);

  const recentActivity = await db.select({
    id: blogPosts.id,
    title: blogPosts.title,
    published: blogPosts.published,
    createdAt: blogPosts.createdAt,
    authorName: user.name,
  }).from(blogPosts)
    .leftJoin(user, sql`${blogPosts.authorId} = ${user.id}`)
    .orderBy(desc(blogPosts.createdAt))
    .limit(8);

  const activeUsers = await db.select({
    id: user.id,
    name: user.name,
    postCount: sql<number>`count(${blogPosts.id})`,
  }).from(user)
    .leftJoin(blogPosts, sql`${blogPosts.authorId} = ${user.id}`)
    .groupBy(user.id, user.name)
    .orderBy(sql`count(${blogPosts.id}) desc`)
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
    postId: blogPosts.id,
    title: blogPosts.title,
    likes: sql<number>`sum(${comments.likes})`,
    dislikes: sql<number>`sum(${comments.dislikes})`,
  }).from(blogPosts)
    .leftJoin(comments, sql`${comments.postId} = ${blogPosts.id}`)
    .groupBy(blogPosts.id, blogPosts.title)
    .orderBy(sql`sum(${comments.likes}) desc`)
    .limit(5);

  const recentComments = await db.select({
    id: comments.id,
    content: comments.content,
    authorName: user.name,
    postTitle: blogPosts.title,
    createdAt: comments.createdAt,
  }).from(comments)
    .leftJoin(user, sql`${comments.authorId} = ${user.id}`)
    .leftJoin(blogPosts, sql`${comments.postId} = ${blogPosts.id}`)
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

  const embedStats = await db.select({
    flowchartId: flowcharts.id,
    flowchartTitle: flowcharts.title,
    userName: user.name,
    embedCount: sql<number>`count(${flowchartEmbeds.id})`,
  }).from(flowchartEmbeds)
    .leftJoin(flowcharts, sql`${flowchartEmbeds.flowchartId} = ${flowcharts.id}`)
    .leftJoin(user, sql`${flowchartEmbeds.userId} = ${user.id}`)
    .groupBy(flowcharts.id, flowcharts.title, user.name)
    .orderBy(sql`count(${flowchartEmbeds.id}) desc`)
    .limit(10);

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
        embedStats={embedStats}
      />
    </div>
  );
}
