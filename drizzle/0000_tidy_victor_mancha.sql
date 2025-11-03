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
CREATE TABLE "blogPosts" (
	"id" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"slug" text NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"authorId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blogPosts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "bookPages" (
	"id" integer PRIMARY KEY NOT NULL,
	"bookId" integer NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookPurchases" (
	"id" integer PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"bookId" integer NOT NULL,
	"creditsSpent" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookReviews" (
	"id" integer PRIMARY KEY NOT NULL,
	"bookId" integer NOT NULL,
	"userId" text NOT NULL,
	"rating" integer NOT NULL,
	"review" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" integer PRIMARY KEY NOT NULL,
	"uuid" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"published" boolean DEFAULT false NOT NULL,
	"premium" boolean DEFAULT false NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"authorId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "books_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "chatMessages" (
	"id" integer PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"role" text NOT NULL,
	"userId" text NOT NULL,
	"metadata" text,
	"hypes" integer DEFAULT 0 NOT NULL,
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
CREATE TABLE "emailAddresses" (
	"id" integer PRIMARY KEY NOT NULL,
	"uuid" text NOT NULL,
	"address" text NOT NULL,
	"userId" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "emailAddresses_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "emailAddresses_address_unique" UNIQUE("address")
);
--> statement-breakpoint
CREATE TABLE "emails" (
	"id" integer PRIMARY KEY NOT NULL,
	"emailAddressId" integer NOT NULL,
	"from" text NOT NULL,
	"to" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"html" text,
	"read" boolean DEFAULT false NOT NULL,
	"starred" boolean DEFAULT false NOT NULL,
	"folder" text DEFAULT 'inbox' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flowExecution" (
	"id" integer PRIMARY KEY NOT NULL,
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
CREATE TABLE "oauthApiLogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"applicationId" integer NOT NULL,
	"endpoint" text NOT NULL,
	"method" text NOT NULL,
	"statusCode" integer NOT NULL,
	"ipAddress" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauthApplications" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" text NOT NULL,
	"clientId" text NOT NULL,
	"clientSecret" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"homepageUrl" text NOT NULL,
	"callbackUrl" text NOT NULL,
	"userId" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"allowedScopes" text DEFAULT 'profile,email' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oauthApplications_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "oauthApplications_clientId_unique" UNIQUE("clientId")
);
--> statement-breakpoint
CREATE TABLE "oauthAuthorizationCodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"applicationId" integer NOT NULL,
	"userId" text NOT NULL,
	"redirectUri" text NOT NULL,
	"scope" text DEFAULT 'read' NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oauthAuthorizationCodes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "oauthTokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"accessToken" text NOT NULL,
	"refreshToken" text NOT NULL,
	"applicationId" integer NOT NULL,
	"userId" text NOT NULL,
	"scope" text DEFAULT 'read' NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"refreshExpiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oauthTokens_accessToken_unique" UNIQUE("accessToken"),
	CONSTRAINT "oauthTokens_refreshToken_unique" UNIQUE("refreshToken")
);
--> statement-breakpoint
CREATE TABLE "sentEmails" (
	"id" integer PRIMARY KEY NOT NULL,
	"emailAddressId" integer NOT NULL,
	"to" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"html" text,
	"status" text DEFAULT 'sent' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
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
CREATE TABLE "subscriptionPlans" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"credits" integer DEFAULT 0 NOT NULL,
	"unlimitedBooks" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" integer PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"provider" text NOT NULL,
	"subscriptionId" text NOT NULL,
	"productId" text NOT NULL,
	"planId" integer,
	"status" text NOT NULL,
	"currentPeriodStart" timestamp NOT NULL,
	"currentPeriodEnd" timestamp NOT NULL,
	"cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
	"emailLimit" integer DEFAULT 2 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_subscriptionId_unique" UNIQUE("subscriptionId")
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
	"credits" integer DEFAULT 0 NOT NULL,
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
ALTER TABLE "blogPosts" ADD CONSTRAINT "blogPosts_authorId_user_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookPages" ADD CONSTRAINT "bookPages_bookId_books_id_fk" FOREIGN KEY ("bookId") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookPurchases" ADD CONSTRAINT "bookPurchases_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookPurchases" ADD CONSTRAINT "bookPurchases_bookId_books_id_fk" FOREIGN KEY ("bookId") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookReviews" ADD CONSTRAINT "bookReviews_bookId_books_id_fk" FOREIGN KEY ("bookId") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookReviews" ADD CONSTRAINT "bookReviews_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_authorId_user_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatMessages" ADD CONSTRAINT "chatMessages_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commentReactions" ADD CONSTRAINT "commentReactions_commentId_comments_id_fk" FOREIGN KEY ("commentId") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commentReactions" ADD CONSTRAINT "commentReactions_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_blogPosts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."blogPosts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_user_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "directMessages" ADD CONSTRAINT "directMessages_fromId_user_id_fk" FOREIGN KEY ("fromId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "directMessages" ADD CONSTRAINT "directMessages_toId_user_id_fk" FOREIGN KEY ("toId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emailAddresses" ADD CONSTRAINT "emailAddresses_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_emailAddressId_emailAddresses_id_fk" FOREIGN KEY ("emailAddressId") REFERENCES "public"."emailAddresses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flowExecution" ADD CONSTRAINT "flowExecution_flowId_flowScript_id_fk" FOREIGN KEY ("flowId") REFERENCES "public"."flowScript"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flowExecution" ADD CONSTRAINT "flowExecution_triggeredById_user_id_fk" FOREIGN KEY ("triggeredById") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flowScript" ADD CONSTRAINT "flowScript_createdById_user_id_fk" FOREIGN KEY ("createdById") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flowchartEmbeds" ADD CONSTRAINT "flowchartEmbeds_flowchartId_flowcharts_id_fk" FOREIGN KEY ("flowchartId") REFERENCES "public"."flowcharts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flowchartEmbeds" ADD CONSTRAINT "flowchartEmbeds_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flowcharts" ADD CONSTRAINT "flowcharts_authorId_user_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauthApiLogs" ADD CONSTRAINT "oauthApiLogs_applicationId_oauthApplications_id_fk" FOREIGN KEY ("applicationId") REFERENCES "public"."oauthApplications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauthApplications" ADD CONSTRAINT "oauthApplications_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauthAuthorizationCodes" ADD CONSTRAINT "oauthAuthorizationCodes_applicationId_oauthApplications_id_fk" FOREIGN KEY ("applicationId") REFERENCES "public"."oauthApplications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauthAuthorizationCodes" ADD CONSTRAINT "oauthAuthorizationCodes_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauthTokens" ADD CONSTRAINT "oauthTokens_applicationId_oauthApplications_id_fk" FOREIGN KEY ("applicationId") REFERENCES "public"."oauthApplications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauthTokens" ADD CONSTRAINT "oauthTokens_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sentEmails" ADD CONSTRAINT "sentEmails_emailAddressId_emailAddresses_id_fk" FOREIGN KEY ("emailAddressId") REFERENCES "public"."emailAddresses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "siteVisits" ADD CONSTRAINT "siteVisits_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_subscriptionPlans_id_fk" FOREIGN KEY ("planId") REFERENCES "public"."subscriptionPlans"("id") ON DELETE no action ON UPDATE no action;