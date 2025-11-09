import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirectToSignIn } from '@/lib/redirect-to-signin'
import { DeviceAuthForm } from '@/components/device-auth-form'

export default async function DeviceAuthPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    redirectToSignIn('/oauth/device')
    return
  }

  return (
    <div className="container max-w-md mx-auto py-16">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Device Authorization</h1>
          <p className="text-muted-foreground mt-2">
            Enter the code shown on your device
          </p>
        </div>
        <DeviceAuthForm userId={session.user.id} />
      </div>
    </div>
  )
}
