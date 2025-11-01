"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
  IconCrown,
  IconMoon,
  IconSun,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { SettingsDialog } from "@/components/settings-dialog"

export function NavUser({
  user,
  isPro = false,
  userRole,
  credits,
  emailCount,
  emailLimit,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
  isPro?: boolean
  userRole?: string
  credits?: number
  emailCount?: number
  emailLimit?: number
}) {
  const { isMobile } = useSidebar()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault()
        window.history.replaceState({}, '', '?tab=profile')
        setSettingsOpen(true)
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        window.history.replaceState({}, '', '?tab=subscription')
        setSettingsOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="relative">
                <Avatar className="h-8 w-8 rounded-lg grayscale">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                {isPro && (
                  <div className="absolute -top-2 -right-1 rotate-12">
                    <IconCrown className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  </div>
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                  {userRole === 'User' && credits !== undefined && (
                    <Progress value={Math.min(((250 - credits) / 250) * 100, 100)} className="h-1 mt-1" />
                  )}
                  {userRole === 'Admin' && !isPro && emailCount !== undefined && emailLimit !== undefined && (
                    <Progress value={Math.min((emailCount / emailLimit) * 100, 100)} className="h-1 mt-1" />
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => {
                window.history.replaceState({}, '', '?tab=profile')
                setSettingsOpen(true)
              }}>
                <IconUserCircle />
                Account
                <span className="ml-auto text-xs text-muted-foreground">⌘A</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                window.history.replaceState({}, '', '?tab=subscription')
                setSettingsOpen(true)
              }}>
                <IconCreditCard />
                Billing
                <span className="ml-auto text-xs text-muted-foreground">⌘⇧S</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <IconSun /> : <IconMoon />}
                {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/api/auth/sign-out">
                <IconLogout />
                Log out
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <SettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
        name={user.name}
        email={user.email}
        image={user.avatar}
      />
    </SidebarMenu>
  )
}
