'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

const EVENTS = [
  'payment.success',
  'payment.failed',
  'subscription.created',
  'subscription.canceled',
  'subscription.renewed',
  'subscription.expired',
];

const ACTION_TYPES = ['webhook', 'email', 'credits', 'role', 'flow'];

export function TriggerDialog({ trigger, plans, onClose }: { trigger: any; plans: any[]; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    event: 'payment.success',
    planId: null as number | null,
    actions: [] as any[],
    active: true,
  });
  const [actionType, setActionType] = useState('webhook');
  const [actionConfig, setActionConfig] = useState('');

  useEffect(() => {
    if (trigger) {
      setFormData({
        name: trigger.name || '',
        event: trigger.event || 'payment.success',
        planId: trigger.planId || null,
        actions: trigger.actions || [],
        active: trigger.active ?? true,
      });
    }
  }, [trigger]);

  const addAction = () => {
    try {
      const config = actionConfig.trim() ? JSON.parse(actionConfig) : {};
      setFormData({
        ...formData,
        actions: [...formData.actions, { type: actionType, config }],
      });
      setActionConfig('');
    } catch (e) {
      alert('Invalid JSON config');
    }
  };

  const removeAction = (index: number) => {
    setFormData({ ...formData, actions: formData.actions.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = trigger ? `/api/admin/triggers/${trigger.id}` : '/api/admin/triggers';
    const method = trigger ? 'PUT' : 'POST';
    
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
          <DialogTitle>{trigger ? 'Edit Trigger' : 'Create Trigger'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>

          <div>
            <Label>Event</Label>
            <Select value={formData.event} onValueChange={(v) => setFormData({ ...formData, event: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENTS.map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Plan (Optional)</Label>
            <Select value={formData.planId?.toString() || 'all'} onValueChange={(v) => setFormData({ ...formData, planId: v === 'all' ? null : Number(v) })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Actions</Label>
            <div className="space-y-2 mb-2">
              <Select value={actionType} onValueChange={setActionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                value={actionConfig}
                onChange={(e) => setActionConfig(e.target.value)}
                placeholder='{"url": "https://...", "amount": 100, "role": "Premium"}'
                rows={3}
              />
              <Button type="button" onClick={addAction}>Add Action</Button>
            </div>
            <div className="space-y-2">
              {formData.actions.map((action, i) => (
                <div key={i} className="bg-muted p-3 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold">{action.type}</span>
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeAction(i)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <pre className="text-xs overflow-auto">{JSON.stringify(action.config, null, 2)}</pre>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={formData.active} onCheckedChange={(v) => setFormData({ ...formData, active: v })} />
            <Label>Active</Label>
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
