# Modal Deployment Guide

## Prerequisites

1. **Install Modal**
   ```bash
   pip install modal
   ```

2. **Create Modal Account**
   - Visit https://modal.com
   - Sign up for a free account

3. **Authenticate**
   ```bash
   modal token new
   ```
   This will open a browser window to authenticate.

## Deployment

### Deploy to Production

```bash
cd backend/mcp
modal deploy server.py
```

Expected output:
```
✓ Created objects.
├── 🔨 Created mount /home/user/Code/fuma/backend/mcp
├── 🔨 Created function execute.
└── 🔨 Created web function execute => https://username--flow-executor-execute.modal.run
✓ App deployed! 🎉
```

### Deploy for Development

For local testing with hot reload:

```bash
modal serve server.py
```

This runs the server locally and watches for file changes.

## Configuration

### Environment Variables

Add the deployment URL to your Next.js `.env`:

```env
MODAL_ENDPOINT_URL=https://username--flow-executor-execute.modal.run
```

### Testing the Endpoint

```bash
curl -X POST https://username--flow-executor-execute.modal.run \
  -H "Content-Type: application/json" \
  -d '{
    "flow_id": "test123",
    "nodes": [
      {
        "id": "1",
        "type": "python",
        "position": {"x": 0, "y": 0},
        "data": {"code": "output = {\"result\": \"Hello World\"}"}
      }
    ],
    "edges": []
  }'
```

Expected response:
```json
{
  "status": "completed",
  "output": {
    "1": {"result": "Hello World"}
  },
  "timestamp": "2024-01-01T00:00:00"
}
```

## Monitoring

### View Logs

```bash
modal app logs flow-executor
```

### List Deployments

```bash
modal app list
```

### Stop Deployment

```bash
modal app stop flow-executor
```

## Updating

After making changes to `server.py`:

```bash
modal deploy server.py
```

The URL remains the same, so no need to update `.env`.

## Troubleshooting

### Authentication Issues

```bash
# Re-authenticate
modal token new

# Check current token
modal token list
```

### Deployment Fails

```bash
# Check Python version (need 3.8+)
python --version

# Reinstall dependencies
pip install -r requirements.txt

# Try with verbose output
modal deploy server.py --verbose
```

### Function Not Found

Make sure the function is decorated with `@modal.web_endpoint`:

```python
@app.function(image=image)
@modal.web_endpoint(method="POST")
def execute(flow: FlowScript):
    # ...
```

### Import Errors

Ensure all dependencies are in the Modal image:

```python
image = modal.Image.debian_slim().pip_install(
    "fastapi",
    "pydantic",
    "httpx",
)
```

## Cost

Modal offers:
- **Free tier**: 30 free compute credits per month
- **Pay-as-you-go**: $0.000250 per second of compute

Flow execution typically takes < 1 second, making it very cost-effective.

## Security

- Modal functions run in isolated containers
- No persistent state between executions
- Python code is sandboxed
- HTTPS encryption by default

## Best Practices

1. **Use `modal serve` for development**
   - Faster iteration
   - Immediate feedback

2. **Use `modal deploy` for production**
   - Stable endpoint
   - Better performance

3. **Monitor logs regularly**
   - Catch errors early
   - Optimize performance

4. **Version your deployments**
   - Tag releases
   - Easy rollback

## Advanced Configuration

### Custom Timeout

```python
@app.function(
    image=image,
    timeout=300  # 5 minutes
)
```

### Secrets Management

```python
@app.function(
    image=image,
    secrets=[modal.Secret.from_name("my-secret")]
)
```

### GPU Support

```python
@app.function(
    image=image,
    gpu="T4"  # For ML workloads
)
```

## Resources

- Modal Docs: https://modal.com/docs
- Modal Examples: https://github.com/modal-labs/modal-examples
- Support: https://modal.com/support
