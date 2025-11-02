'use client';

import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const OAUTH_CONTEXT = `# OAuth 2.0 API Integration Guide

## Base URL
Production: https://blazeneuro.com
Development: http://localhost:3000

## Authentication Flow

### 1. Authorization Endpoint
GET /oauth/authorize

Parameters:
- client_id (required): Your application's client ID
- redirect_uri (required): Your registered callback URL
- scope (optional): Requested permissions (default: "read")
- state (recommended): Random string for CSRF protection

Example:
https://blazeneuro.com/oauth/authorize?client_id=bn_xxx&redirect_uri=https://yourapp.com/callback&scope=profile,email&state=random123

### 2. Token Exchange Endpoint
POST /api/oauth/token

Request Body (authorization_code):
{
  "grant_type": "authorization_code",
  "code": "code_xxx",
  "client_id": "bn_xxx",
  "client_secret": "bn_xxx",
  "redirect_uri": "https://yourapp.com/callback"
}

Response:
{
  "access_token": "at_xxx",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "rt_xxx",
  "scope": "profile,email"
}

### 3. Refresh Token
POST /api/oauth/token

Request Body (refresh_token):
{
  "grant_type": "refresh_token",
  "refresh_token": "rt_xxx",
  "client_id": "bn_xxx",
  "client_secret": "bn_xxx"
}

### 4. Verify Token & Get User Data
GET /api/oauth/verify

Headers:
Authorization: Bearer at_xxx

Response (based on scopes):
{
  "user": {
    "id": "user_123",
    "name": "John Doe",           // if 'profile' scope
    "email": "john@example.com",  // if 'email' scope
    "phoneNumber": "+1234567890", // if 'phone' scope
    "role": "User",               // if 'role' scope
    "credits": 100                // if 'credits' scope
  },
  "scope": "profile,email,phone"
}

## Available Scopes

- profile: User name and ID
- email: User email address
- phone: User phone number
- role: User account role
- credits: User credits balance
- subscription: User subscription status
- all: Full access to all user data

## Rate Limits

- Token requests: 10 per minute per client
- API requests: 100 per minute per token

## Security

- Client secrets are SHA-256 hashed
- Access tokens expire after 1 hour
- Refresh tokens expire after 30 days
- Authorization codes expire after 10 minutes
- All tokens are single-use

## Error Responses

{
  "error": "invalid_request",
  "error_description": "Missing required parameter: client_id"
}

Common error codes:
- invalid_request: Missing or invalid parameters
- invalid_client: Invalid client credentials
- invalid_grant: Invalid or expired authorization code
- unauthorized_client: Client not authorized
- unsupported_grant_type: Grant type not supported

## Implementation Example (Node.js)

const express = require('express');
const axios = require('axios');

const CLIENT_ID = 'bn_xxx';
const CLIENT_SECRET = 'bn_xxx';
const REDIRECT_URI = 'http://localhost:3001/callback';
const BASE_URL = 'https://blazeneuro.com';

// Step 1: Redirect to authorization
app.get('/auth', (req, res) => {
  const state = Math.random().toString(36).substring(7);
  req.session.state = state;
  
  const authUrl = \`\${BASE_URL}/oauth/authorize?\` +
    \`client_id=\${CLIENT_ID}&\` +
    \`redirect_uri=\${encodeURIComponent(REDIRECT_URI)}&\` +
    \`scope=profile,email,phone&\` +
    \`state=\${state}\`;
  
  res.redirect(authUrl);
});

// Step 2: Handle callback
app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (state !== req.session.state) {
    return res.status(400).send('Invalid state');
  }
  
  try {
    // Exchange code for token
    const tokenResponse = await axios.post(\`\${BASE_URL}/api/oauth/token\`, {
      grant_type: 'authorization_code',
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI
    });
    
    const { access_token, refresh_token } = tokenResponse.data;
    
    // Store tokens securely
    req.session.access_token = access_token;
    req.session.refresh_token = refresh_token;
    
    res.redirect('/dashboard');
  } catch (error) {
    res.status(500).send('Authentication failed');
  }
});

// Step 3: Use access token
app.get('/api/user', async (req, res) => {
  try {
    const response = await axios.get(\`\${BASE_URL}/api/oauth/verify\`, {
      headers: {
        'Authorization': \`Bearer \${req.session.access_token}\`
      }
    });
    
    res.json(response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired, refresh it
      const refreshResponse = await axios.post(\`\${BASE_URL}/api/oauth/token\`, {
        grant_type: 'refresh_token',
        refresh_token: req.session.refresh_token,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      });
      
      req.session.access_token = refreshResponse.data.access_token;
      req.session.refresh_token = refreshResponse.data.refresh_token;
      
      // Retry request
      const retryResponse = await axios.get(\`\${BASE_URL}/api/oauth/verify\`, {
        headers: {
          'Authorization': \`Bearer \${req.session.access_token}\`
        }
      });
      
      res.json(retryResponse.data);
    } else {
      res.status(500).send('Failed to fetch user');
    }
  }
});

## Best Practices

1. Always use HTTPS in production
2. Validate state parameter to prevent CSRF
3. Store tokens securely (httpOnly cookies)
4. Implement automatic token refresh
5. Never expose client secret in client-side code
6. Handle token expiration gracefully
7. Request only necessary scopes
8. Revoke tokens when user logs out

## Testing

1. Create OAuth app at /admin/oauth
2. Copy Client ID and Secret
3. Set callback URL to your app
4. Test authorization flow
5. Verify token refresh works
6. Check scope-based data access

## Support

- Documentation: /docs/oauth-integration
- Admin Panel: /admin/oauth
- User Settings: /settings/applications`;

export function CopyOAuthContextButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(OAUTH_CONTEXT);
    setCopied(true);
    toast.success('OAuth context copied! Paste it to AI to build your app.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button onClick={handleCopy} variant="outline" size="sm">
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          Copy Full API Context for AI
        </>
      )}
    </Button>
  );
}
