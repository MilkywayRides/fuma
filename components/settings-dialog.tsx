'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UserIcon, ShieldIcon, Monitor, Loader2, Github, Mail, Code2, Copy, Trash2, Plus, Check, X, CreditCard, Smartphone, Laptop } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useDeveloperMode } from '@/contexts/developer-mode-context';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name?: string;
  email?: string;
  image?: string | null;
}

export function SettingsDialog(props: SettingsDialogProps) {
  const { 
    open = false, 
    onOpenChange = () => {}, 
    name = '', 
    email = '', 
    image = null 
  } = props || {};
  
  const safeName = typeof name === 'string' ? name : '';
  const safeEmail = typeof email === 'string' ? email : '';
  
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [provider, setProvider] = React.useState<string>('email');
  const [sessionsCount, setSessionsCount] = React.useState(1);
  const [deviceInfo, setDeviceInfo] = React.useState<string>('');
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [profileName, setProfileName] = React.useState(safeName);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const { developerMode, setDeveloperMode: setGlobalDeveloperMode } = useDeveloperMode();
  const [localDeveloperMode, setLocalDeveloperMode] = React.useState(developerMode);
  const [apiKeys, setApiKeys] = React.useState<any[]>([]);
  const [newKeyName, setNewKeyName] = React.useState('');
  const [generatedKey, setGeneratedKey] = React.useState('');
  const [subscriptionData, setSubscriptionData] = React.useState<any>(null);
  
  const { toast } = useToast();
  
  const initials = React.useMemo(() => {
    if (!safeName || typeof safeName !== 'string') return '';
    try {
      return safeName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    } catch {
      return '';
    }
  }, [safeName]);

  React.useEffect(() => {
    if (open) {
      fetchUserData();
      fetchSubscription();
      detectDevice();
    }
  }, [open]);

  const detectDevice = () => {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) {
      setDeviceInfo('Mobile');
    } else if (/tablet/i.test(ua)) {
      setDeviceInfo('Tablet');
    } else {
      setDeviceInfo('Desktop');
    }
  };

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      setProvider(data?.provider || 'email');
      setSessionsCount(data?.sessionsCount || 1);
      setProfileName(data?.user?.name || safeName);
      setLocalDeveloperMode(data?.user?.developerMode || false);
      if (data?.user?.developerMode) {
        fetchApiKeys();
      }
      
      const sessionsRes = await fetch('/api/user/sessions');
      const sessionsData = await sessionsRes.json();
      setSessions(sessionsData?.sessions || []);
    } catch (error) {
      if (toast) {
        toast({ title: 'Error', description: 'Failed to load user data', variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscription/status');
      const data = await res.json();
      setSubscriptionData(data);
    } catch (error) {
      console.error('Failed to fetch subscription');
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName }),
      });
      if (res.ok) {
        toast({ title: 'Success', description: 'Profile updated successfully' });
        window.location.reload();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        toast({ title: 'Success', description: 'Password updated successfully' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast({ title: 'Error', description: 'Invalid current password', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update password', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const res = await fetch('/api/api-keys');
      if (!res.ok) {
        throw new Error('Failed to fetch API keys');
      }
      const data = await res.json();
      setApiKeys(Array.isArray(data?.keys) ? data.keys : []);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      setApiKeys([]);
      toast({
        title: 'Error',
        description: 'Failed to fetch API keys',
        variant: 'destructive'
      });
    }
  };

  const handleToggleDeveloperMode = async (checked: boolean) => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ developerMode: checked }),
      });
      if (res.ok) {
        setLocalDeveloperMode(checked);
        setGlobalDeveloperMode(checked);
        if (checked) {
          fetchApiKeys();
        }
        toast({ title: 'Success', description: `Developer mode ${checked ? 'enabled' : 'disabled'}` });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update developer mode', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({ title: 'Error', description: 'Please enter a key name', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedKey(data.key);
        setNewKeyName('');
        fetchApiKeys();
        toast({ title: 'Success', description: 'API key created successfully' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create API key', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteApiKey = async (id: number) => {
    setSaving(true);
    try {
      const res = await fetch('/api/api-keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchApiKeys();
        toast({ title: 'Success', description: 'API key deleted' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete API key', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOutAll = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/sessions', { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Success', description: 'Signed out from all sessions' });
        window.location.href = '/sign-in';
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to sign out', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const isPro = subscriptionData?.active;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className={cn(
          "fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%]",
          "w-[90vw] max-w-[1100px] h-[75vh]",
          "bg-background rounded-lg border shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "flex flex-col"
        )}>
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b">
            <div>
              <DialogPrimitive.Title className="text-xl font-semibold">Settings</DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm text-muted-foreground mt-1">Manage your account settings and preferences</DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DialogPrimitive.Close>
          </div>
        <Tabs defaultValue="profile" className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="lg:w-48 border-b lg:border-b-0 lg:border-r">
            <TabsList className="flex lg:flex-col h-auto w-full bg-transparent p-2 gap-1">
              <TabsTrigger value="profile" className="w-full justify-start gap-2">
                <UserIcon className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="w-full justify-start gap-2">
                <ShieldIcon className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="subscription" className="w-full justify-start gap-2">
                <CreditCard className="h-4 w-4" />
                Subscription
              </TabsTrigger>
              <TabsTrigger value="developer" className="w-full justify-start gap-2">
                <Code2 className="h-4 w-4" />
                Developer
              </TabsTrigger>
            </TabsList>
          </div>
          <ScrollArea className="flex-1">
            <div className="px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <TabsContent value="profile" className="space-y-6 mt-0">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={image || ''} alt={name} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Profile Picture</p>
                      <p className="text-sm text-muted-foreground">
                        {provider === 'google' && 'Synced from Google'}
                        {provider === 'github' && 'Synced from GitHub'}
                        {provider === 'email' && 'Default avatar'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} disabled />
                      <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Connected Account</Label>
                      <div className="flex items-center gap-2 p-3 border rounded-lg bg-accent/30">
                        {provider === 'google' && <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
                        {provider === 'github' && <Github className="h-5 w-5" />}
                        {provider === 'email' && <Mail className="h-5 w-5" />}
                        <span className="text-sm font-medium capitalize">{provider}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Save changes
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-base font-semibold">Password</h4>
                      <p className="text-sm text-muted-foreground">{provider === 'email' ? 'Change your password' : 'Password change not available for OAuth accounts'}</p>
                    </div>
                    {provider === 'email' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current password</Label>
                          <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New password</Label>
                          <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm password</Label>
                          <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                        <Button onClick={handleChangePassword} disabled={saving}>
                          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                          Update password
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-base font-semibold">Sessions</h4>
                      <p className="text-sm text-muted-foreground">{sessionsCount} active session{sessionsCount > 1 ? 's' : ''}</p>
                    </div>
                    <div className="space-y-3">
                      {sessions.length > 0 ? (
                        sessions.map((session, index) => (
                          <div key={session.id || index} className="flex items-center justify-between p-4 border rounded-lg bg-accent/30">
                            <div className="flex items-center gap-3">
                              {session.userAgent?.includes('Mobile') ? (
                                <Smartphone className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <Laptop className="h-5 w-5 text-muted-foreground" />
                              )}
                              <div>
                                <p className="text-sm font-medium">{index === 0 ? 'Current session' : `Session ${index + 1}`}</p>
                                <p className="text-sm text-muted-foreground">
                                  {session.userAgent?.includes('Mobile') ? 'Mobile' : 'Desktop'} • {index === 0 ? 'Active now' : new Date(session.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm text-green-600 dark:text-green-400 font-semibold">●</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-accent/30">
                          <div className="flex items-center gap-3">
                            {deviceInfo === 'Mobile' ? (
                              <Smartphone className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Laptop className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div>
                              <p className="text-sm font-medium">Current session</p>
                              <p className="text-sm text-muted-foreground">{deviceInfo} • Active now</p>
                            </div>
                          </div>
                          <span className="text-sm text-green-600 dark:text-green-400 font-semibold">●</span>
                        </div>
                      )}
                      <Button onClick={handleSignOutAll} disabled={saving} variant="outline" className="w-full">
                        {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Sign out all sessions
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="subscription" className="space-y-6 mt-0">
                  <div>
                    <h3 className="text-lg font-semibold">Current Plan</h3>
                    <p className="text-sm text-muted-foreground">Choose the plan that works best for you</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className={cn("relative", !isPro && "border-primary")}>
                      {!isPro && <Badge className="absolute top-4 right-4">Current</Badge>}
                      <CardHeader>
                        <CardTitle>Free</CardTitle>
                        <CardDescription>For getting started</CardDescription>
                        <div className="mt-4">
                          <span className="text-3xl font-bold">$0</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          <span className="text-sm">2 email addresses</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          <span className="text-sm">Basic features</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" disabled={!isPro}>Current Plan</Button>
                      </CardFooter>
                    </Card>
                    <Card className={cn("relative", isPro && "border-primary")}>
                      {isPro && <Badge className="absolute top-4 right-4">Current</Badge>}
                      <CardHeader>
                        <CardTitle>Pro</CardTitle>
                        <CardDescription>For power users</CardDescription>
                        <div className="mt-4">
                          <span className="text-3xl font-bold">$9</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          <span className="text-sm">10 email addresses</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          <span className="text-sm">All features</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          <span className="text-sm">Priority support</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        {isPro ? (
                          <Button variant="outline" className="w-full" asChild>
                            <a href="/admin/subscription">Manage</a>
                          </Button>
                        ) : (
                          <Button className="w-full" asChild>
                            <a href="/admin/subscription">Upgrade</a>
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="developer" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-base font-semibold">Developer Mode</h4>
                      <p className="text-sm text-muted-foreground">Enable developer features and API access</p>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Enable Developer Mode</p>
                        <p className="text-sm text-muted-foreground">Access API keys and developer documentation</p>
                      </div>
                      <Switch checked={localDeveloperMode} onCheckedChange={handleToggleDeveloperMode} disabled={saving} />
                    </div>
                  </div>

                  {localDeveloperMode && (
                    <>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-base font-semibold">API Keys</h4>
                          <p className="text-sm text-muted-foreground">Manage your API keys for programmatic access</p>
                        </div>
                        
                        {generatedKey && (
                          <div className="p-4 border rounded-lg bg-accent/30">
                            <p className="text-sm font-medium mb-2">Your new API key (save it now, it won't be shown again):</p>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 p-2 bg-background rounded border text-sm font-mono break-all">{generatedKey}</code>
                              <Button size="sm" variant="outline" onClick={() => {
                                navigator.clipboard.writeText(generatedKey);
                                toast({ title: 'Copied', description: 'API key copied to clipboard' });
                              }}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Key name (e.g., Production API)" 
                              value={newKeyName}
                              onChange={(e) => setNewKeyName(e.target.value)}
                            />
                            <Button onClick={handleCreateApiKey} disabled={saving}>
                              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            </Button>
                          </div>

                          {apiKeys.length > 0 ? (
                            <div className="space-y-2">
                              {apiKeys.map((key) => (
                                <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">{key.name}</p>
                                    <p className="text-xs text-muted-foreground font-mono truncate">{key.key}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Created {new Date(key.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => handleDeleteApiKey(key.id)}
                                    disabled={saving}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No API keys yet</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-base font-semibold">API Documentation</h4>
                          <p className="text-sm text-muted-foreground">Learn how to use the API</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm">View full API documentation at <a href="/admin/developer" className="text-primary hover:underline">/admin/developer</a></p>
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>
              </>
            )}
            </div>
          </ScrollArea>
        </Tabs>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
