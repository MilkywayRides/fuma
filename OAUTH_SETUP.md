# OAuth 2.0 System Setup Guide

This guide will help you set up and use the OAuth 2.0 system in your application.

## Database Setup

1. **Push the schema to your database:**

```bash
npm run db:push
```

This will create the following tables:
- `oauthApplications` - Stores registered OAuth applications
- `oauthTokens` - Stores access and refresh tokens
- `oauthAuthorizationCodes` - Stores temporary authorization codes

## Features

### Secure Token Generation
- Client IDs: `app_` prefix with 32 hex characters
- Client Secrets: `secret_` prefix with 64 hex characters (SHA-256 hashed)
- Access Tokens: `at_` prefix with 64 hex characters
- Refresh Tokens: `rt_` prefix with 64 hex characters
- Authorization Codes: `code_` prefix with 48 hex characters

### Token Expiration
- Access tokens: 1 hour
- Refresh tokens: 30 days
- Authorization codes: 10 minutes

### Security Features
- Client secrets are hashed using SHA-256
- State parameter support for CSRF protection
- Redirect URI validation
- Token expiration checks
- Automatic code invalidation after use

## Admin Interface

Navigate to `/admin/oauth` to:
- Create new OAuth applications
- View client credentials
- Manage existing applications
- Delete applications (revokes all tokens)

## API Endpoints

### 1. Authorization Endpoint
```
GET /api/oauth/authorize
```

**Parameters:**
- `client_id` (required)
- `redirect_uri` (required)
- `scope` (optional, default: "read")
- `state` (recommended)

**Example:**
```
https://your-domain.com/api/oauth/authorize?client_id=app_xxx&redirect_uri=https://example.com/callback&scope=read&state=random123
```

### 2. Token Endpoint
```
POST /api/oauth/token
```

**For Authorization Code:**
```json
{
  "grant_type": "authorization_code",
  "code": "code_xxx",
  "client_id": "app_xxx",
  "client_secret": "secret_xxx",
  "redirect_uri": "https://example.com/callback"
}
```

**For Refresh Token:**
```json
{
  "grant_type": "refresh_token",
  "refresh_token": "rt_xxx",
  "client_id": "app_xxx",
  "client_secret": "secret_xxx"
}
```

### 3. Verification Endpoint
```
GET /api/oauth/verify
```

**Headers:**
```
Authorization: Bearer at_xxx
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "User"
  },
  "scope": "read"
}
```

## Integration Example

### Step 1: Register Application
1. Go to `/admin/oauth`
2. Click "New Application"
3. Fill in:
   - Application Name: "My App"
   - Homepage URL: "https://myapp.com"
   - Description: "My awesome application"
   - Callback URL: "https://myapp.com/oauth/callback"
4. Save and copy your Client ID and Client Secret

### Step 2: Implement OAuth Flow

```javascript
// 1. Redirect user to authorization
const authUrl = `https://your-domain.com/api/oauth/authorize?` +
  `client_id=${CLIENT_ID}&` +
  `redirect_uri=${REDIRECT_URI}&` +
  `scope=read&` +
  `state=${generateRandomState()}`;

window.location.href = authUrl;

// 2. Handle callback
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');

// Verify state matches what you sent

// 3. Exchange code for token
const response = await fetch('https://your-domain.com/api/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI
  })
});

const { access_token, refresh_token } = await response.json();

// 4. Use access token
const userResponse = await fetch('https://your-domain.com/api/oauth/verify', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});

const userData = await userResponse.json();
```

## Testing

### Using cURL

**1. Get authorization code (requires browser):**
```bash
# Open in browser:
https://your-domain.com/api/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_CALLBACK&scope=read&state=test123
```

**2. Exchange code for token:**
```bash
curl -X POST https://your-domain.com/api/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "authorization_code",
    "code": "YOUR_CODE",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "redirect_uri": "YOUR_CALLBACK"
  }'
```

**3. Verify token:**
```bash
curl https://your-domain.com/api/oauth/verify \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**4. Refresh token:**
```bash
curl -X POST https://your-domain.com/api/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "refresh_token",
    "refresh_token": "YOUR_REFRESH_TOKEN",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET"
  }'
```

## Security Best Practices

1. **Never expose client secrets** in client-side code
2. **Always use HTTPS** in production
3. **Validate state parameter** to prevent CSRF attacks
4. **Store tokens securely** (httpOnly cookies, secure storage)
5. **Implement token refresh** before expiration
6. **Rotate secrets** if compromised
7. **Use environment variables** for credentials

## Troubleshooting

### "Invalid client" error
- Verify client_id is correct
- Check if application is active
- Ensure client_secret matches

### "Invalid redirect URI" error
- Redirect URI must exactly match registered callback URL
- Include protocol (https://)
- Check for trailing slashes

### "Authorization code expired" error
- Codes expire after 10 minutes
- Exchange code immediately after receiving it
- Don't reuse codes (they're single-use)

### "Token expired" error
- Access tokens expire after 1 hour
- Use refresh token to get new access token
- Implement automatic token refresh

## Documentation

Full documentation is available at `/docs/oauth-integration` including:
- Complete OAuth 2.0 flow explanation
- Code examples in Node.js and Python
- Security best practices
- Error handling
- Rate limiting information

## Support

For issues or questions:
- Check the documentation at `/docs/oauth-integration`
- Review this setup guide
- Contact your system administrator
