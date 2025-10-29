'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Send, Inbox, Star, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EmailAddress {
  id: number;
  uuid: string;
  address: string;
}

interface InboxEmail {
  id: number;
  from: string;
  subject: string;
  body: string;
  read: boolean;
  starred: boolean;
  createdAt: string;
}

export default function MailboxPage({ params }: { params: Promise<{ uuid: string }> }) {
  const [emailAddress, setEmailAddress] = useState<EmailAddress | null>(null);
  const [inbox, setInbox] = useState<InboxEmail[]>([]);
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<InboxEmail | null>(null);
  const { toast } = useToast();
  const [uuid, setUuid] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    params.then(p => setUuid(p.uuid));
  }, [params]);

  useEffect(() => {
    if (!uuid) return;
    
    fetch(`/api/admin/emails/${uuid}`)
      .then(res => res.json())
      .then(data => {
        setEmailAddress(data);
        return fetch(`/api/admin/emails/${uuid}/inbox`);
      })
      .then(res => res.json())
      .then(data => setInbox(data))
      .catch(() => {});
  }, [uuid]);

  const sendEmail = async () => {
    if (!emailAddress || !recipient || !subject || !body) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: emailAddress.address, to: recipient, subject, body })
      });
      if (res.ok) {
        toast({ title: 'Email sent', description: `Sent to ${recipient}` });
        setRecipient('');
        setSubject('');
        setBody('');
      } else {
        const error = await res.json();
        toast({ title: 'Error', description: error.error || 'Failed to send email', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send email', variant: 'destructive' });
    }
    setLoading(false);
  };

  const refreshInbox = async () => {
    if (!uuid) return;
    setRefreshing(true);
    try {
      const res = await fetch(`/api/admin/emails/${uuid}/inbox`);
      const data = await res.json();
      setInbox(data);
      toast({ title: 'Inbox refreshed' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to refresh inbox', variant: 'destructive' });
    }
    setRefreshing(false);
  };

  if (!emailAddress) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex items-center gap-2 mb-6">
        <Mail className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold">{emailAddress.address}</h1>
          <p className="text-sm text-muted-foreground">Mailbox</p>
        </div>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="inbox">
              <Inbox className="h-4 w-4 mr-2" />
              Inbox ({inbox.length})
            </TabsTrigger>
            <TabsTrigger value="compose">
              <Send className="h-4 w-4 mr-2" />
              Compose
            </TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={refreshInbox} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <TabsContent value="inbox" className="space-y-4">
          {inbox.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No emails yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 space-y-2">
                {inbox.map((email) => (
                  <Card
                    key={email.id}
                    className={`cursor-pointer transition-colors ${
                      selectedEmail?.id === email.id ? 'border-primary' : ''
                    } ${!email.read ? 'bg-accent/50' : ''}`}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{email.subject}</p>
                            {!email.read && <span className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{email.from}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(email.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="lg:col-span-2">
                {selectedEmail ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{selectedEmail.subject}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-2">From: {selectedEmail.from}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(selectedEmail.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Star className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-6">
                      <div className="whitespace-pre-wrap">{selectedEmail.body}</div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select an email to read</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="from">From</Label>
                <Input id="from" value={emailAddress.address} disabled />
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
                  rows={12}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>
              <Button onClick={sendEmail} disabled={loading || !recipient || !subject || !body}>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
