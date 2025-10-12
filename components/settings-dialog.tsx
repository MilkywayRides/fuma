'use client';

import { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UserIcon, ShieldIcon, X, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  email: string;
  image?: string | null;
}

export function SettingsDialog({ open, onOpenChange, name, email, image }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className={cn(
          "fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%]",
          "w-[90vw] max-w-[1200px] h-[85vh] max-h-[700px]",
          "bg-background rounded-lg border shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "flex flex-col"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b shrink-0">
            <DialogPrimitive.Title className="text-xl font-semibold">Settings</DialogPrimitive.Title>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-60 border-r p-6 space-y-1.5">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'profile' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserIcon className="h-4 w-4" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'security' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <ShieldIcon className="h-4 w-4" />
                Security
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-10">
              {activeTab === 'profile' && (
                <div className="space-y-8 max-w-2xl">
                  <div className="flex items-center gap-5">
                    {image ? (
                      <img src={image} alt={name} className="h-20 w-20 rounded-full ring-2 ring-border" />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-xl ring-2 ring-border">
                        {initials}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold">Profile Picture</p>
                      <p className="text-sm text-muted-foreground mt-0.5">Synced from your OAuth provider</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                      <Input id="name" defaultValue={name} className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <Input id="email" type="email" defaultValue={email} disabled className="h-10" />
                      <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-8 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10 px-6">Cancel</Button>
                    <Button className="h-10 px-6">Save changes</Button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-10 max-w-2xl">
                  {/* Password Section */}
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-base font-semibold">Password</h4>
                      <p className="text-sm text-muted-foreground mt-1">Change your password</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password" className="text-sm font-medium">Current password</Label>
                        <Input id="current-password" type="password" className="h-10" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password" className="text-sm font-medium">New password</Label>
                        <Input id="new-password" type="password" className="h-10" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm password</Label>
                        <Input id="confirm-password" type="password" className="h-10" />
                      </div>
                      <Button className="h-10 px-6 mt-2">Update password</Button>
                    </div>
                  </div>

                  {/* Sessions Section */}
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-base font-semibold">Sessions</h4>
                      <p className="text-sm text-muted-foreground mt-1">Manage your active sessions</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-accent/30">
                        <div className="flex items-center gap-3">
                          <Monitor className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Current session</p>
                            <p className="text-sm text-muted-foreground">Active now</p>
                          </div>
                        </div>
                        <span className="text-sm text-green-600 dark:text-green-400 font-semibold">●</span>
                      </div>
                      <Button variant="outline" className="w-full h-10">Sign out all sessions</Button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-base font-semibold">Two-factor authentication</h4>
                      <p className="text-sm text-muted-foreground mt-1">Add extra security to your account</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Not enabled</p>
                          <p className="text-sm text-muted-foreground mt-0.5">Protect your account with 2FA</p>
                        </div>
                        <Button variant="outline" className="h-10 px-6">Enable</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
