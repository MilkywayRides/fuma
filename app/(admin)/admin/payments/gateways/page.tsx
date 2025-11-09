export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { paymentGateways } from '@/lib/db/schema'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Settings, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default async function GatewaysPage() {
  const gateways = await db.select().from(paymentGateways)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Gateways</h1>
          <p className="text-muted-foreground mt-2">Manage your payment providers</p>
        </div>
        <Link href="/admin/payments/gateways/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Gateway
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {gateways.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No payment gateways configured. Add your first gateway to start accepting payments.
            </CardContent>
          </Card>
        ) : (
          gateways.map((gateway) => (
            <Card key={gateway.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{gateway.name}</CardTitle>
                    <CardDescription className="capitalize">{gateway.provider}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={gateway.active ? 'default' : 'secondary'}>
                      {gateway.active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Added {new Date(gateway.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
