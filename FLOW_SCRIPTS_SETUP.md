# Flow Scripts Setup Guide

This guide will help you set up the admin flow scripting system.

## Prerequisites

- Node.js and npm installed
- Python 3.8+ installed
- Modal account (sign up at https://modal.com)

## Database Setup

1. Push the database schema to include flow script tables:
```bash
npm run db:push
```

This will create the following tables:
- `flowScript` - Stores flow script definitions
- `flowExecution` - Stores execution history

## Python Backend Setup

1. Install Modal CLI:
```bash
pip install modal
```

2. Authenticate with Modal:
```bash
modal token new
```

3. Install Python dependencies:
```bash
cd backend/mcp
pip install -r requirements.txt
```

4. Deploy the flow executor to Modal:
```bash
modal deploy server.py
```

5. Copy the deployment URL and add it to your `.env` file:
```
MODAL_ENDPOINT_URL=https://your-username--flow-executor-execute.modal.run
```

## Frontend Setup

The frontend is already configured. Just ensure you have:

1. All npm dependencies installed:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

## Usage

### Accessing Flow Scripts

1. Sign in as an Admin or SuperAdmin user
2. Navigate to `/admin/scripts` in the sidebar
3. Click "Create New Flow" to start building

### Creating a Flow

1. Click "Create New Flow" button
2. Add nodes using the toolbar buttons:
   - **Start Node**: Entry point for the flow
   - **Process Node**: Main processing logic
   - **End Node**: Exit point for the flow
3. Connect nodes by dragging from one node's handle to another
4. Double-click nodes to edit their content
5. Save as draft or publish

### Executing a Flow

1. Open a published flow script
2. Click the "Execute" button
3. View execution results in the execution history

## Node Types

Currently supported node types:

### Python Code Node
Execute arbitrary Python code with input data available as `inputs` variable.

### HTTP Request Node
Make HTTP requests to external services with configurable method, headers, and body.

### Data Transform Node
Transform data using templates and expressions.

## Development

### Local Testing

Run Modal server locally for development:
```bash
cd backend/mcp
modal serve server.py
```

### Adding New Node Types

1. Define node in `backend/mcp/nodes.py`
2. Implement execution logic in `backend/mcp/server.py`
3. Add UI component in `components/flow-nodes.tsx`
4. Update node types in flow editor

## Troubleshooting

### Modal Deployment Issues
- Ensure you're authenticated: `modal token new`
- Check deployment logs: `modal app logs flow-executor`

### Database Issues
- Run migrations: `npm run db:push`
- Check connection string in `.env`

### Execution Failures
- Check Modal logs for Python errors
- Verify MODAL_ENDPOINT_URL is correct
- Ensure flow has valid node connections

## API Endpoints

- `GET /api/admin/scripts` - List all flow scripts
- `POST /api/admin/scripts` - Create new flow script
- `GET /api/admin/scripts/[id]` - Get flow script details
- `PUT /api/admin/scripts/[id]` - Update flow script
- `DELETE /api/admin/scripts/[id]` - Delete flow script
- `POST /api/admin/scripts/[id]/execute` - Execute flow script

## Security

- Only Admin and SuperAdmin roles can access flow scripts
- Execution is logged with user tracking
- Python code execution is sandboxed in Modal environment
