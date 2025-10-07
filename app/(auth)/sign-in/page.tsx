'use client';

import { SignInForm } from '@daveyplate/better-auth-ui';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>
          <SignInForm />
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/sign-up" className="font-medium underline underline-offset-4 hover:text-primary">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:flex lg:flex-1 bg-muted items-center justify-center p-8">
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-bold">Welcome to Blog</h2>
          <p className="text-muted-foreground">
            Access your admin dashboard to create and manage your blog posts.
          </p>
        </div>
      </div>
    </div>
  );
}
