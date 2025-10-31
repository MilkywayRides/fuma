'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Workflow, Settings, MessageSquare, Users, FileText, Megaphone, Menu, X, Code, GitBranch, Mail, ChevronDown, Plus, Home } from 'lucide-react';
import { APP_NAME } from '@/lib/config';
import { UserButton } from './user-button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EmailAddress {
  id: number;
  uuid: string;
  address: string;
}

export function AdminSidebar({ userName, userEmail, developerMode }: { userName: string; userEmail: string; developerMode?: boolean }) {
  const [emailAddresses, setEmailAddresses] = useState<EmailAddress[]>([]);
  const [mailExpanded, setMailExpanded] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch('/api/admin/emails')
      .then(res => res.json())
      .then(data => setEmailAddresses(data))
      .catch(() => {});
  }, []);

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/blogs', label: 'Blogs', icon: FileText },
    { href: '/admin/flow', label: 'Flowcharts', icon: Workflow },
    { href: '/admin/scripts', label: 'Flow Scripts', icon: GitBranch },
    { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/ads', label: 'Advertisements', icon: Megaphone },
    ...(developerMode ? [{ href: '/admin/developer', label: 'Developer API', icon: Code }] : []),
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background border"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all",
        collapsed ? "w-16" : "w-64",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4">
          {collapsed ? (
            <Link href="/" className="flex items-center justify-center w-full">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">B</span>
              </div>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">B</span>
              </div>
              <span className="text-sm">{APP_NAME}</span>
            </Link>
          )}
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
        <TooltipProvider>
        <nav className="space-y-1">
          <Link
            href="/"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Home className="h-4 w-4" />
            {!collapsed && <span>Home</span>}
          </Link>
          
          <Separator className="my-3" />
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
            return collapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : link;
          })}
          
          <Separator className="my-3" />
          
          <div className="space-y-1">
            <button
              onClick={() => setMailExpanded(!mailExpanded)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                pathname.startsWith('/admin/mail')
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Mail className="h-4 w-4" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">Mail</span>
                  <ChevronDown className={cn('h-4 w-4 transition-transform', !mailExpanded && '-rotate-90')} />
                </>
              )}
            </button>
            {mailExpanded && !collapsed && (
              <div className="ml-7 mt-1 space-y-0.5 border-l pl-3">
                <Link
                  href="/admin/mail"
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
                    pathname === '/admin/mail'
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Plus className="h-3 w-3" />
                  <span>Create</span>
                </Link>
                {emailAddresses.map((email) => (
                  <Link
                    key={email.uuid}
                    href={`/admin/mail/${email.uuid}`}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
                      pathname === `/admin/mail/${email.uuid}`
                        ? 'bg-secondary text-secondary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    title={email.address}
                  >
                    <span className="truncate text-xs">{email.address.split('@')[0]}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <Separator className="my-3" />
          
          <Link
            href="/admin/settings"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              pathname === '/admin/settings'
                ? 'bg-secondary text-secondary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Settings className="h-4 w-4" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </nav>
        </TooltipProvider>
        </ScrollArea>

        <div className="border-t p-3">
          <UserButton name={userName} email={userEmail} variant={collapsed ? "icon" : "wide"} />
        </div>
      </div>
    </aside>

    {isOpen && (
      <div
        className="lg:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
    )}
    </>
  );
}
