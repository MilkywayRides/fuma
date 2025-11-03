'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Mail, Link as LinkIcon } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
}

export function EmailVerification({ email, onVerified }: EmailVerificationProps) {
  const [method, setMethod] = useState<'otp' | 'magic-link' | null>(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sendOTP = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/user/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSuccess('OTP sent to your email');
        setMethod('otp');
      } else {
        setError('Failed to send OTP');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sendMagicLink = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/user/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSuccess('Magic link sent to your email. Please check your inbox.');
        setMethod('magic-link');
      } else {
        setError('Failed to send magic link');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/user/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      if (res.ok) {
        onVerified();
      } else {
        setError('Invalid OTP');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!method) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            Choose how you'd like to verify {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}
          <Button
            onClick={sendOTP}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            <Mail className="mr-2 h-4 w-4" />
            Verify with OTP
          </Button>
          <Button
            onClick={sendMagicLink}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            Verify with Magic Link
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (method === 'magic-link') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            We've sent a magic link to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success && (
            <div className="p-3 rounded-md bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm">
              {success}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Click the link in your email to verify your account. You can close this page.
          </p>
          <Button
            onClick={() => setMethod(null)}
            variant="outline"
            className="w-full"
          >
            Try Another Method
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Enter OTP</CardTitle>
        <CardDescription>
          Enter the code sent to {email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <div className="p-3 rounded-md bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm mb-4">
            {success}
          </div>
        )}
        {error && (
          <div className="p-3 rounded-md bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm mb-4">
            {error}
          </div>
        )}
        <form onSubmit={verifyOTP} className="space-y-4">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={loading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
          <Button
            type="button"
            onClick={() => setMethod(null)}
            variant="outline"
            className="w-full"
          >
            Try Another Method
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
