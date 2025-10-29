'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Workflow, Settings, MessageSquare, Users, FileText, Megaphone, Menu, X, Code, GitBranch, Mail, ChevronDown, ChevronRight } from 'lucide-react';
import { APP_NAME } from '@/lib/config';
import { UserButton } from './user-button';

interface EmailAddress {
  id: number;
  uuid: string;
  address: string;
}

export function AdminSidebar({ userName, userEmail, developerMode }: { userName: string; userEmail: string; developerMode?: boolean }) {
  const [emailAddresses, setEmailAddresses] = useState<EmailAddress[]>([]);
  const [mailExpanded, setMailExpanded] = useState(false);

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
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background border"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background transition-transform",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" aria-label="Logo">
              <circle cx={12} cy={12} r={12} fill="currentColor" />
            </svg>
            {APP_NAME}
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          
          <div>
            <button
              onClick={() => setMailExpanded(!mailExpanded)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                pathname.startsWith('/admin/mail')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Mail className="h-4 w-4" />
              <span className="flex-1 text-left">Mail</span>
              {mailExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {mailExpanded && (
              <div className="ml-7 mt-1 space-y-1">
                <Link
                  href="/admin/mail"
                  className={cn(
                    'block rounded-lg px-3 py-2 text-sm transition-colors',
                    pathname === '/admin/mail'
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  Create Email
                </Link>
                {emailAddresses.map((email) => (
                  <Link
                    key={email.uuid}
                    href={`/admin/mail/${email.uuid}`}
                    className={cn(
                      'block rounded-lg px-3 py-2 text-sm transition-colors truncate',
                      pathname === `/admin/mail/${email.uuid}`
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    title={email.address}
                  >
                    {email.address.split('@')[0]}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="border-t p-4">
          <UserButton name={userName} email={userEmail} variant="wide" />
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
