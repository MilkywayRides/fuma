'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/lib/auth-client';
import { Spinner } from '@/components/ui/spinner';

export default function DeviceVerificationPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [userCode, setUserCode] = useState(searchParams.get('user_code') || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!session) {
      window.location.href = '/sign-in?callbackURL=' + encodeURIComponent(window.location.href);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/oauth/device/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_code: userCode.toUpperCase() }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto max-w-md mt-20">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Device Verified!</CardTitle>
            <CardDescription>
              Your CLI application has been successfully authorized. You can now return to your terminal.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md mt-20">
      <Card>
        <CardHeader>
          <CardTitle>Authorize CLI Application</CardTitle>
          <CardDescription>
            Enter the 6-character code displayed in your CLI application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter 6-character code"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="text-center text-lg font-mono"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button 
            onClick={handleVerify} 
            disabled={loading || userCode.length !== 6}
            className="w-full"
          >
            {loading ? <Spinner size="sm" /> : 'Authorize Application'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
