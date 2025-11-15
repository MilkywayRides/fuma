# CLI OAuth Integration Example

## Device Flow Authentication

For CLI applications, use the OAuth 2.0 Device Flow for secure authentication.

### 1. Initiate Device Flow

```bash
curl -X POST https://blazeneuro.com/api/oauth/device \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "your_client_id",
    "scope": "profile email"
  }'
```

Response:
```json
{
  "device_code": "abc123...",
  "user_code": "A1B2C3",
  "verification_uri": "https://blazeneuro.com/oauth/device",
  "verification_uri_complete": "https://blazeneuro.com/oauth/device?user_code=A1B2C3",
  "expires_in": 900,
  "interval": 5
}
```

### 2. Display User Code

Show the 6-character code to the user:
```
Please visit: https://blazeneuro.com/oauth/device
Enter code: A1B2C3
```

### 3. Poll for Authorization

```bash
curl -X POST https://blazeneuro.com/api/oauth/device/poll \
  -H "Content-Type: application/json" \
  -d '{
    "device_code": "abc123...",
    "client_id": "your_client_id"
  }'
```

Responses:
- `authorization_pending`: User hasn't authorized yet
- `expired_token`: Code expired, restart flow
- Success: Returns access token

### 4. Use Access Token

```bash
curl -H "Authorization: Bearer your_access_token" \
  https://blazeneuro.com/api/oauth/me
```

## Python CLI Example

```python
import requests
import time
import json

class BlazeNeuroAuth:
    def __init__(self, client_id):
        self.client_id = client_id
        self.base_url = "https://blazeneuro.com"
        
    def authenticate(self):
        # Start device flow
        response = requests.post(f"{self.base_url}/api/oauth/device", json={
            "client_id": self.client_id,
            "scope": "profile email"
        })
        
        if response.status_code != 200:
            raise Exception("Failed to start device flow")
            
        data = response.json()
        device_code = data["device_code"]
        user_code = data["user_code"]
        
        print(f"Visit: {data['verification_uri']}")
        print(f"Enter code: {user_code}")
        
        # Poll for authorization
        while True:
            poll_response = requests.post(f"{self.base_url}/api/oauth/device/poll", json={
                "device_code": device_code,
                "client_id": self.client_id
            })
            
            if poll_response.status_code == 200:
                token_data = poll_response.json()
                return token_data["access_token"]
            elif poll_response.json().get("error") == "authorization_pending":
                time.sleep(5)
                continue
            else:
                raise Exception("Authorization failed")
    
    def get_user_data(self, access_token):
        response = requests.get(f"{self.base_url}/api/oauth/me", 
                              headers={"Authorization": f"Bearer {access_token}"})
        return response.json()

# Usage
auth = BlazeNeuroAuth("your_client_id")
token = auth.authenticate()
user_data = auth.get_user_data(token)
print(json.dumps(user_data, indent=2))
```

## Security Features

1. **Data Permissions**: Only enabled fields in admin panel are returned
2. **Token Expiry**: Access tokens expire in 1 hour
3. **Secure Codes**: 6-character codes expire in 15 minutes
4. **Rate Limiting**: Built-in protection against abuse
5. **Audit Logging**: All API calls are logged for security

## Data Permissions

Configure in admin panel at `/admin/oauth/[app_id]`:

- ✅ **User ID**: Basic identifier
- ✅ **Name**: Display name
- ✅ **Email**: Email address
- ❌ **Phone**: Phone number (disabled)
- ❌ **Role**: Account role (disabled)
- ❌ **Credits**: Account balance (disabled)

Only checked fields will be returned in API responses.
