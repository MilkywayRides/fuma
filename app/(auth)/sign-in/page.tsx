'use client';

import { SignInForm } from '@daveyplate/better-auth-ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { FaGoogle, FaGithub } from 'react-icons/fa';

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState('');

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
          {error && (
            <div className="p-3 rounded-md bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}
          <SignInForm localization={{}} />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: '/' })}
            >
              <FaGoogle className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => authClient.signIn.social({ provider: 'github', callbackURL: '/' })}
            >
              <FaGithub className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>
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
