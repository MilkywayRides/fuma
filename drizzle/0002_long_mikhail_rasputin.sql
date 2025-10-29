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
CREATE TABLE "emailAddresses" (
	"id" integer PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"userId" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
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
ALTER TABLE "posts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "posts" CASCADE;--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_postId_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "chatMessages" ADD COLUMN "hypes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "blogPosts" ADD CONSTRAINT "blogPosts_authorId_user_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emailAddresses" ADD CONSTRAINT "emailAddresses_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_emailAddressId_emailAddresses_id_fk" FOREIGN KEY ("emailAddressId") REFERENCES "public"."emailAddresses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sentEmails" ADD CONSTRAINT "sentEmails_emailAddressId_emailAddresses_id_fk" FOREIGN KEY ("emailAddressId") REFERENCES "public"."emailAddresses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_blogPosts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."blogPosts"("id") ON DELETE cascade ON UPDATE no action;