'use client';

import { User, LogOut, Home, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { signOut } from '@/lib/auth-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SettingsDialog } from './settings-dialog';

interface UserButtonProps {
  name: string;
  email: string;
  image?: string | null;
  variant?: 'compact' | 'wide';
}

export function UserButton({ name, email, image, variant = 'compact' }: UserButtonProps) {
  const [showSettings, setShowSettings] = useState(false);
  const initials = (name || '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        setShowSettings(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (variant === 'wide') {
    return (
      <>
        <SettingsDialog open={showSettings} onOpenChange={setShowSettings} name={name} email={email} image={image} />
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full rounded-lg p-2 hover:bg-accent transition-colors focus:outline-none">
          <div className="flex items-center gap-3">
            {image ? (
              <img
                src={image}
                alt={name}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                {initials}
              </div>
            )}
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">{name}</div>
              <div className="text-xs text-muted-foreground truncate">{email}</div>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <div className="text-sm font-medium">{name}</div>
            <div className="text-xs text-muted-foreground">{email}</div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              View Blog
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowSettings(true)} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </div>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">Alt</span>S
            </kbd>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={async () => {
            await signOut();
            window.location.href = '/sign-in';
          }} className="flex items-center gap-2 text-destructive">
            <LogOut className="h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </>
    );
  }

  return (
    <>
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} name={name} email={email} image={image} />
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
        {image ? (
          <img
            src={image}
            alt={name}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
            {initials}
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <div className="text-sm font-medium">{name}</div>
          <div className="text-xs text-muted-foreground">{email}</div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            View Blog
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowSettings(true)} className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </div>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">Alt</span>S
          </kbd>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={async () => {
          await signOut();
          window.location.href = '/sign-in';
        }} className="flex items-center gap-2 text-destructive">
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );
}
