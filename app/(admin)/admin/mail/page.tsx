'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Copy, Check, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [emailAddresses, setEmailAddresses] = useState<EmailAddress[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [inbox, setInbox] = useState<InboxEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string>('');
  const [recipient, setRecipient] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, emailsRes, inboxRes] = await Promise.all([
          fetch('/api/user/me'),
          fetch('/api/admin/emails'),
          fetch('/api/admin/emails/inbox')
        ]);
        
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }
        
        if (emailsRes.ok) {
          const emailsData = await emailsRes.json();
          setEmailAddresses(emailsData);
          if (emailsData.length > 0) setSelectedEmail(emailsData[0].address);
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
  }, []);

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
        setEmailAddresses([...emailAddresses, data]);
        setNewEmail('');
        if (!selectedEmail) setSelectedEmail(data.address);
        toast({ title: 'Email created', description: `${data.address} is ready to use` });
      } else {
        const error = await res.json();
        toast({ title: 'Error', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create email', variant: 'destructive' });
    }
    setLoading(false);
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
      const res = await fetch(`/api/admin/emails/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEmailAddresses(emailAddresses.filter(e => e.id !== id));
        toast({ title: 'Email deleted' });
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
                  <Button variant="ghost" size="sm" onClick={() => deleteEmail(email.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
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


    </div>
  );
}
