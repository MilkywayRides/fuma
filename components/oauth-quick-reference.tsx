import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code } from 'lucide-react';
import Link from 'next/link';
import { OAUTH_BASE_URL } from '@/lib/config';

export function OAuthQuickReference() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Quick Reference
        </CardTitle>
        <CardDescription>
          Essential OAuth 2.0 endpoints and documentation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Base URL</h4>
          <code className="block p-2 bg-muted rounded text-xs break-all">
            {OAUTH_BASE_URL}
          </code>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Authorization Endpoint</h4>
          <code className="block p-2 bg-muted rounded text-xs break-all">
            GET {OAUTH_BASE_URL}/oauth/authorize
          </code>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Token Endpoint</h4>
          <code className="block p-2 bg-muted rounded text-xs break-all">
            POST {OAUTH_BASE_URL}/api/oauth/token
          </code>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Verification Endpoint</h4>
          <code className="block p-2 bg-muted rounded text-xs break-all">
            GET {OAUTH_BASE_URL}/api/oauth/verify
          </code>
        </div>

        <div className="pt-4 border-t">
          <Link 
            href="/docs/oauth-integration" 
            className="text-sm text-blue-600 hover:underline"
          >
            View Full Documentation →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
