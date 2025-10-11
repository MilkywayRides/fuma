'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { toast } from 'sonner';
import { DefaultNode, InputNode, OutputNode } from '@/components/flow-nodes';

const nodeTypes = [
  { type: 'default', label: 'Default Node' },
  { type: 'input', label: 'Input Node' },
  { type: 'output', label: 'Output Node' },
];

const customNodeTypes = {
  default: DefaultNode,
  input: InputNode,
  output: OutputNode,
};

export default function FlowchartEditor() {
  const params = useParams();
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      setNodes((nds) => nds.filter((node) => !deleted.find((d) => d.id === node.id)));
    },
    [setNodes]
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      setEdges((eds) => eds.filter((edge) => !deleted.find((d) => d.id === edge.id)));
    },
    [setEdges]
  );

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
  }, [params.id, setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

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

  const addNode = (type: string, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `${Date.now()}`,
      type,
      position,
      data: { 
        title: type === 'input' ? 'Input' : type === 'output' ? 'Output' : 'Title',
        content: type === 'input' ? 'Start node' : type === 'output' ? 'End node' : 'Content'
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

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

      <ContextMenu>
        <ContextMenuTrigger className="w-full h-full">
          <div ref={reactFlowWrapper} className="w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodesDelete={onNodesDelete}
              onEdgesDelete={onEdgesDelete}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              nodeTypes={customNodeTypes}
              deleteKeyCode="Delete"
              fitView
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {nodeTypes.map((nodeType) => (
            <ContextMenuItem
              key={nodeType.type}
              onClick={() => {
                const position = reactFlowInstance?.screenToFlowPosition({
                  x: window.innerWidth / 2,
                  y: window.innerHeight / 2,
                });
                addNode(nodeType.type, position || { x: 250, y: 250 });
              }}
            >
              Add {nodeType.label}
            </ContextMenuItem>
          ))}
        </ContextMenuContent>
      </ContextMenu>
      
      <style jsx global>{`
        .react-flow__node {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          width: auto !important;
        }
        .react-flow__node > div {
          position: relative;
        }
        .react-flow__handle {
          width: 6px !important;
          height: 6px !important;
          position: absolute !important;
        }
        .react-flow__handle-left {
          left: 0 !important;
          transform: translateX(-50%) !important;
        }
        .react-flow__handle-right {
          right: 0 !important;
          left: auto !important;
          transform: translateX(50%) !important;
        }
      `}</style>
    </div>
  );
}
