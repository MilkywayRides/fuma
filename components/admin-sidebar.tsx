'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Workflow, Settings, MessageSquare, Users, FileText, Megaphone, Menu, X, Code } from 'lucide-react';
import { APP_NAME } from '@/lib/config';
import { UserButton } from './user-button';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/blogs', label: 'Blogs', icon: FileText },
  { href: '/admin/flow', label: 'Flowcharts', icon: Workflow },
  { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/ads', label: 'Advertisements', icon: Megaphone },
  { href: '/admin/developer', label: 'Developer API', icon: Code },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar({ userName, userEmail }: { userName: string; userEmail: string }) {
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
        </nav>

        <div className="border-t p-4">
          <UserButton name={userName} email={userEmail} />
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
