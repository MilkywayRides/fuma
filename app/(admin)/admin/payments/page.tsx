'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Copy, Check, Edit, Loader2 } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';


export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [gateways, setGateways] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [buttons, setButtons] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalRevenue: 0, activePlans: 0, paymentPages: 0, activeCoupons: 0 });
  const [loading, setLoading] = useState(true);
  const activeTab = searchParams.get('paymentTab') || 'overview';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';


  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const refreshData = useCallback(async () => {
    setLoading(true);
    if (activeTab === 'overview') {
      await fetch('/api/admin/payments/stats').then(res => res.json()).then(setStats);
    } else if (activeTab === 'plans') {
      await fetch('/api/admin/payments/plans').then(res => res.json()).then(setPlans);
    } else if (activeTab === 'gateways') {
      await fetch('/api/admin/payments/gateways').then(res => res.json()).then(setGateways);
    } else if (activeTab === 'pages') {
      await fetch('/api/admin/payments/pages').then(res => res.json()).then(setPages);
    } else if (activeTab === 'buttons') {
      await fetch('/api/admin/payments/buttons').then(res => res.json()).then(setButtons);
    } else if (activeTab === 'links') {
      await fetch('/api/admin/payments/links').then(res => res.json()).then(setLinks);
    } else if (activeTab === 'coupons') {
      await fetch('/api/admin/payments/coupons').then(res => res.json()).then(setCoupons);
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    refreshData();
  }, [activeTab, refreshData]);

  const handleTabChange = (value: string) => {
    router.push(`/admin/payments?paymentTab=${value}`);
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <p className="text-muted-foreground">Manage payment gateways, plans, pages, and transactions</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gateways">Gateways</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="pages">Payment Pages</TabsTrigger>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">From completed payments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activePlans}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payment Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.paymentPages}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeCoupons}</div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Payment Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Plans', value: stats.activePlans, fill: 'hsl(var(--primary))' },
                    { name: 'Pages', value: stats.paymentPages, fill: 'hsl(220, 90%, 56%)' },
                    { name: 'Coupons', value: stats.activeCoupons, fill: 'hsl(142, 76%, 36%)' },
                    { name: 'Revenue', value: Math.round(stats.totalRevenue), fill: 'hsl(280, 80%, 55%)' },
                  ]}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="fill" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gateways">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Gateways</CardTitle>
                  <CardDescription>Configure payment providers</CardDescription>
                </div>
                <Link href="/admin/payments/gateways/new">
                  <Button><Plus className="h-4 w-4 mr-2" />Add Gateway</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : gateways.length === 0 ? (
                <p className="text-sm text-muted-foreground">No gateways configured yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gateways.map((gateway) => (
                      <TableRow key={gateway.id}>
                        <TableCell className="font-medium">{gateway.name}</TableCell>
                        <TableCell className="capitalize">{gateway.provider}</TableCell>
                        <TableCell>{gateway.active ? 'Active' : 'Inactive'}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/admin/payments/gateways/${gateway.uuid}/edit`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Plans</CardTitle>
                  <CardDescription>Create and manage subscription plans</CardDescription>
                </div>
                <Link href="/admin/payments/plans/new">
                  <Button><Plus className="h-4 w-4 mr-2" />Create Plan</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : plans.length === 0 ? (
                <p className="text-sm text-muted-foreground">No plans created yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Interval</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell>${(plan.amount / 100).toFixed(2)} {plan.currency.toUpperCase()}</TableCell>
                        <TableCell className="capitalize">{plan.interval}</TableCell>
                        <TableCell>{plan.active ? 'Active' : 'Inactive'}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/admin/payments/plans/${plan.uuid}/edit`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Pages</CardTitle>
                  <CardDescription>Hosted payment pages for your products</CardDescription>
                </div>
                <Link href="/admin/payments/pages/new">
                  <Button><Plus className="h-4 w-4 mr-2" />Create Page</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : pages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payment pages created yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell className="font-medium">{page.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{baseUrl}/pay/{page.uuid}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(`${baseUrl}/pay/${page.uuid}`, `page-${page.id}`)}
                            >
                              {copiedId === `page-${page.id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{page.active ? 'Active' : 'Inactive'}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/admin/payments/pages/${page.uuid}/edit`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buttons">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Buttons</CardTitle>
                  <CardDescription>Embeddable payment buttons</CardDescription>
                </div>
                <Link href="/admin/payments/buttons/new">
                  <Button><Plus className="h-4 w-4 mr-2" />Create Button</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : buttons.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payment buttons created yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buttons.map((button) => (
                      <TableRow key={button.id}>
                        <TableCell className="font-medium">{button.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{baseUrl}/pay/{button.uuid}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(`${baseUrl}/pay/${button.uuid}`, `button-${button.id}`)}
                            >
                              {copiedId === `button-${button.id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{button.active ? 'Active' : 'Inactive'}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/admin/payments/buttons/${button.uuid}/edit`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Links</CardTitle>
                  <CardDescription>Shareable payment links</CardDescription>
                </div>
                <Link href="/admin/payments/links/new">
                  <Button><Plus className="h-4 w-4 mr-2" />Create Link</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : links.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payment links created yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Uses</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {links.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell className="font-medium">{link.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{baseUrl}/pay/{link.uuid}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(`${baseUrl}/pay/${link.uuid}`, `link-${link.id}`)}
                            >
                              {copiedId === `link-${link.id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{link.usedCount}/{link.maxUses || '∞'}</TableCell>
                        <TableCell>{link.active ? 'Active' : 'Inactive'}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/admin/payments/links/${link.uuid}/edit`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Coupons</CardTitle>
                  <CardDescription>Discount codes for your products</CardDescription>
                </div>
                <Link href="/admin/payments/coupons/new">
                  <Button><Plus className="h-4 w-4 mr-2" />Create Coupon</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : coupons.length === 0 ? (
                <p className="text-sm text-muted-foreground">No coupons created yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Uses</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell className="font-medium">{coupon.code}</TableCell>
                        <TableCell>{coupon.type === 'percentage' ? `${coupon.value}%` : `$${(coupon.value / 100).toFixed(2)}`}</TableCell>
                        <TableCell>{coupon.usedCount}/{coupon.maxUses || '∞'}</TableCell>
                        <TableCell>{coupon.active ? 'Active' : 'Inactive'}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/admin/payments/coupons/${coupon.uuid}/edit`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>View all payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No transactions yet</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
