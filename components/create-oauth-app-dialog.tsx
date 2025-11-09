'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Copy, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function CreateOAuthAppDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdApp, setCreatedApp] = useState<any>(null);
  const [copied, setCopied] = useState<{ id: boolean; secret: boolean }>({ id: false, secret: false });
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      homepageUrl: formData.get('homepageUrl') as string,
      callbackUrl: formData.get('callbackUrl') as string,
      applicationType: formData.get('applicationType') as string,
    };

    try {
      const res = await fetch('/api/oauth/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create application');
      }

      const result = await res.json();
      setCreatedApp(result);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create application');
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = (text: string, type: 'id' | 'secret') => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [type]: true });
    setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
    toast.success(`${type === 'id' ? 'Client ID' : 'Client Secret'} copied`);
  };

  const handleClose = () => {
    setOpen(false);
    setCreatedApp(null);
    setCopied({ id: false, secret: false });
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && createdApp) {
        handleClose();
      } else {
        setOpen(isOpen);
      }
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Application
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        {createdApp ? (
          <>
            <DialogHeader>
              <DialogTitle>Application Created Successfully!</DialogTitle>
              <DialogDescription>
                Copy your credentials now. The secret won't be shown again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 font-medium mb-2">⚠️ Important</p>
                <p className="text-sm text-yellow-700">
                  Copy your Client Secret now. For security reasons, it won't be displayed again.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Client ID</Label>
                <div className="flex gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-sm break-all">
                    {createdApp.clientId}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(createdApp.clientId, 'id')}
                  >
                    {copied.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Client Secret</Label>
                <div className="flex gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-sm break-all">
                    {createdApp.clientSecret}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(createdApp.clientSecret, 'secret')}
                  >
                    {copied.secret ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create OAuth Application</DialogTitle>
              <DialogDescription>
                Register a new OAuth application to integrate with your services
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Application Name</Label>
            <Input id="name" name="name" required placeholder="My Awesome App" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="What does your application do?" rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="applicationType">Application Type</Label>
            <Select name="applicationType" defaultValue="web">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web Application</SelectItem>
                <SelectItem value="cli">CLI Tool</SelectItem>
                <SelectItem value="desktop">Desktop App</SelectItem>
                <SelectItem value="mobile">Mobile App</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="homepageUrl">Homepage URL</Label>
            <Input id="homepageUrl" name="homepageUrl" required type="url" placeholder="https://example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="callbackUrl">Authorization Callback URL</Label>
            <Input id="callbackUrl" name="callbackUrl" required type="url" placeholder="https://example.com/oauth/callback" />
            <p className="text-sm text-muted-foreground">
              Users will be redirected here after authorization
            </p>
          </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Application'}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
