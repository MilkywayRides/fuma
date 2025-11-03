import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';

if (typeof window !== 'undefined') {
  console.log('Auth client baseURL:', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
}

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
