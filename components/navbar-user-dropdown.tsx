'use client'

import { useState, useEffect } from 'react'
import {
  IconCreditCard,
  IconLogout,
  IconUserCircle,
  IconSettings,
} from '@tabler/icons-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { SettingsDialog } from '@/components/settings-dialog'

export function NavbarUserDropdown({
  user,
  userRole = 'User',
  credits,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
  userRole?: string
  credits?: number
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 's') {
        e.preventDefault()
        setSettingsOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              {credits !== undefined && (
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  {credits} credits
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
              <IconUserCircle className="mr-2 h-4 w-4" />
              Account
              <span className="ml-auto text-xs text-muted-foreground">Alt+S</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              window.history.replaceState({}, '', '?tab=subscription')
              setSettingsOpen(true)
            }}>
              <IconCreditCard className="mr-2 h-4 w-4" />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/dashboard">
                <IconSettings className="mr-2 h-4 w-4" />
                Dashboard
              </a>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => window.location.href = '/api/auth/sign-out'}>
            <IconLogout className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
        name={user.name}
        email={user.email}
        image={user.avatar}
      />
    </>
  )
}
