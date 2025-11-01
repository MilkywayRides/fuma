import { db } from '@/lib/db';
import { user, blogPosts, comments, flowcharts, siteVisits, chatMessages, bookPurchases, sentEmails } from '@/lib/db/schema';
import { count, sql, desc, sum } from 'drizzle-orm';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { EarningsChart } from '@/components/earnings-chart';
import { EmailsChart } from '@/components/emails-chart';
import { SectionCards } from '@/components/section-cards';
import { RecentPostsTable } from '@/components/recent-posts-table';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Admin',
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  let totalUsers: any, totalPosts: any, totalComments: any, totalFlowcharts: any, totalEarnings: any, postStats: any, trafficData: any[] = [], earningsData: any[] = [], emailsData: any[] = [], recentPosts: any[] = [], recentComments: any[] = [], hypedMessages: any[] = [];

  try {
    [[totalUsers], [totalPosts], [totalComments], [totalFlowcharts], [totalEarnings]] = await Promise.all([
      db.select({ count: count() }).from(user),
      db.select({ count: count() }).from(blogPosts),
      db.select({ count: count() }).from(comments),
      db.select({ count: count() }).from(flowcharts),
      db.select({ total: sql<number>`COALESCE(SUM(${bookPurchases.creditsSpent}), 0)` }).from(bookPurchases),
    ]);
  } catch (error) {
    totalUsers = { count: 0 };
    totalPosts = { count: 0 };
    totalComments = { count: 0 };
    totalFlowcharts = { count: 0 };
    totalEarnings = { total: 0 };
  }

  try {
    const postStatsResult = await db.select({
      published: sql<number>`count(*) filter (where ${blogPosts.published} = true)`,
      drafts: sql<number>`count(*) filter (where ${blogPosts.published} = false)`,
    }).from(blogPosts);
    postStats = postStatsResult[0] || { published: 0, drafts: 0 };
  } catch (error) {
    postStats = { published: 0, drafts: 0 };
  }

  try {
    trafficData = await db.select({
      date: sql<string>`date_trunc('day', ${siteVisits.createdAt})`,
      visits: sql<number>`count(*)`,
      uniqueVisitors: sql<number>`count(distinct ${siteVisits.ipAddress})`,
    }).from(siteVisits)
      .groupBy(sql`date_trunc('day', ${siteVisits.createdAt})`)
      .orderBy(sql`date_trunc('day', ${siteVisits.createdAt}) desc`)
      .limit(90);
  } catch (error) {
    trafficData = [];
  }

  try {
    earningsData = await db.select({
      date: sql<string>`date_trunc('day', ${bookPurchases.createdAt})`,
      earnings: sql<number>`SUM(${bookPurchases.creditsSpent})`,
    }).from(bookPurchases)
      .groupBy(sql`date_trunc('day', ${bookPurchases.createdAt})`)
      .orderBy(sql`date_trunc('day', ${bookPurchases.createdAt}) desc`)
      .limit(90);
  } catch (error) {
    earningsData = [];
  }

  try {
    emailsData = await db.select({
      date: sql<string>`date_trunc('day', ${sentEmails.createdAt})`,
      emails: sql<number>`count(*)`,
    }).from(sentEmails)
      .groupBy(sql`date_trunc('day', ${sentEmails.createdAt})`)
      .orderBy(sql`date_trunc('day', ${sentEmails.createdAt}) desc`)
      .limit(90);
  } catch (error) {
    emailsData = [];
  }

  try {
    recentPosts = await db.select({
      id: blogPosts.id,
      title: blogPosts.title,
      published: blogPosts.published,
      createdAt: blogPosts.createdAt,
      authorName: user.name,
    }).from(blogPosts)
      .leftJoin(user, sql`${blogPosts.authorId} = ${user.id}`)
      .orderBy(desc(blogPosts.createdAt))
      .limit(10);
  } catch (error) {
    recentPosts = [];
  }

  try {
    recentComments = await db.select({
      id: comments.id,
      content: comments.content,
      authorName: user.name,
      postTitle: blogPosts.title,
      createdAt: comments.createdAt,
      likes: comments.likes,
    }).from(comments)
      .leftJoin(user, sql`${comments.authorId} = ${user.id}`)
      .leftJoin(blogPosts, sql`${comments.postId} = ${blogPosts.id}`)
      .orderBy(desc(comments.createdAt))
      .limit(10);
  } catch (error) {
    recentComments = [];
  }

  try {
    hypedMessages = await db.select({
      id: chatMessages.id,
      content: chatMessages.content,
      userName: user.name,
      createdAt: chatMessages.createdAt,
    }).from(chatMessages)
      .leftJoin(user, sql`${chatMessages.userId} = ${user.id}`)
      .orderBy(desc(chatMessages.createdAt))
      .limit(10);
  } catch (error) {
    hypedMessages = [];
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards 
          totalUsers={totalUsers?.count || 0}
          totalPosts={totalPosts?.count || 0}
          totalComments={totalComments?.count || 0}
          totalFlowcharts={totalFlowcharts?.count || 0}
          publishedPosts={postStats?.published || 0}
          draftPosts={postStats?.drafts || 0}
          totalEarnings={totalEarnings?.total || 0}
        />
        <div className="px-4 lg:px-6 space-y-4">
          <ChartAreaInteractive data={trafficData || []} />
          <div className="grid gap-4 md:grid-cols-2">
            <EarningsChart data={earningsData || []} />
            <EmailsChart data={emailsData || []} />
          </div>
        </div>
        <RecentPostsTable posts={recentPosts || []} comments={recentComments || []} hypedMessages={hypedMessages || []} />
      </div>
    </div>
  );
}
