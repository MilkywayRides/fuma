'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function RevokeAccessButton({ tokenId, appName }: { tokenId: number; appName: string }) {
  const [isRevoking, setIsRevoking] = useState(false)
  const router = useRouter()

  const handleRevoke = async () => {
    setIsRevoking(true)
    try {
      const res = await fetch('/api/oauth/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId }),
      })

      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to revoke access:', error)
    } finally {
      setIsRevoking(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isRevoking}>
          {isRevoking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Revoke'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke access for {appName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will immediately revoke all access tokens for this application. The app will no longer be able to access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRevoke} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Revoke Access
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
