"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Workflow, Settings, MessageSquare, Users, FileText, Megaphone, Code, GitBranch, Mail, Home, Plus } from "lucide-react"
import { APP_NAME } from "@/lib/config"
import { NavUser } from "@/components/nav-user"
import { Badge } from "@/components/ui/badge"
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"
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
import { useEmails } from "@/contexts/email-context"

export function AdminAppSidebar({ 
  userName, 
  userEmail, 
  developerMode,
  routeBadges = {},
  isPro = false,
  ...props 
}: { 
  userName: string
  userEmail: string
  developerMode?: boolean
  routeBadges?: Record<string, string>
  isPro?: boolean
} & React.ComponentProps<typeof Sidebar>) {
  const { emails: emailAddresses } = useEmails()
  const pathname = usePathname()

  const getRouteBadge = (href: string) => {
    return routeBadges[href] || null
  }

  const navMain = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, badge: getRouteBadge('/admin') },
    { href: '/admin/blogs', label: 'Blogs', icon: FileText, badge: getRouteBadge('/admin/blogs') },
    { href: '/admin/flow', label: 'Flowcharts', icon: Workflow, badge: getRouteBadge('/admin/flow') },
    { href: '/admin/scripts', label: 'Flow Scripts', icon: GitBranch, badge: getRouteBadge('/admin/scripts') },
    { href: '/admin/comments', label: 'Comments', icon: MessageSquare, badge: getRouteBadge('/admin/comments') },
    { href: '/admin/users', label: 'Users', icon: Users, badge: getRouteBadge('/admin/users') },
    { href: '/admin/ads', label: 'Advertisements', icon: Megaphone, badge: getRouteBadge('/admin/ads') },
    ...(developerMode ? [{ href: '/admin/developer', label: 'Developer API', icon: Code, badge: getRouteBadge('/admin/developer') }] : []),
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
                      <Link href={item.href} className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto px-1.5 py-0 h-5 relative overflow-hidden">
                            <span className="text-[10px] font-medium relative z-10">
                              {item.badge}
                            </span>
                            <span 
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              style={{
                                backgroundSize: '200% 100%',
                                animation: 'shimmer 2s infinite'
                              }}
                            />
                          </Badge>
                        )}
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
                            <span>Manage Email</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      {emailAddresses?.map((email) => (
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
        <NavUser user={{ name: userName, email: userEmail, avatar: "" }} isPro={isPro} />
      </SidebarFooter>
    </Sidebar>
  )
}
