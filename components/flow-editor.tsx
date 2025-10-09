'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Maximize } from 'lucide-react';

interface FlowEditorProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  initialTitle?: string;
  flowId?: string;
  onSave: (nodes: Node[], edges: Edge[], title: string, published: boolean) => void;
}

export function FlowEditor({ initialNodes = [], initialEdges = [], initialTitle = '', flowId, onSave }: FlowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [open, setOpen] = useState(!flowId && !initialTitle);
  const [fullscreenOpen, setFullscreenOpen] = useState(!!flowId);
  const [title, setTitle] = useState(initialTitle);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = () => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type: 'default',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: `Node ${nodes.length + 1}` },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSave = (published: boolean) => {
    if (!title) return;
    onSave(nodes, edges, title, published);
    setOpen(false);
  };

  const handleQuickSave = () => {
    if (title) {
      onSave(nodes, edges, title, false);
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <div className="h-[600px] border rounded-lg">
        <div className="flex gap-2 p-2 border-b bg-background">
          <button
            onClick={addNode}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Add Node
          </button>
          <button
            onClick={handleQuickSave}
            className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
          >
            Save
          </button>
          <button
            onClick={() => setFullscreenOpen(true)}
            className="ml-auto px-3 py-1 text-sm border rounded hover:bg-accent"
          >
            <Maximize className="h-4 w-4" />
          </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Flowchart</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter flowchart title" />
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => handleSave(false)}
                className="px-4 py-2 border rounded-md hover:bg-accent"
              >
                Save as Draft
              </button>
              <button
                onClick={() => handleSave(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Publish
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="h-[calc(100%-48px)] bg-white dark:bg-gray-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <Background gap={20} size={1} color="#e5e7eb" />
        </ReactFlow>
      </div>
    </div>

    {fullscreenOpen && (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <Background gap={20} size={1} color="#e5e7eb" />
        </ReactFlow>
      </div>
    )}
    </>
  );  
}
