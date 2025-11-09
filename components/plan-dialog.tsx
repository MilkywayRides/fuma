'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';

export function PlanDialog({ plan, onClose }: { plan: any; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    interval: 'monthly',
    features: [] as string[],
    permissions: {} as any,
    active: true,
    popular: false,
  });
  const [featureInput, setFeatureInput] = useState('');
  const [permKey, setPermKey] = useState('');
  const [permValue, setPermValue] = useState('');

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        description: plan.description || '',
        price: plan.price || 0,
        interval: plan.interval || 'monthly',
        features: plan.features || [],
        permissions: plan.permissions || {},
        active: plan.active ?? true,
        popular: plan.popular ?? false,
      });
    }
  }, [plan]);

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
  };

  const addPermission = () => {
    if (permKey.trim()) {
      const value = permValue === 'true' ? true : permValue === 'false' ? false : isNaN(Number(permValue)) ? permValue : Number(permValue);
      setFormData({ ...formData, permissions: { ...formData.permissions, [permKey]: value } });
      setPermKey('');
      setPermValue('');
    }
  };

  const removePermission = (key: string) => {
    const { [key]: _, ...rest } = formData.permissions;
    setFormData({ ...formData, permissions: rest });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = plan ? `/api/admin/plans/${plan.id}` : '/api/admin/plans';
    const method = plan ? 'PUT' : 'POST';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plan ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          
          <div>
            <Label>Description</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price (cents)</Label>
              <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} required />
            </div>
            <div>
              <Label>Interval</Label>
              <Select value={formData.interval} onValueChange={(v) => setFormData({ ...formData, interval: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="lifetime">Lifetime</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Features</Label>
            <div className="flex gap-2 mb-2">
              <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="Add feature" />
              <Button type="button" onClick={addFeature}>Add</Button>
            </div>
            <div className="space-y-1">
              {formData.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                  <span className="flex-1">{f}</span>
                  <Button type="button" size="sm" variant="ghost" onClick={() => removeFeature(i)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Permissions</Label>
            <div className="flex gap-2 mb-2">
              <Input value={permKey} onChange={(e) => setPermKey(e.target.value)} placeholder="Key" />
              <Input value={permValue} onChange={(e) => setPermValue(e.target.value)} placeholder="Value" />
              <Button type="button" onClick={addPermission}>Add</Button>
            </div>
            <div className="space-y-1">
              {Object.entries(formData.permissions).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                  <span className="flex-1">{key}: {String(value)}</span>
                  <Button type="button" size="sm" variant="ghost" onClick={() => removePermission(key)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={formData.active} onCheckedChange={(v) => setFormData({ ...formData, active: v })} />
              <Label>Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.popular} onCheckedChange={(v) => setFormData({ ...formData, popular: v })} />
              <Label>Popular</Label>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
