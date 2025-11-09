'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, Crown } from 'lucide-react';

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPlansDialog, setShowPlansDialog] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/user/subscription')
      .then((res) => res.json())
      .then((data) => {
        setSubscription(data);
        setLoading(false);
      });
  }, []);

  const handleUpgrade = async () => {
    const res = await fetch('/api/plans');
    const data = await res.json();
    setPlans(data);
    setShowPlansDialog(true);
  };

  const handleSubscribe = async (planId: number) => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });
    const { url } = await res.json();
    window.location.href = url;
  };

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription?')) return;
    await fetch('/api/user/subscription', { method: 'DELETE' });
    window.location.reload();
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      {subscription ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  {subscription.plan.name}
                </CardTitle>
                <Badge>{subscription.subscription.status}</Badge>
              </div>
              <CardDescription>{subscription.plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                ${(subscription.plan.price / 100).toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">/{subscription.plan.interval}</span>
              </div>
              
              <div>
                <p className="text-sm font-semibold mb-2">Features:</p>
                <ul className="space-y-1">
                  {subscription.plan.features?.map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Current period ends: {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>

              {subscription.subscription.cancelAtPeriodEnd && (
                <div className="bg-destructive/10 p-3 rounded text-sm">
                  Your subscription will be canceled at the end of the current period.
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleUpgrade}>
                  Upgrade Plan
                </Button>
                {!subscription.subscription.cancelAtPeriodEnd && (
                  <Button variant="destructive" onClick={handleCancel}>
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage & Limits</CardTitle>
              <CardDescription>Your current usage and plan limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(subscription.plan.permissions || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm">{key}</span>
                    <Badge variant="outline">
                      {value === -1 ? 'Unlimited' : String(value)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>Choose a plan to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleUpgrade}>View Plans</Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={showPlansDialog} onOpenChange={setShowPlansDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose Your Plan</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {plans.map((plan) => (
              <Card key={plan.id} className={plan.popular ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.popular && <Badge>Popular</Badge>}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="text-3xl font-bold mt-2">
                    ${(plan.price / 100).toFixed(2)}
                    <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features?.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" onClick={() => handleSubscribe(plan.id)}>
                    Subscribe
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
