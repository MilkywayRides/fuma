'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

export default function CreateStreamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isClass: false,
    isPaid: false,
    price: 0,
    scheduledAt: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/streams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        price: formData.isPaid ? formData.price * 100 : 0,
      }),
    });

    const stream = await res.json();
    router.push(`/admin/streams/dashboard/${stream.uuid}`);
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Create New Stream</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.isClass}
              onCheckedChange={(checked) => setFormData({ ...formData, isClass: checked })}
            />
            <Label>This is a live class</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.isPaid}
              onCheckedChange={(checked) => setFormData({ ...formData, isPaid: checked })}
            />
            <Label>Paid stream/class</Label>
          </div>

          {formData.isPaid && (
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                min="0"
                step="0.01"
              />
            </div>
          )}

          <div>
            <Label htmlFor="scheduledAt">Schedule (optional)</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create Stream'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
