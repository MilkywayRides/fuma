# Flow Scripts System - Complete Guide

## 🎯 What is Flow Scripts?

A visual workflow automation system built into your admin dashboard that allows you to create n8n-style automated backend workflows using a drag-and-drop interface. Flows are executed by a Python backend powered by Modal.

## 📚 Documentation Index

1. **[QUICKSTART_FLOW_SCRIPTS.md](QUICKSTART_FLOW_SCRIPTS.md)** - Get started in 5 minutes
2. **[FLOW_SCRIPTS_SETUP.md](FLOW_SCRIPTS_SETUP.md)** - Detailed setup instructions
3. **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Architecture and technical details
4. **[EXAMPLE_FLOWS.md](EXAMPLE_FLOWS.md)** - Example workflows to learn from
5. **[backend/mcp/DEPLOYMENT.md](backend/mcp/DEPLOYMENT.md)** - Modal deployment guide
6. **[CHECKLIST.md](CHECKLIST.md)** - Implementation checklist

## 🚀 Quick Start

```bash
# 1. Setup database
npm run db:push

# 2. Install and setup Modal
pip install modal
modal token new

# 3. Deploy Python backend
cd backend/mcp
modal deploy server.py

# 4. Add Modal URL to .env
echo "MODAL_ENDPOINT_URL=https://your-url.modal.run" >> .env

# 5. Start dev server
npm run dev

# 6. Visit http://localhost:3000/admin/scripts
```

## 🎨 Features

### Visual Flow Editor
- Drag-and-drop node interface
- Connect nodes to define workflow logic
- Real-time visual feedback
- MiniMap for navigation
- Zoom and pan controls

### Node Types
- **Start Node**: Entry point for flows
- **Process Node**: Business logic and transformations
- **End Node**: Exit point for flows
- **Python Code**: Execute custom Python code
- **HTTP Request**: Call external APIs
- **Data Transform**: Transform and manipulate data

### Flow Management
- Create, edit, and delete flows
- Save as draft or publish
- Execute published flows
- View execution history
- Track execution status

### Admin Dashboard
- List all flow scripts
- View execution statistics
- Filter and search flows
- Quick access to editor

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Next.js Frontend                │
│  ┌────────────┐    ┌────────────┐      │
│  │ Dashboard  │    │   Editor   │      │
│  │  /admin/   │───▶│  /admin/   │      │
│  │  scripts   │    │scripts/[id]│      │
│  └────────────┘    └────────────┘      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│         PostgreSQL (Neon)                │
│  • flowScript (definitions)              │
│  • flowExecution (history)               │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│    Python Backend (Modal)                │
│  • Flow execution engine                 │
│  • Node type handlers                    │
│  • Serverless deployment                 │
└──────────────────────────────────────────┘
```

## 📁 File Structure

```
fuma/
├── app/
│   ├── admin/scripts/
│   │   ├── page.tsx              # Dashboard
│   │   └── [uuid]/page.tsx       # Flow editor
│   └── api/admin/scripts/
│       ├── route.ts               # List/Create
│       └── [id]/
│           ├── route.ts           # Get/Update/Delete
│           └── execute/route.ts   # Execute
├── backend/mcp/
│   ├── server.py                  # Modal backend
│   ├── nodes.py                   # Node definitions
│   └── requirements.txt           # Python deps
├── components/
│   ├── flow-nodes.tsx             # Node components
│   └── flow-editor.tsx            # Editor logic
└── lib/db/schema.ts               # Database schema
```

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Better Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000

# Modal Backend
MODAL_ENDPOINT_URL=https://username--flow-executor-execute.modal.run
```

### Database Schema

```typescript
// flowScript table
{
  id: string,              // 8-char UUID
  title: string,
  description: string,
  published: boolean,
  nodes: string,           // JSON
  edges: string,           // JSON
  createdById: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  lastExecutedAt: timestamp,
  executionCount: number
}

// flowExecution table
{
  id: serial,
  flowId: string,
  status: string,          // 'success' | 'error' | 'running'
  startedAt: timestamp,
  completedAt: timestamp,
  error: string,
  logs: string,            // JSON
  triggeredById: string
}
```

## 🎓 Usage Examples

### Creating a Simple Flow

1. Navigate to `/admin/scripts`
2. Click "Create New Flow"
3. Enter title: "My First Flow"
4. Add Start Node
5. Add Process Node
6. Add End Node
7. Connect: Start → Process → End
8. Click "Publish"
9. Click "Execute"

### API Integration Flow

1. Start Node → HTTP Request Node → Process Node → End Node
2. Configure HTTP node with API endpoint
3. Process response in Process node
4. Execute to fetch and process data

### Data Processing Pipeline

1. Start → Clean Data → Validate → Transform → End
2. Each node performs one transformation
3. Data flows through the pipeline
4. Final result at End node

## 🔒 Security

- **Authentication**: Admin/SuperAdmin only
- **Authorization**: Role-based access control
- **Sandboxing**: Python code runs in isolated Modal containers
- **Logging**: All executions tracked with user info
- **HTTPS**: Encrypted communication with Modal

## 📊 Monitoring

### View Execution History
- Dashboard shows last execution time
- Execution count per flow
- Status indicators (success/error/running)

### Check Logs
```bash
# Modal logs
modal app logs flow-executor

# Database logs
npm run db:studio
```

## 🐛 Troubleshooting

### Flow Won't Execute
1. Check flow is published (not draft)
2. Verify MODAL_ENDPOINT_URL in .env
3. Check Modal deployment: `modal app list`
4. View logs: `modal app logs flow-executor`

### Nodes Not Connecting
1. Drag from right handle (source)
2. Drop on left handle (target)
3. Ensure handles are visible
4. Check browser console for errors

### Modal Deployment Failed
1. Verify authentication: `modal token new`
2. Check Python version: `python --version` (need 3.8+)
3. Install dependencies: `pip install -r requirements.txt`
4. Try verbose: `modal deploy server.py --verbose`

## 🎯 Best Practices

### Flow Design
1. Keep flows simple and focused
2. Use descriptive node names
3. Add error handling paths
4. Test incrementally
5. Document complex logic

### Performance
1. Minimize HTTP requests
2. Cache repeated operations
3. Use efficient data structures
4. Monitor execution times

### Maintenance
1. Version your flows
2. Document changes
3. Test before publishing
4. Monitor execution logs
5. Clean up old executions

## 🚦 API Reference

### List Scripts
```
GET /api/admin/scripts
Response: { scripts: FlowScript[] }
```

### Create Script
```
POST /api/admin/scripts
Body: { id, title, description, nodes, edges, published }
Response: { script: FlowScript }
```

### Get Script
```
GET /api/admin/scripts/[id]
Response: { script: FlowScript }
```

### Update Script
```
PUT /api/admin/scripts/[id]
Body: { title, description, nodes, edges, published }
Response: { script: FlowScript }
```

### Delete Script
```
DELETE /api/admin/scripts/[id]
Response: { success: boolean }
```

### Execute Script
```
POST /api/admin/scripts/[id]/execute
Response: { execution: FlowExecution, result: any }
```

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Visual flow editor
- ✅ Basic node types
- ✅ Python backend execution
- ✅ Execution history

### Phase 2 (Future)
- [ ] Advanced node types (DB, Email, etc.)
- [ ] Conditional logic nodes
- [ ] Loop/iteration support
- [ ] Real-time execution logs

### Phase 3 (Future)
- [ ] Flow templates library
- [ ] Collaboration features
- [ ] Version control
- [ ] Scheduled executions

## 🤝 Contributing

### Adding New Node Types

1. Define in `backend/mcp/nodes.py`:
```python
NODE_DEFINITIONS["my_node"] = NodeDefinition(...)
```

2. Implement handler in `backend/mcp/server.py`:
```python
elif node.type == "my_node":
    # Implementation
```

3. Add UI component in `components/flow-nodes.tsx`:
```typescript
export const MyNode = memo(({ data, selected }: NodeProps) => {
    // Component
});
```

4. Register in flow editor node types

## 📞 Support

- **Documentation**: See files listed above
- **Modal Docs**: https://modal.com/docs
- **ReactFlow Docs**: https://reactflow.dev
- **Issues**: Check browser console and Modal logs

## 📝 License

Same as parent project

---

**Ready to build your first flow?** Start with [QUICKSTART_FLOW_SCRIPTS.md](QUICKSTART_FLOW_SCRIPTS.md)!
