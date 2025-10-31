'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Copy, Check, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEmails } from '@/contexts/email-context';

interface User {
  id: string;
  name: string;
  email: string;
}

interface EmailAddress {
  id: number;
  address: string;
  active: boolean;
  createdAt: string;
}

interface InboxEmail {
  id: number;
  from: string;
  subject: string;
  body: string;
  read: boolean;
  starred: boolean;
  createdAt: string;
  address: string;
}

export default function MailPage() {
  const [user, setUser] = useState<User | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const { emails: emailAddresses, refreshEmails } = useEmails();
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [inbox, setInbox] = useState<InboxEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string>('');
  const [recipient, setRecipient] = useState('');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeStep, setUpgradeStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<'polar' | 'stripe'>('polar');
  const [showLockScreen, setShowLockScreen] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, inboxRes, subRes] = await Promise.all([
          fetch('/api/user/me'),
          fetch('/api/admin/emails/inbox'),
          fetch('/api/subscription/status')
        ]);
        
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }
        
        if (inboxRes.ok) {
          const inboxData = await inboxRes.json();
          setInbox(inboxData);
        }

        if (subRes.ok) {
          const subData = await subRes.json();
          setHasActiveSubscription(subData.active);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
    if (emailAddresses.length > 0 && !selectedEmail) setSelectedEmail(emailAddresses[0].address);
  }, [emailAddresses, selectedEmail]);

  const createEmail = async () => {
    if (!newEmail) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: newEmail })
      });
      if (res.ok) {
        const data = await res.json();
        await refreshEmails();
        setNewEmail('');
        if (!selectedEmail) setSelectedEmail(data.address);
        toast({ title: 'Email created', description: `${data.address} is ready to use` });
      } else {
        const error = await res.json();
        if (res.status === 403) {
          setUpgradeStep(1);
          setShowUpgradeDialog(true);
        } else {
          toast({ title: 'Error', description: error.error, variant: 'destructive' });
        }
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create email', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleUpgrade = async () => {
    const res = await fetch('/api/subscription/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: selectedProvider }),
    });
    const { url } = await res.json();
    window.location.href = url;
  };

  const sendEmail = async () => {
    if (!selectedEmail || !recipient || !subject || !body) return;
    
    const emailIndex = emailAddresses.findIndex(e => e.address === selectedEmail);
    if (emailIndex >= 2 && !hasActiveSubscription) {
      setShowLockScreen(true);
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: selectedEmail, to: recipient, subject, body })
      });
      if (res.ok) {
        toast({ title: 'Email sent', description: `Sent to ${recipient}` });
        setRecipient('');
        setSubject('');
        setBody('');
      } else {
        toast({ title: 'Error', description: 'Failed to send email', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send email', variant: 'destructive' });
    }
    setLoading(false);
  };

  const deleteEmail = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/emails/${emailAddresses.find(e => e.id === id)?.uuid}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshEmails();
        toast({ title: 'Email deleted', description: 'Email address has been removed' });
      } else {
        toast({ title: 'Error', description: 'Failed to delete email', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete email', variant: 'destructive' });
    }
  };



  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Mail className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Email Generator</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create Email Address</CardTitle>
          <CardDescription>Create custom email addresses with your domain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="newEmail">Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="newEmail"
                placeholder="username"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <span className="flex items-center text-sm text-muted-foreground">@blazeneuro.com</span>
            </div>
          </div>
          <Button onClick={createEmail} disabled={loading || !newEmail}>
            <Plus className="h-4 w-4 mr-2" />
            Create Email
          </Button>
        </CardContent>
      </Card>

      {emailAddresses.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Email Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {emailAddresses.map((email) => (
                <div key={email.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{email.address}</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Email Address</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {email.address}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteEmail(email.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {inbox.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <CardDescription>Recent emails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inbox.map((email) => (
                <div key={email.id} className={`p-4 border rounded-lg hover:bg-accent cursor-pointer ${!email.read ? 'bg-accent/50' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{email.subject}</p>
                        {!email.read && <span className="h-2 w-2 bg-primary rounded-full" />}
                      </div>
                      <p className="text-sm text-muted-foreground">From: {email.from}</p>
                      <p className="text-sm text-muted-foreground">To: {email.address}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{email.body}</p>
                    </div>
                    <time className="text-xs text-muted-foreground">
                      {new Date(email.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {emailAddresses.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Send Email</CardTitle>
            <CardDescription>Compose and send emails from your addresses</CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="from">From</Label>
            <select
              id="from"
              className="w-full p-2 border rounded-md"
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
            >
              {emailAddresses.map((email) => (
                <option key={email.id} value={email.address}>{email.address}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="email"
              placeholder="recipient@example.com"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              placeholder="Enter email message"
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <Button onClick={sendEmail} disabled={loading || !recipient || !subject || !body}>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
        </CardContent>
      </Card>
      )}


      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>
              {upgradeStep === 1 ? 'Choose a plan to continue' : 'Select your payment method'}
            </DialogDescription>
          </DialogHeader>
          
          {upgradeStep === 1 ? (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>Current Plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal">/month</span></div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4" /> 2 email addresses</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Basic features</li>
                  </ul>
                  <Button variant="outline" disabled>Current Plan</Button>
                </CardContent>
              </Card>

              <Card className="border-primary">
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <CardDescription>For power users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">$9<span className="text-sm font-normal">/month</span></div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4" /> 10 email addresses</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4" /> All features</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Priority support</li>
                  </ul>
                  <Button onClick={() => setUpgradeStep(2)} className="w-full">Select Pro Plan</Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${selectedProvider === 'polar' ? 'border-primary ring-2 ring-primary' : 'border-2'}`}
                  onClick={() => setSelectedProvider('polar')}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-3">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                      </svg>
                    </div>
                    <CardTitle className="text-2xl">Polar</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pb-6">
                    <p className="text-sm text-muted-foreground">Fast & secure checkout</p>
                    <p className="text-xs text-muted-foreground mt-2">Developer-friendly payments</p>
                  </CardContent>
                </Card>
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${selectedProvider === 'stripe' ? 'border-primary ring-2 ring-primary' : 'border-2'}`}
                  onClick={() => setSelectedProvider('stripe')}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-3">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
                      </svg>
                    </div>
                    <CardTitle className="text-2xl">Stripe</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pb-6">
                    <p className="text-sm text-muted-foreground">Trusted worldwide</p>
                    <p className="text-xs text-muted-foreground mt-2">Industry standard payments</p>
                  </CardContent>
                </Card>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setUpgradeStep(1)} className="flex-1">Back</Button>
                <Button onClick={handleUpgrade} className="flex-1">Continue to Payment</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showLockScreen} onOpenChange={setShowLockScreen}>
        <DialogContent className="max-w-md">
          <div className="absolute inset-0 backdrop-blur-md bg-background/80 rounded-lg" />
          <div className="relative z-10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="p-2 bg-destructive/10 rounded-full">
                  <svg className="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                Subscription Ended
              </DialogTitle>
              <DialogDescription>
                Your subscription has ended. This email address is locked.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                To continue using premium email addresses (3+), please renew your subscription.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowLockScreen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => { setShowLockScreen(false); router.push('/admin/subscription'); }} className="flex-1">
                  Renew Subscription
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
