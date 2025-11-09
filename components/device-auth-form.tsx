'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2 } from 'lucide-react'

export function DeviceAuthForm({ userId }: { userId: string }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [appName, setAppName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/oauth/device/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_code: code.toUpperCase(), user_id: userId }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setAppName(data.appName)
      } else {
        setError(data.error || 'Invalid code')
      }
    } catch (err) {
      setError('Failed to verify code')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <div>
            <h3 className="text-xl font-semibold">Authorization Successful!</h3>
            <p className="text-muted-foreground mt-2">
              You've authorized <strong>{appName}</strong>
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              You can close this window and return to your device.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Device Code</CardTitle>
        <CardDescription>
          Enter the 8-character code displayed on your device
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="XXXX-XXXX"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={8}
            className="text-center text-2xl tracking-widest"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || code.length !== 8}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Authorize'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
