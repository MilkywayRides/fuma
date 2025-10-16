# Flow Scripts Quick Start

Get your flow scripting system up and running in 5 minutes!

## Step 1: Database Setup (1 min)

```bash
npm run db:push
```

This creates the `flowScript` and `flowExecution` tables.

## Step 2: Python Backend Setup (2 min)

```bash
# Install Modal
pip install modal

# Authenticate
modal token new

# Deploy the flow executor
cd backend/mcp
modal deploy server.py
```

Copy the deployment URL from the output (looks like: `https://username--flow-executor-execute.modal.run`)

## Step 3: Configure Environment (30 sec)

Add to your `.env` file:

```env
MODAL_ENDPOINT_URL=https://your-username--flow-executor-execute.modal.run
```

## Step 4: Start Development Server (30 sec)

```bash
npm run dev
```

## Step 5: Create Your First Flow (1 min)

1. Open http://localhost:3000/admin/scripts
2. Click "Create New Flow"
3. Add a title (e.g., "My First Flow")
4. Click "Add Start Node"
5. Click "Add End Node"
6. Drag from the Start node's right handle to the End node's left handle
7. Click "Publish"
8. Click "Execute" to run your flow!

## What You Can Do Now

### Create Different Node Types

- **Start Node**: Entry point for your flow
- **Process Node**: Add business logic
- **End Node**: Exit point

### Edit Nodes

- Double-click any node to edit its title and content
- Click outside to save changes

### Connect Nodes

- Drag from a node's right handle (source) to another node's left handle (target)
- Data flows from source to target

### Execute Flows

- Only published flows can be executed
- Click "Execute" to run the flow
- Check execution history in the dashboard

## Example Flow: Simple Data Processing

1. **Start Node**
   - Title: "Input Data"
   - Content: "Receives user input"

2. **Process Node**
   - Title: "Transform"
   - Content: "Process and validate data"

3. **End Node**
   - Title: "Output Result"
   - Content: "Return processed data"

Connect: Start → Process → End

## Troubleshooting

### "Unauthorized" Error
- Make sure you're logged in as Admin or SuperAdmin
- Run: `npm run set-admin your@email.com Admin`

### Modal Deployment Failed
- Check you're authenticated: `modal token new`
- Verify Python version: `python --version` (need 3.8+)

### Flow Won't Execute
- Ensure flow is published (not draft)
- Check MODAL_ENDPOINT_URL in `.env`
- Verify Modal deployment: `modal app list`

## Next Steps

- Read [FLOW_SCRIPTS_SETUP.md](FLOW_SCRIPTS_SETUP.md) for detailed documentation
- Check [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for architecture details
- Explore advanced node types in `backend/mcp/nodes.py`

## Support

- Check Modal logs: `modal app logs flow-executor`
- View database: `npm run db:studio`
- Check browser console for frontend errors
