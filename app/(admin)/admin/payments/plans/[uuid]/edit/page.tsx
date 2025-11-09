'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, X, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function EditPlanPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>({
    name: '',
    description: '',
    price: 0,
    currency: 'usd',
    interval: 'monthly',
    features: [],
    permissions: {},
    allowedRoles: ['User'],
    active: true,
    popular: false,
  });
  const [featureInput, setFeatureInput] = useState('');
  const [permKey, setPermKey] = useState('');
  const [permValue, setPermValue] = useState('');
  const [triggers, setTriggers] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('payment.success');
  const [selectedAction, setSelectedAction] = useState('credits');
  const [actionConfig, setActionConfig] = useState('');

  const EVENTS = [
    { value: 'payment.success', label: 'Payment Success' },
    { value: 'payment.failed', label: 'Payment Failed' },
    { value: 'subscription.created', label: 'Subscription Created' },
    { value: 'subscription.canceled', label: 'Subscription Canceled' },
    { value: 'subscription.renewed', label: 'Subscription Renewed' },
  ];

  const ACTIONS = [
    { value: 'credits', label: 'Grant Credits', example: '{ "amount": 100 }' },
    { value: 'role', label: 'Assign Role', example: '{ "role": "Premium" }' },
    { value: 'webhook', label: 'Call Webhook', example: '{ "url": "https://..." }' },
    { value: 'email', label: 'Send Email', example: '{ "template": "welcome" }' },
    { value: 'flow', label: 'Execute Flow', example: '{ "flowId": "abc123" }' },
  ];

  useEffect(() => {
    if (params.uuid !== 'new') {
      fetch(`/api/admin/payments/plans/${params.uuid}`)
        .then(res => res.json())
        .then(data => {
          setPlan(data);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [params.uuid]);

  const addFeature = () => {
    if (featureInput.trim()) {
      setPlan({ ...plan, features: [...plan.features, featureInput.trim()] });
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setPlan({ ...plan, features: plan.features.filter((_: any, i: number) => i !== index) });
  };

  const addPermission = () => {
    if (permKey.trim()) {
      const value = permValue === 'true' ? true : permValue === 'false' ? false : isNaN(Number(permValue)) ? permValue : Number(permValue);
      setPlan({ ...plan, permissions: { ...plan.permissions, [permKey]: value } });
      setPermKey('');
      setPermValue('');
    }
  };

  const removePermission = (key: string) => {
    const { [key]: _, ...rest } = plan.permissions;
    setPlan({ ...plan, permissions: rest });
  };

  const toggleRole = (role: string) => {
    const roles = plan.allowedRoles || [];
    if (roles.includes(role)) {
      setPlan({ ...plan, allowedRoles: roles.filter((r: string) => r !== role) });
    } else {
      setPlan({ ...plan, allowedRoles: [...roles, role] });
    }
  };

  const addTrigger = () => {
    try {
      const config = actionConfig.trim() ? JSON.parse(actionConfig) : {};
      setTriggers([...triggers, {
        event: selectedEvent,
        action: { type: selectedAction, config }
      }]);
      setActionConfig('');
    } catch (e) {
      toast.error('Invalid JSON config');
    }
  };

  const removeTrigger = (index: number) => {
    setTriggers(triggers.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!plan.name || !plan.price || plan.price === 0 || plan.features.length === 0) {
      toast.error('Please fill in name, price (must be > 0), and at least one feature');
      return;
    }

    const url = params.uuid === 'new' ? '/api/admin/payments/plans' : `/api/admin/payments/plans/${params.uuid}`;
    const method = params.uuid === 'new' ? 'POST' : 'PUT';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...plan, triggers }),
    });

    if (res.ok) {
      toast.success('Plan saved successfully');
      router.push('/admin/payments?paymentTab=plans');
    } else {
      const error = await res.json();
      toast.error(error.error || 'Failed to save plan');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{params.uuid === 'new' ? 'Create Plan' : 'Edit Plan'}</h1>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" /> Save Plan
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Plan Name *</Label>
              <Input value={plan.name} onChange={(e) => setPlan({ ...plan, name: e.target.value })} placeholder="Pro Plan" required />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={plan.description} onChange={(e) => setPlan({ ...plan, description: e.target.value })} placeholder="Perfect for professionals" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (cents) *</Label>
                <Input type="number" value={plan.price} onChange={(e) => setPlan({ ...plan, price: Number(e.target.value) })} placeholder="2900" required />
                <p className="text-xs text-muted-foreground mt-1">${(plan.price / 100).toFixed(2)}</p>
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={plan.currency} onValueChange={(v) => setPlan({ ...plan, currency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD</SelectItem>
                    <SelectItem value="eur">EUR</SelectItem>
                    <SelectItem value="gbp">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Billing Interval</Label>
              <Select value={plan.interval} onValueChange={(v) => setPlan({ ...plan, interval: v })}>
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
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={plan.active} onCheckedChange={(v) => setPlan({ ...plan, active: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Popular Badge</Label>
              <Switch checked={plan.popular} onCheckedChange={(v) => setPlan({ ...plan, popular: v })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allowed Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {['User', 'Admin', 'SuperAdmin', 'Premium', 'Pro', 'Enterprise'].map((role) => (
              <div key={role} className="flex items-center justify-between p-2 border rounded">
                <Label>{role}</Label>
                <Switch checked={plan.allowedRoles?.includes(role)} onCheckedChange={() => toggleRole(role)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="Add feature" onKeyPress={(e) => e.key === 'Enter' && addFeature()} />
              <Button onClick={addFeature}><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-2">
              {plan.features?.map((f: string, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{f}</span>
                  <Button size="sm" variant="ghost" onClick={() => removeFeature(i)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={permKey} onChange={(e) => setPermKey(e.target.value)} placeholder="Key (e.g., maxFlows)" />
              <Input value={permValue} onChange={(e) => setPermValue(e.target.value)} placeholder="Value (e.g., 10)" />
              <Button onClick={addPermission}><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-2">
              {Object.entries(plan.permissions || {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="text-sm">
                    <span className="font-semibold">{key}:</span> {String(value)}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removePermission(key)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Common permissions:</p>
              <p>• maxFlows, maxExecutions, maxApiCalls</p>
              <p>• apiAccess, prioritySupport, customDomain</p>
              <p>• Use -1 for unlimited</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Payment Triggers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Event</Label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENTS.map((e) => (
                      <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Action</Label>
                <Select value={selectedAction} onValueChange={(v) => {
                  setSelectedAction(v);
                  const action = ACTIONS.find(a => a.value === v);
                  setActionConfig(action?.example || '');
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map((a) => (
                      <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Config (JSON)</Label>
                <div className="flex gap-2">
                  <Input value={actionConfig} onChange={(e) => setActionConfig(e.target.value)} placeholder='{ "amount": 100 }' />
                  <Button onClick={addTrigger}><Plus className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {triggers.map((trigger, i) => (
                <div key={i} className="flex items-start justify-between p-3 bg-muted rounded">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold">
                      {EVENTS.find(e => e.value === trigger.event)?.label}
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold">{ACTIONS.find(a => a.value === trigger.action.type)?.label}:</span>
                      <pre className="inline ml-2">{JSON.stringify(trigger.action.config)}</pre>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removeTrigger(i)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            {triggers.length === 0 && (
              <p className="text-sm text-muted-foreground">No triggers configured. Add triggers to automate actions when users subscribe to this plan.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
