'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Application = {
  id: number;
  name: string;
  description: string | null;
  homepageUrl: string;
  callbackUrl: string;
};

export function EditOAuthAppDialog({ app }: { app: Application }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
    };

    try {
      const res = await fetch(`/api/oauth/applications/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update application');

      toast.success('Application updated successfully');
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update application');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit OAuth Application</DialogTitle>
          <DialogDescription>
            Update your application details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Application Name</Label>
            <Input id="name" name="name" required defaultValue={app.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={app.description || ''} rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="homepageUrl">Homepage URL</Label>
            <Input id="homepageUrl" name="homepageUrl" required type="url" defaultValue={app.homepageUrl} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="callbackUrl">Authorization Callback URL</Label>
            <Input id="callbackUrl" name="callbackUrl" required type="url" defaultValue={app.callbackUrl} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
