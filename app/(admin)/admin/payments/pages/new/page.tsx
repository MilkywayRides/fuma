'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function NewPaymentPagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [customAmount, setCustomAmount] = useState(false);

  useEffect(() => {
    fetch('/api/admin/payments/plans')
      .then(res => res.json())
      .then(setPlans)
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      planId: formData.get('planId') ? parseInt(formData.get('planId') as string) : null,
      customAmount,
      minAmount: customAmount ? parseInt(formData.get('minAmount') as string) * 100 : null,
      maxAmount: customAmount ? parseInt(formData.get('maxAmount') as string) * 100 : null,
      successUrl: formData.get('successUrl'),
      cancelUrl: formData.get('cancelUrl'),
    };

    try {
      const res = await fetch('/api/admin/payments/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success('Payment page created successfully');
        router.push('/admin/payments');
      } else {
        toast.error('Failed to create payment page');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Payment Page</CardTitle>
          <CardDescription>Create a hosted payment page for your product</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input id="title" name="title" placeholder="Buy Premium Access" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Get full access to all features" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="planId">Select Plan</Label>
              <Select name="planId">
                <SelectTrigger>
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.name} - ${(plan.amount / 100).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="customAmount" checked={customAmount} onCheckedChange={setCustomAmount} />
              <Label htmlFor="customAmount">Allow custom amount</Label>
            </div>

            {customAmount && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minAmount">Min Amount</Label>
                  <Input id="minAmount" name="minAmount" type="number" placeholder="10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAmount">Max Amount</Label>
                  <Input id="maxAmount" name="maxAmount" type="number" placeholder="1000" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="successUrl">Success URL</Label>
              <Input id="successUrl" name="successUrl" placeholder="/success" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancelUrl">Cancel URL</Label>
              <Input id="cancelUrl" name="cancelUrl" placeholder="/cancel" />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Page'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
