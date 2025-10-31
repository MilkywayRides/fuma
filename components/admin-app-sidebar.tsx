"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Workflow, Settings, MessageSquare, Users, FileText, Megaphone, Code, GitBranch, Mail, Home, Plus } from "lucide-react"
import { APP_NAME } from "@/lib/config"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface EmailAddress {
  id: number
  uuid: string
  address: string
}

export function AdminAppSidebar({ 
  userName, 
  userEmail, 
  developerMode,
  ...props 
}: { 
  userName: string
  userEmail: string
  developerMode?: boolean
} & React.ComponentProps<typeof Sidebar>) {
  const [emailAddresses, setEmailAddresses] = React.useState<EmailAddress[]>([])
  const pathname = usePathname()

  React.useEffect(() => {
    fetch('/api/admin/emails')
      .then(res => res.json())
      .then(data => setEmailAddresses(data))
      .catch(() => {})
  }, [])

  const navMain = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/blogs', label: 'Blogs', icon: FileText },
    { href: '/admin/flow', label: 'Flowcharts', icon: Workflow },
    { href: '/admin/scripts', label: 'Flow Scripts', icon: GitBranch },
    { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/ads', label: 'Advertisements', icon: Megaphone },
    ...(developerMode ? [{ href: '/admin/developer', label: 'Developer API', icon: Code }] : []),
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="font-bold text-sm">B</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{APP_NAME}</span>
                  <span className="truncate text-xs text-muted-foreground">Admin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
              
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Mail">
                      <Mail />
                      <span>Mail</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/admin/mail'}>
                          <Link href="/admin/mail">
                            <Plus className="h-3 w-3" />
                            <span>Create Email</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      {emailAddresses.map((email) => (
                        <SidebarMenuSubItem key={email.uuid}>
                          <SidebarMenuSubButton 
                            asChild 
                            isActive={pathname === `/admin/mail/${email.uuid}`}
                          >
                            <Link href={`/admin/mail/${email.uuid}`} title={email.address}>
                              <span className="truncate">{email.address.split('@')[0]}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/settings'} tooltip="Settings">
                  <Link href="/admin/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <NavUser user={{ name: userName, email: userEmail, avatar: "" }} />
      </SidebarFooter>
    </Sidebar>
  )
}
