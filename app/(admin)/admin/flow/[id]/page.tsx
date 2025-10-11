'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  Edge,
  ConnectionMode,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DefaultNode, InputNode, OutputNode } from '@/components/flow-nodes';
import { AnimatedEdge } from '@/components/animated-edge';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

const customNodeTypes = {
  default: DefaultNode,
  input: InputNode,
  output: OutputNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

function FlowEditor({ initialNodes, initialEdges, onSave }: { initialNodes: Node[], initialEdges: Edge[], onSave: (nodes: Node[], edges: Edge[]) => void }) {
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

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
    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    setContextMenuPos(position);
  }, [reactFlowInstance]);

  const addNode = (type: string) => {
    if (!contextMenuPos) return;
    const newNode: Node = {
      id: `${Date.now()}`,
      type,
      position: contextMenuPos,
      data: { 
        title: type === 'input' ? 'Input' : type === 'output' ? 'Output' : 'Title',
        content: type === 'input' ? 'Start node' : type === 'output' ? 'End node' : 'Content'
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setContextMenuPos(null);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="w-full h-full" onContextMenu={onPaneContextMenu}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={customNodeTypes}
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
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => addNode('input')}>Add Input Node</ContextMenuItem>
        <ContextMenuItem onClick={() => addNode('default')}>Add Default Node</ContextMenuItem>
        <ContextMenuItem onClick={() => addNode('output')}>Add Output Node</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default function FlowchartEditor() {
  const params = useParams();
  const router = useRouter();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/flowcharts/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title);
        const flowData = JSON.parse(data.data);
        setNodes(flowData.nodes || []);
        setEdges(flowData.edges || []);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/flowcharts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: JSON.stringify({ nodes, edges }),
        }),
      });
      toast.success('Flowchart saved');
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const onFlowChange = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    setNodes(newNodes);
    setEdges(newEdges);
  }, []);





  if (loading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push('/admin/flow')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <div className="px-4 py-2 bg-card border rounded-md">
          <span className="font-medium">{title}</span>
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
