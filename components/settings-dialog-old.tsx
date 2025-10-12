'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UserIcon, ShieldIcon, X, Monitor, Loader2, Github, Mail, Code2, Copy, Trash2, Plus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  email: string;
  image?: string | null;
}

export function SettingsDialog({ open, onOpenChange, name = '', email = '', image }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = React.useState<'profile' | 'security' | 'developer'>('profile');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [provider, setProvider] = React.useState<string>('email');
  const [sessionsCount, setSessionsCount] = React.useState(1);
  const [profileName, setProfileName] = React.useState(name);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [developerMode, setDeveloperMode] = React.useState(false);
  const [apiKeys, setApiKeys] = React.useState<any[]>([]);
  const [newKeyName, setNewKeyName] = React.useState('');
  const [generatedKey, setGeneratedKey] = React.useState('');
  const { toast } = useToast();
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  React.useEffect(() => {
    if (open) {
      fetchUserData();
    }
  }, [open]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      setProvider(data.provider);
      setSessionsCount(data.sessionsCount);
      setProfileName(data.user.name);
      setDeveloperMode(data.user.developerMode || false);
      if (data.user.developerMode) {
        fetchApiKeys();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load user data', variant: 'destructive' });
    } finally {
      setLoading(false);
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
      const data = await res.json();
      setApiKeys(data.keys || []);
    } catch (error) {
      console.error('Failed to fetch API keys');
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
        setDeveloperMode(checked);
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
              <button
                onClick={() => setActiveTab('developer')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'developer' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Code2 className="h-4 w-4" />
                Developer
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-10">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
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
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {provider === 'google' && 'Synced from Google'}
                          {provider === 'github' && 'Synced from GitHub'}
                          {provider === 'email' && 'Default avatar'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                        <Input id="name" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="h-10" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                        <Input id="email" type="email" value={email} disabled className="h-10" />
                        <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Connected Account</Label>
                        <div className="flex items-center gap-2 p-3 border rounded-lg bg-accent/30">
                          {provider === 'google' && <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
                          {provider === 'github' && <Github className="h-5 w-5" />}
                          {provider === 'email' && <Mail className="h-5 w-5" />}
                          <span className="text-sm font-medium capitalize">{provider}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-8 border-t">
                      <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10 px-6">Cancel</Button>
                      <Button onClick={handleSaveProfile} disabled={saving} className="h-10 px-6">
                        {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Save changes
                      </Button>
                    </div>
                  </div>
                  )}

                  {activeTab === 'security' && (
                  <div className="space-y-10 max-w-2xl">
                    {/* Password Section */}
                    <div className="space-y-5">
                      <div>
                        <h4 className="text-base font-semibold">Password</h4>
                        <p className="text-sm text-muted-foreground mt-1">{provider === 'email' ? 'Change your password' : 'Password change not available for OAuth accounts'}</p>
                      </div>
                      {provider === 'email' && <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password" className="text-sm font-medium">Current password</Label>
                          <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="h-10" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password" className="text-sm font-medium">New password</Label>
                          <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-10" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm password</Label>
                          <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-10" />
                        </div>
                        <Button onClick={handleChangePassword} disabled={saving} className="h-10 px-6 mt-2">
                          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                          Update password
                        </Button>
                      </div>}
                    </div>

                    {/* Sessions Section */}
                    <div className="space-y-5">
                      <div>
                        <h4 className="text-base font-semibold">Sessions</h4>
                        <p className="text-sm text-muted-foreground mt-1">{sessionsCount} active session{sessionsCount > 1 ? 's' : ''}</p>
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
                        <Button onClick={handleSignOutAll} disabled={saving} variant="outline" className="w-full h-10">
                          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                          Sign out all sessions
                        </Button>
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

                  {activeTab === 'developer' && (
                  <div className="space-y-8 max-w-3xl">
                    <div className="space-y-5">
                      <div>
                        <h4 className="text-base font-semibold">Developer Mode</h4>
                        <p className="text-sm text-muted-foreground mt-1">Enable developer features and API access</p>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Enable Developer Mode</p>
                          <p className="text-sm text-muted-foreground mt-0.5">Access API keys and developer documentation</p>
                        </div>
                        <Switch checked={developerMode} onCheckedChange={handleToggleDeveloperMode} disabled={saving} />
                      </div>
                    </div>

                    {developerMode && (
                      <>
                        <div className="space-y-5">
                          <div>
                            <h4 className="text-base font-semibold">API Keys</h4>
                            <p className="text-sm text-muted-foreground mt-1">Manage your API keys for programmatic access</p>
                          </div>
                          
                          {generatedKey && (
                            <div className="p-4 border rounded-lg bg-accent/30">
                              <p className="text-sm font-medium mb-2">Your new API key (save it now, it won't be shown again):</p>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 p-2 bg-background rounded border text-sm font-mono">{generatedKey}</code>
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
                                className="h-10"
                              />
                              <Button onClick={handleCreateApiKey} disabled={saving} className="h-10">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                              </Button>
                            </div>

                            {apiKeys.length > 0 ? (
                              <div className="space-y-2">
                                {apiKeys.map((key) => (
                                  <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                      <p className="text-sm font-medium">{key.name}</p>
                                      <p className="text-xs text-muted-foreground font-mono">{key.key}</p>
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

                        <div className="space-y-5">
                          <div>
                            <h4 className="text-base font-semibold">API Documentation</h4>
                            <p className="text-sm text-muted-foreground mt-1">Learn how to use the API</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <p className="text-sm">View full API documentation at <a href="/admin/developer" className="text-primary hover:underline">/admin/developer</a></p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
