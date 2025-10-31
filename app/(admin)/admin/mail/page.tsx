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
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, inboxRes] = await Promise.all([
          fetch('/api/user/me'),
          fetch('/api/admin/emails/inbox')
        ]);
        
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }
        
        if (inboxRes.ok) {
          const inboxData = await inboxRes.json();
          setInbox(inboxData);
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
              <div>
                <Label className="text-base font-semibold">Choose Payment Gateway</Label>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card 
                    className={`cursor-pointer transition-all ${selectedProvider === 'polar' ? 'border-primary ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedProvider('polar')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold mb-2">Polar</div>
                      <p className="text-sm text-muted-foreground">Fast & secure checkout</p>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all ${selectedProvider === 'stripe' ? 'border-primary ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedProvider('stripe')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold mb-2">Stripe</div>
                      <p className="text-sm text-muted-foreground">Trusted worldwide</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setUpgradeStep(1)} className="flex-1">Back</Button>
                <Button onClick={handleUpgrade} className="flex-1">Continue to Payment</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
