'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DefaultNode, InputNode, OutputNode } from '@/components/flow-nodes';

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
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

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
    (connection: Connection) => {
      console.log('Connection attempt:', connection);
      const newEdge = { ...connection, animated: true, id: `e${connection.source}-${connection.target}` };
      setEdges((eds) => addEdge(newEdge, eds));
      toast.success('Connected!');
    },
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
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          onConnect={onConnect}
          onInit={(instance) => {
            console.log('ReactFlow initialized');
            setReactFlowInstance(instance);
          }}
          nodeTypes={customNodeTypes}
          connectionMode={ConnectionMode.Loose}
          deleteKeyCode="Delete"
          defaultEdgeOptions={{ animated: true }}
          fitView
        >

          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
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
