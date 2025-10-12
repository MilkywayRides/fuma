import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { db } from './db';
import * as schema from './db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'User',
        required: false,
      },
      banned: {
        type: 'boolean',
        defaultValue: false,
        required: false,
      },
    },
  },
  plugins: [
    admin({
      defaultRole: 'User',
    }),
  ],
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;

export async function hasAdminAccess(userId: string | undefined) {
  if (!userId) return false;
  const userRecord = await db.query.user.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });
  if (userRecord?.banned) return false;
  return userRecord?.role === 'Admin' || userRecord?.role === 'SuperAdmin';
}
