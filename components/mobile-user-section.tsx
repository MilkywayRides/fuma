'use client'

import { useSession } from '@/lib/auth-client'
import { UserButton } from './user-button'
import { Button } from './ui/button'
import Link from 'next/link'
import { LogIn } from 'lucide-react'

export function MobileUserSection({ onClose }: { onClose: () => void }) {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!session?.user) {
    return (
      <Button asChild className="w-full" onClick={onClose}>
        <Link href="/sign-in" className="flex items-center gap-2">
          <LogIn className="h-4 w-4" />
          Sign In
        </Link>
      </Button>
    )
  }

  return (
    <div onClick={onClose}>
      <UserButton 
        name={session.user.name} 
        email={session.user.email} 
        image={session.user.image} 
        variant="wide" 
      />
    </div>
  )
}
