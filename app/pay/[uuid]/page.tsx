'use client';

import { useEffect, useState, use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft } from 'lucide-react';

export default function PaymentPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = use(params);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [plan, setPlan] = useState<any>(null);
  const [features, setFeatures] = useState<string[]>([]);
  const [gateways, setGateways] = useState<any[]>([]);
  const [step, setStep] = useState(1);
  const [selectedGateway, setSelectedGateway] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/pay/${uuid}`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.title);
        setDescription(data.description || '');
        setPlan(data.plan);
        setFeatures(data.features || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/auth/get-session')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setEmail(data.user.email);
        }
      })
      .catch(() => {});
  }, [uuid]);

  const handleContinue = async () => {
    if (step === 1) {
      const res = await fetch('/api/admin/payments/gateways');
      const data = await res.json();
      setGateways(data.filter((g: any) => g.active));
      setStep(2);
    }
  };

  const handleGatewaySelect = (gateway: any) => {
    setSelectedGateway(gateway);
    setStep(3);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="max-w-md w-full">
        {step > 1 && (
          <Button variant="ghost" size="sm" className="m-4" onClick={() => setStep(step - 1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
        )}

        {step === 1 && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">{title}</CardTitle>
              {description && (
                <CardDescription className="text-base mt-2">{description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {plan && (
                <>
                  <div className="text-center">
                    <div className="text-4xl font-bold">
                      ${(plan.amount / 100).toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {plan.interval === 'monthly' ? 'per month' : plan.interval === 'yearly' ? 'per year' : 'one-time'}
                    </div>
                  </div>

                  {features.length > 0 && (
                    <div className="space-y-2">
                      {features.map((feature: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              <Button className="w-full" size="lg" onClick={handleContinue}>
                Continue to Payment
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Secure payment powered by your payment gateway
              </p>
            </CardContent>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader className="text-center">
              <CardTitle>Select Payment Method</CardTitle>
              <CardDescription>Choose your preferred payment gateway</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {gateways.map((gateway) => (
                <Button
                  key={gateway.id}
                  variant="outline"
                  className="w-full justify-start capitalize h-auto py-4"
                  onClick={() => handleGatewaySelect(gateway)}
                >
                  <div className="text-left">
                    <div className="font-semibold">{gateway.provider}</div>
                    <div className="text-xs text-muted-foreground">{gateway.name}</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader className="text-center">
              <CardTitle>Complete Payment</CardTitle>
              <CardDescription>Processing with {selectedGateway?.provider}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-8 border rounded-lg">
                <div className="text-2xl font-bold mb-2">
                  ${plan ? (plan.amount / 100).toFixed(2) : '0.00'}
                </div>
                <div className="text-sm text-muted-foreground mb-4">{title}</div>
                <div className="text-xs text-muted-foreground capitalize">
                  via {selectedGateway?.provider}
                </div>
              </div>

              <div className="space-y-4">
                {user ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <div className="w-full px-3 py-2 border rounded-md bg-muted">{email}</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = '/sign-in'}
                    >
                      Login with BlazeNeuro
                    </Button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue as guest</span>
                      </div>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                )}

                <Button 
                  className="w-full" 
                  size="lg" 
                  disabled={!email || processing}
                  onClick={async () => {
                    setProcessing(true);
                    try {
                      const res = await fetch('/api/payments/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          amount: plan.amount,
                          email,
                          gatewayId: selectedGateway.id,
                          title,
                        }),
                      });
                      const data = await res.json();
                      if (data.url) window.location.href = data.url;
                    } catch (error) {
                      alert('Payment failed');
                    } finally {
                      setProcessing(false);
                    }
                  }}
                >
                  {processing ? 'Processing...' : 'Pay Now'}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Your payment is secure and encrypted
              </p>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
