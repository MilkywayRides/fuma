'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Coins, Lock, Crown, Sparkles, Check, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function PurchaseBookPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [book, setBook] = useState<any>(null)
  const [userCredits, setUserCredits] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showPlansDialog, setShowPlansDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [paymentProvider, setPaymentProvider] = useState<string | null>(null)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [cardName, setCardName] = useState('')

  useEffect(() => {
    fetch(`/api/books/${params.uuid}/info`)
      .then(res => res.json())
      .then(data => {
        setBook(data.book)
        setUserCredits(data.userCredits || 0)
      })
  }, [params.uuid])

  const handlePurchase = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/books/${params.uuid}/purchase`, {
        method: 'POST',
      })
      const data = await res.json()
      
      if (res.ok) {
        toast({ title: 'Success', description: 'Book purchased successfully!' })
        router.push(`/books/${params.uuid}`)
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to purchase book', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (!book) return <div className="container mx-auto py-12">Loading...</div>

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Blurred background */}
      <div className="absolute inset-0 bg-muted/30 backdrop-blur-3xl" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary shadow-2xl">
            <Lock className="h-12 w-12 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">
              Premium Content
            </h1>
            <p className="text-muted-foreground text-lg">Unlock exclusive access to this book</p>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">{book.title}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Premium Book
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {book.description && (
              <p className="text-muted-foreground">{book.description}</p>
            )}
            
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <span className="text-lg font-semibold">Price:</span>
                <div className="flex items-center gap-2 text-lg">
                  <Coins className="h-5 w-5 text-primary" />
                  <span className="font-bold">{book.price} Credits</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <span className="text-lg font-semibold">Your Credits:</span>
                <div className="flex items-center gap-2 text-lg">
                  <Coins className="h-5 w-5 text-primary" />
                  <span className="font-bold">{userCredits} Credits</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              {userCredits >= book.price ? (
                <Button onClick={handlePurchase} disabled={loading} className="w-full" size="lg">
                  {loading ? 'Processing...' : `Purchase for ${book.price} Credits`}
                </Button>
              ) : (
                <>
                  <p className="text-destructive text-center font-semibold">Insufficient credits</p>
                  <Button onClick={() => setShowPlansDialog(true)} className="w-full" size="lg">
                    <Sparkles className="h-4 w-4 mr-2" />
                    View Plans
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Modal */}
      {showPlansDialog && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-5xl bg-background border rounded-lg shadow-lg">
              <button
                onClick={() => setShowPlansDialog(false)}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="p-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
                  <p className="text-muted-foreground">Select a plan to unlock premium books</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Free Plan */}
                  <div className="border rounded-lg p-6 space-y-4 hover:shadow-lg transition-shadow">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold">Free</h3>
                      <div className="text-4xl font-bold">$0</div>
                      <p className="text-sm text-muted-foreground">Basic access</p>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        <span className="text-sm">Access to free books</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        <span className="text-sm">0 credits</span>
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                  </div>

                  {/* Credits Plan */}
                  <div className="border-2 border-primary rounded-lg p-6 space-y-4 hover:shadow-xl transition-shadow relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-0.5 rounded-full text-xs font-semibold">
                      Popular
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Coins className="h-5 w-5 text-primary" />
                        Credits
                      </h3>
                      <div className="text-4xl font-bold">$10</div>
                      <p className="text-sm text-muted-foreground">Pay per book</p>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        <span className="text-sm">250 credits</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        <span className="text-sm">Buy individual books</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        <span className="text-sm">No expiration</span>
                      </li>
                    </ul>
                    <Button className="w-full" onClick={() => setSelectedPlan('credits')}>Buy Credits</Button>
                  </div>

                  {/* Premium Plan */}
                  <div className="border-2 border-primary rounded-lg p-6 space-y-4 bg-primary/5 hover:shadow-xl transition-shadow">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Crown className="h-5 w-5 text-primary" />
                        Premium
                      </h3>
                      <div className="text-4xl font-bold">$12<span className="text-base font-normal">/mo</span></div>
                      <p className="text-sm text-muted-foreground">Unlimited access</p>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        <span className="text-sm">Unlimited books</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        <span className="text-sm">All premium content</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        <span className="text-sm">Cancel anytime</span>
                      </li>
                    </ul>
                    <Button className="w-full" onClick={() => setSelectedPlan('premium')}>Subscribe Now</Button>
                  </div>
                </div>
              </div>

              {/* Payment Provider Selection */}
              {selectedPlan && (
                <div className="absolute inset-0 bg-background rounded-lg p-6 flex flex-col">
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="absolute left-4 top-4 rounded-sm opacity-70 hover:opacity-100"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => { setSelectedPlan(null); setShowPlansDialog(false); }}
                    className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold">Choose Payment Method</h3>
                      <p className="text-muted-foreground">
                        {selectedPlan === 'credits' ? 'Buy 250 Credits for $10' : 'Subscribe to Premium for $12/month'}
                      </p>
                    </div>

                    <div className="w-full max-w-md space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full h-16 text-lg justify-start gap-4"
                        onClick={() => setPaymentProvider('stripe')}
                      >
                        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
                        </svg>
                        <div className="text-left">
                          <div className="font-semibold">Stripe</div>
                          <div className="text-xs text-muted-foreground">Credit/Debit Card</div>
                        </div>
                      </Button>

                      <Button 
                        variant="outline" 
                        className="w-full h-16 text-lg justify-start gap-4"
                        onClick={() => toast({ title: 'Polar', description: 'Coming soon!' })}
                      >
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                          P
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">Polar</div>
                          <div className="text-xs text-muted-foreground">Multiple payment options</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Stripe Payment Form */}
              {paymentProvider === 'stripe' && (
                <div className="absolute inset-0 bg-background rounded-lg p-6 flex flex-col">
                  <button
                    onClick={() => setPaymentProvider(null)}
                    className="absolute left-4 top-4 rounded-sm opacity-70 hover:opacity-100"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => { setPaymentProvider(null); setSelectedPlan(null); setShowPlansDialog(false); }}
                    className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-full max-w-md space-y-6">
                      <div className="text-center space-y-2">
                        <h3 className="text-2xl font-bold">Payment Details</h3>
                        <p className="text-muted-foreground">
                          {selectedPlan === 'credits' ? '$10.00' : '$12.00/month'}
                        </p>
                      </div>

                      <form className="space-y-4" onSubmit={async (e) => { 
                        e.preventDefault(); 
                        setLoading(true);
                        try {
                          const amount = selectedPlan === 'credits' ? 10 : 12;
                          const res = await fetch('/api/create-payment-intent', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ amount, planType: selectedPlan }),
                          });
                          const data = await res.json();
                          if (res.ok) {
                            toast({ title: 'Success!', description: 'Payment processed successfully' });
                            setShowPlansDialog(false);
                            setSelectedPlan(null);
                            setPaymentProvider(null);
                            window.location.reload();
                          } else {
                            throw new Error(data.error);
                          }
                        } catch (error: any) {
                          toast({ title: 'Error', description: error.message || 'Payment failed', variant: 'destructive' });
                        } finally {
                          setLoading(false);
                        }
                      }}>
                        <div className="space-y-2">
                          <Label htmlFor="cardName">Cardholder Name</Label>
                          <Input
                            id="cardName"
                            placeholder="John Doe"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                            maxLength={19}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input
                              id="expiry"
                              placeholder="MM/YY"
                              value={expiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '')
                                if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4)
                                setExpiry(val)
                              }}
                              maxLength={5}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input
                              id="cvc"
                              placeholder="123"
                              value={cvc}
                              onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                              maxLength={3}
                              required
                            />
                          </div>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            `Pay ${selectedPlan === 'credits' ? '$10.00' : '$12.00'}`
                          )}
                        </Button>
                      </form>

                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Secured by Stripe</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
