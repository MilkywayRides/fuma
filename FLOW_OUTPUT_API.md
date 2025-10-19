# Flow Output API Documentation

## Overview

Secure API endpoint to fetch flow execution results. Only authenticated users can access the output data.

## Endpoint

```
GET /api/flows/[flowId]/output
```

## Authentication

Requires valid session cookie. User must be logged in.

## Response Format

```json
{
  "executionId": 123,
  "flowId": "BUIcRnbQ",
  "status": "success",
  "startedAt": "2024-01-01T00:00:00.000Z",
  "completedAt": "2024-01-01T00:00:05.000Z",
  "output": {
    "node-1": { "result": "data from node 1" },
    "node-2": { "response": "AI generated text" },
    "node-3": { "success": true }
  },
  "error": null
}
```

## Usage Examples

### JavaScript/TypeScript

```typescript
// Fetch latest execution output
const response = await fetch('/api/flows/BUIcRnbQ/output');
const data = await response.json();

if (data.status === 'success') {
  console.log('Flow output:', data.output);
}
```

### React Hook

```typescript
import { useEffect, useState } from 'react';

function useFlowOutput(flowId: string) {
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/flows/${flowId}/output`)
      .then(res => res.json())
      .then(data => {
        setOutput(data.output);
        setLoading(false);
      });
  }, [flowId]);

  return { output, loading };
}

// Usage
function MyComponent() {
  const { output, loading } = useFlowOutput('BUIcRnbQ');
  
  if (loading) return <div>Loading...</div>;
  return <pre>{JSON.stringify(output, null, 2)}</pre>;
}
```

### cURL

```bash
curl -X GET http://localhost:3000/api/flows/BUIcRnbQ/output \
  -H "Cookie: better-auth.session_token=your_session_token"
```

## Output Structure

The `output` object contains data from all nodes in the flow:

```json
{
  "output": {
    "node-123": {
      "result": "processed data"
    },
    "node-456": {
      "response": "AI generated content",
      "model": "gemini-pro"
    },
    "node-789": {
      "success": true,
      "message": "Sent to Discord"
    }
  }
}
```

## Status Values

- `success` - Flow completed successfully
- `error` - Flow failed with error
- `running` - Flow is currently executing

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "No execution found"
}
```

## Security

- ✅ Requires authentication
- ✅ Session-based access control
- ✅ Only returns latest execution
- ✅ No sensitive data exposed

## Integration Examples

### Webhook Integration

```typescript
// After flow execution, send output to webhook
async function sendToWebhook(flowId: string) {
  const output = await fetch(`/api/flows/${flowId}/output`);
  const data = await output.json();
  
  await fetch('https://your-webhook.com/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data.output)
  });
}
```

### Dashboard Widget

```typescript
function FlowOutputWidget({ flowId }: { flowId: string }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/flows/${flowId}/output`);
      const json = await res.json();
      setData(json);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [flowId]);

  return (
    <div>
      <h3>Latest Output</h3>
      <p>Status: {data?.status}</p>
      <pre>{JSON.stringify(data?.output, null, 2)}</pre>
    </div>
  );
}
```

### Mobile App Integration

```typescript
// React Native example
import AsyncStorage from '@react-native-async-storage/async-storage';

async function fetchFlowOutput(flowId: string) {
  const token = await AsyncStorage.getItem('session_token');
  
  const response = await fetch(
    `https://your-domain.com/api/flows/${flowId}/output`,
    {
      headers: {
        'Cookie': `better-auth.session_token=${token}`
      }
    }
  );
  
  return response.json();
}
```

## Best Practices

1. **Polling**: Poll the endpoint every 5-10 seconds for real-time updates
2. **Caching**: Cache results to reduce API calls
3. **Error Handling**: Always check status before using output
4. **Rate Limiting**: Implement client-side rate limiting
5. **Validation**: Validate output structure before use

## Advanced Usage

### Accessing Specific Node Output

```typescript
const response = await fetch('/api/flows/BUIcRnbQ/output');
const data = await response.json();

// Get output from specific node
const geminiOutput = data.output['node-gemini-123'];
const discordOutput = data.output['node-discord-456'];
```

### Chaining Flows

```typescript
// Use output from one flow as input to another
async function chainFlows(flowId1: string, flowId2: string) {
  // Get output from first flow
  const res1 = await fetch(`/api/flows/${flowId1}/output`);
  const data1 = await res1.json();
  
  // Use as input for second flow
  await fetch(`/api/admin/scripts/${flowId2}/execute`, {
    method: 'POST',
    body: JSON.stringify({ input: data1.output })
  });
}
```

## Troubleshooting

### No Output Returned

- Ensure flow has been executed at least once
- Check flow status is 'success'
- Verify authentication is valid

### Stale Data

- Output shows latest execution only
- Execute flow again to get fresh data
- Implement polling for real-time updates

### Missing Node Data

- Check node executed successfully
- Verify node has output configured
- Review execution logs for errors
