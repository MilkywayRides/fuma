'use client';

import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function NewButtonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/payments/plans')
      .then(res => res.json())
      .then(setPlans)
      .catch(() => {});
  }, []);

  const [createdButton, setCreatedButton] = useState<any>(null);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      planId: parseInt(formData.get('planId') as string),
      buttonText: formData.get('buttonText'),
    };

    try {
      const res = await fetch('/api/admin/payments/buttons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        setCreatedButton({ ...data, uuid: result.uuid });
        toast.success('Payment button created successfully');
      } else {
        toast.error('Failed to create button');
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
          <CardTitle>Create Payment Button</CardTitle>
          <CardDescription>Create an embeddable payment button</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Button Name</Label>
              <Input id="name" name="name" placeholder="Pro Plan Button" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="planId">Select Plan</Label>
              <Select name="planId" required>
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

            <div className="space-y-2">
              <Label htmlFor="buttonText">Button Text</Label>
              <Input id="buttonText" name="buttonText" placeholder="Buy Now" defaultValue="Pay Now" required />
            </div>

            {!createdButton ? (
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Button'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <h3 className="font-semibold mb-2">Button Preview</h3>
                  <a href={`${baseUrl}/pay/${createdButton.uuid}`} target="_blank" rel="noopener noreferrer">
                    <button style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '12px 32px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s',
                    }}>
                      {createdButton.buttonText}
                    </button>
                  </a>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Embed Code</h3>
                  <Textarea
                    readOnly
                    rows={8}
                    value={`<a href="${baseUrl}/pay/${createdButton.uuid}" target="_blank" rel="noopener noreferrer">
  <button style="
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 32px;
    border-radius: 8px;
    border: none;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.2s;
  " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
    ${createdButton.buttonText}
  </button>
</a>`}
                    onClick={(e) => {
                      e.currentTarget.select();
                      navigator.clipboard.writeText(e.currentTarget.value);
                      toast.success('Code copied to clipboard');
                    }}
                  />
                </div>

                <Button onClick={() => router.push('/admin/payments?paymentTab=buttons')}>
                  View All Buttons
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
