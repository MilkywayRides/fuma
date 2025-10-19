'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  NodeTypes,
  ConnectionMode,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { DefaultNode, InputNode, OutputNode } from '@/components/flow-nodes';
import { GeminiNode, OpenAINode, DiscordNode, DatabaseNode, UserDataNode, FilterNode } from '@/components/ai-flow-nodes';
import { AnimatedEdge } from '@/components/animated-edge';
import { ArrowLeft, Save, Loader2, Play, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const nodeTypes: NodeTypes = {
  default: DefaultNode,
  input: InputNode,
  output: OutputNode,
  gemini: GeminiNode,
  openai: OpenAINode,
  discord: DiscordNode,
  database: DatabaseNode,
  user_data: UserDataNode,
  filter: FilterNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

function FlowEditor({ initialNodes, initialEdges, onSave }: { initialNodes: Node[], initialEdges: Edge[], onSave: (nodes: Node[], edges: Edge[]) => void }) {
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; flowX: number; flowY: number } | null>(null);

  useEffect(() => {
    onSave(nodes, edges);
  }, [nodes, edges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = { ...connection, type: 'animated', id: `e${connection.source}-${connection.target}` };
      setEdges((eds) => addEdge(newEdge, eds));
      toast.success('Connected!');
    },
    [setEdges]
  );

  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    const flowPosition = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    setContextMenu({ x: event.clientX, y: event.clientY, flowX: flowPosition.x, flowY: flowPosition.y });
  }, [reactFlowInstance]);

  const addNode = (type: string) => {
    if (!contextMenu) return;
    const newNode: Node = {
      id: `${Date.now()}`,
      type,
      position: { x: contextMenu.flowX, y: contextMenu.flowY },
      data: { 
        title: type === 'input' ? 'Input' : type === 'output' ? 'Output' : 'Title',
        content: type === 'input' ? 'Start node' : type === 'output' ? 'End node' : 'Content'
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setContextMenu(null);
  };

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneContextMenu={onPaneContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        deleteKeyCode="Delete"
        defaultEdgeOptions={{ type: 'animated' }}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
      {contextMenu && (
        <div
          className="fixed bg-popover border rounded-md shadow-md p-1 z-50"
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <div className="text-xs font-semibold px-2 py-1 text-muted-foreground">Basic</div>
          <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm" onClick={() => addNode('input')}>Input Node</button>
          <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm" onClick={() => addNode('default')}>Process Node</button>
          <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm" onClick={() => addNode('output')}>Output Node</button>
          <div className="border-t my-1"></div>
          <div className="text-xs font-semibold px-2 py-1 text-muted-foreground">AI</div>
          <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm" onClick={() => addNode('gemini')}>Google Gemini</button>
          <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm" onClick={() => addNode('openai')}>ChatGPT</button>
          <div className="border-t my-1"></div>
          <div className="text-xs font-semibold px-2 py-1 text-muted-foreground">Data</div>
          <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm" onClick={() => addNode('user_data')}>User Data</button>
          <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm" onClick={() => addNode('database')}>Database Query</button>
          <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm" onClick={() => addNode('filter')}>Filter Data</button>
          <div className="border-t my-1"></div>
          <div className="text-xs font-semibold px-2 py-1 text-muted-foreground">Communication</div>
          <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm" onClick={() => addNode('discord')}>Discord Webhook</button>
        </div>
      )}
    </>
  );
}

export default function FlowEditorPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;
  
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/admin/scripts/${uuid}`)
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.script.title);
        setNodes(JSON.parse(data.script.nodes));
        setEdges(JSON.parse(data.script.edges));
        setIsNew(false);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [uuid]);

  const onFlowChange = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    setNodes(newNodes);
    setEdges(newEdges);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? '/api/admin/scripts' : `/api/admin/scripts/${uuid}`;
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: uuid,
          title: title || 'Untitled Flow',
          description: '',
          nodes,
          edges,
          published: false,
        }),
      });
      setIsNew(false);
      toast.success('Flow saved');
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const response = await fetch(`/api/admin/scripts/${uuid}/execute`, { method: 'POST' });
      const result = await response.json();
      if (response.ok) {
        toast.success('Flow executed successfully!');
      } else {
        toast.error(`Execution failed: ${result.error}`);
      }
    } catch (error) {
      toast.error('Failed to execute flow');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this flow?')) return;
    try {
      await fetch(`/api/admin/scripts/${uuid}`, { method: 'DELETE' });
      router.push('/admin/scripts');
    } catch (error) {
      toast.error('Failed to delete flow');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push('/admin/scripts')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
        {!isNew && (
          <>
            <Button onClick={handleExecute} disabled={isExecuting} variant="outline">
              <Play className="w-4 h-4 mr-2" />
              {isExecuting ? 'Running...' : 'Execute'}
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </>
        )}
        <div className="px-4 py-2 bg-card border rounded-md">
          <span className="font-medium">{title || 'Untitled Flow'}</span>
        </div>
      </div>

      <div className="w-full h-full">
        <ReactFlowProvider>
          <FlowEditor initialNodes={nodes} initialEdges={edges} onSave={onFlowChange} />
        </ReactFlowProvider>
      </div>

      <style jsx global>{`
        .react-flow__node {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          width: auto !important;
        }
        .react-flow__handle {
          width: 20px !important;
          height: 20px !important;
          border: none !important;
          background: transparent !important;
          border-radius: 50% !important;
          cursor: pointer !important;
          z-index: 1000 !important;
          opacity: 0 !important;
        }
        .react-flow__handle-left {
          left: -10px !important;
        }
        .react-flow__handle-right {
          right: -10px !important;
        }
        .react-flow__handle:hover {
          width: 24px !important;
          height: 24px !important;
          background: #2563eb !important;
        }
        .react-flow__handle.connecting {
          background: #10b981 !important;
        }
        .react-flow__handle.valid {
          background: #10b981 !important;
        }
        .react-flow__edge-path {
          stroke: #94a3b8 !important;
          stroke-width: 2px !important;
          stroke-linecap: round !important;
          stroke-dasharray: 0 !important;
        }
        .react-flow__edge.animated path:nth-child(2) {
          stroke: url(#beam-gradient) !important;
          stroke-width: 2px !important;
          stroke-opacity: 1 !important;
          stroke-linecap: round !important;
          stroke-dasharray: 0 !important;
        }
        .react-flow__edge.selected .react-flow__edge-path {
          stroke: #3b82f6 !important;
          stroke-width: 3px !important;
        }
      `}</style>
    </div>
  );
}
