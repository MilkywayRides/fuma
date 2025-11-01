'use client'

import { Home, Book, Coins, Crown, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { NavUser } from '@/components/nav-user'

const items = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'My Books', url: '/dashboard/books', icon: Book },
  { title: 'Credits', url: '/dashboard/credits', icon: Coins },
  { title: 'Subscription', url: '/dashboard/subscription', icon: Crown },
]

export function UserDashboardSidebar({ userData, isPro, emailCount, emailLimit }: { userData: any; isPro: boolean; emailCount?: number; emailLimit?: number }) {
  const pathname = usePathname()

  const user = {
    name: userData.name,
    email: userData.email,
    avatar: userData.image || '',
  }

  const userRole = userData.role
  const credits = userData.credits

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>User Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} isPro={isPro} userRole={userRole} credits={credits} emailCount={emailCount} emailLimit={emailLimit} />
      </SidebarFooter>
    </Sidebar>
  )
}
