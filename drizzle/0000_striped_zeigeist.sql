CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adClicks" (
	"id" integer PRIMARY KEY NOT NULL,
	"adId" integer NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adViews" (
	"id" integer PRIMARY KEY NOT NULL,
	"adId" integer NOT NULL,
	"ipAddress" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "advertisements" (
	"id" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"link" text,
	"imageUrl" text,
	"position" text DEFAULT 'sidebar' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "apiKeys" (
	"id" integer PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"userId" text NOT NULL,
	"lastUsed" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "apiKeys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "chatMessages" (
	"id" integer PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"role" text NOT NULL,
	"userId" text NOT NULL,
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commentReactions" (
	"id" integer PRIMARY KEY NOT NULL,
	"commentId" integer NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" integer PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"postId" integer NOT NULL,
	"authorId" text NOT NULL,
	"parentId" integer,
	"likes" integer DEFAULT 0 NOT NULL,
	"dislikes" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "directMessages" (
	"id" integer PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"fromId" text NOT NULL,
	"toId" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flowExecution" (
	"id" serial PRIMARY KEY NOT NULL,
	"flowId" text NOT NULL,
	"status" text NOT NULL,
	"startedAt" timestamp NOT NULL,
	"completedAt" timestamp,
	"error" text,
	"logs" text,
	"triggeredById" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flowScript" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"published" boolean DEFAULT false NOT NULL,
	"nodes" text NOT NULL,
	"edges" text NOT NULL,
	"createdById" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"lastExecutedAt" timestamp,
	"executionCount" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flowchartEmbeds" (
	"id" integer PRIMARY KEY NOT NULL,
	"flowchartId" text NOT NULL,
	"userId" text NOT NULL,
	"referrer" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flowcharts" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"data" text NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"authorId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"published" boolean DEFAULT false NOT NULL,
	"authorId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "siteVisits" (
	"id" integer PRIMARY KEY NOT NULL,
	"userId" text,
	"ipAddress" text,
	"userAgent" text,
	"path" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"onboardingEnabled" boolean DEFAULT true NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"role" text DEFAULT 'User' NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"developerMode" boolean DEFAULT false NOT NULL,
	"onboardingCompleted" boolean DEFAULT false NOT NULL,
	"userType" text,
	"phoneNumber" text,
	"phoneVerified" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp,
	"updatedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adClicks" ADD CONSTRAINT "adClicks_adId_advertisements_id_fk" FOREIGN KEY ("adId") REFERENCES "public"."advertisements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adViews" ADD CONSTRAINT "adViews_adId_advertisements_id_fk" FOREIGN KEY ("adId") REFERENCES "public"."advertisements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apiKeys" ADD CONSTRAINT "apiKeys_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatMessages" ADD CONSTRAINT "chatMessages_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commentReactions" ADD CONSTRAINT "commentReactions_commentId_comments_id_fk" FOREIGN KEY ("commentId") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commentReactions" ADD CONSTRAINT "commentReactions_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_user_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "directMessages" ADD CONSTRAINT "directMessages_fromId_user_id_fk" FOREIGN KEY ("fromId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "directMessages" ADD CONSTRAINT "directMessages_toId_user_id_fk" FOREIGN KEY ("toId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flowExecution" ADD CONSTRAINT "flowExecution_flowId_flowScript_id_fk" FOREIGN KEY ("flowId") REFERENCES "public"."flowScript"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flowExecution" ADD CONSTRAINT "flowExecution_triggeredById_user_id_fk" FOREIGN KEY ("triggeredById") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flowScript" ADD CONSTRAINT "flowScript_createdById_user_id_fk" FOREIGN KEY ("createdById") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flowchartEmbeds" ADD CONSTRAINT "flowchartEmbeds_flowchartId_flowcharts_id_fk" FOREIGN KEY ("flowchartId") REFERENCES "public"."flowcharts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flowchartEmbeds" ADD CONSTRAINT "flowchartEmbeds_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flowcharts" ADD CONSTRAINT "flowcharts_authorId_user_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_user_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "siteVisits" ADD CONSTRAINT "siteVisits_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;