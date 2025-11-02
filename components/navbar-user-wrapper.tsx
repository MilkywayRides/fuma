import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { NavbarUserDropdown } from './navbar-user-dropdown'
import { Button } from './ui/button'
import Link from 'next/link'

export async function NavbarUserWrapper() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return (
      <Button asChild variant="ghost" size="sm">
        <Link href="/sign-in">Sign In</Link>
      </Button>
    )
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    avatar: session.user.image || '',
  }

  return (
    <NavbarUserDropdown 
      user={user} 
      userRole={session.user.role || 'User'}
      credits={session.user.credits}
    />
  )
}
