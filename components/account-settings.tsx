'use client';

import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User } from '@/lib/auth';
import { Monitor, Smartphone } from 'lucide-react';

interface Session {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
}

export function AccountSettings({ user, sessions, currentSessionId }: { user: User; sessions: Session[]; currentSessionId: string }) {
  const [name, setName] = useState(user.name);
  const [loading, setLoading] = useState(false);

  const handleUpdateName = async () => {
    setLoading(true);
    // TODO: Implement name update API
    alert('Name update coming soon!');
    setLoading(false);
  };

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Profile</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-semibold">
              {initials}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profile Picture</p>
              <button className="text-sm text-primary hover:underline">Change avatar</button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <button
            onClick={handleUpdateName}
            disabled={loading || name === user.name}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Active Sessions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Manage your active sessions across devices
        </p>
        <div className="space-y-3">
          {sessions.map((session) => {
            const isCurrent = session.id === currentSessionId;
            const isMobile = session.userAgent?.toLowerCase().includes('mobile');
            const deviceType = isMobile ? 'Mobile' : 'Desktop';
            
            return (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {isMobile ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                  <div>
                    <p className="font-medium">{isCurrent ? 'Current Session' : deviceType}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.ipAddress || 'Unknown IP'} • {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {isCurrent ? (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                ) : (
                  <button className="text-sm text-destructive hover:underline">Revoke</button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border rounded-lg p-6 border-destructive/50">
        <h2 className="text-xl font-semibold mb-4 text-destructive">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Irreversible actions that affect your account
        </p>
        <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90">
          Delete Account
        </button>
      </div>
    </div>
  );
}
