'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function NewPaymentButtonPage() {
  const router = useRouter()
  const [code, setCode] = useState('')

  function generateCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const buttonText = formData.get('buttonText')
    const amount = formData.get('amount')
    
    const embedCode = `<button onclick="window.open('/pay/button-${Math.random().toString(36).substring(2, 10)}', '_blank')">${buttonText}</button>`
    setCode(embedCode)
    toast.success('Button code generated!')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Payment Button</h1>
        <p className="text-muted-foreground mt-2">Generate embeddable payment button</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Button Configuration</CardTitle>
          <CardDescription>Customize your payment button</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={generateCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buttonText">Button Text</Label>
              <Input id="buttonText" name="buttonText" defaultValue="Pay Now" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" placeholder="99.00" required />
            </div>

            {code && (
              <div className="space-y-2">
                <Label>Embed Code</Label>
                <Textarea value={code} readOnly rows={4} />
                <Button type="button" onClick={() => {
                  navigator.clipboard.writeText(code)
                  toast.success('Code copied!')
                }}>
                  Copy Code
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit">Generate Button</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
