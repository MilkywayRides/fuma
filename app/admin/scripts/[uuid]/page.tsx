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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { DefaultNode, InputNode, OutputNode } from '@/components/flow-nodes';
import { PlayIcon, SaveIcon, Trash2Icon } from 'lucide-react';

const nodeTypes: NodeTypes = {
  default: DefaultNode,
  input: InputNode,
  output: OutputNode,
};

export default function FlowEditorPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    const loadScript = async () => {
      try {
        const response = await fetch(`/api/admin/scripts/${uuid}`);
        if (response.ok) {
          const { script } = await response.json();
          setTitle(script.title);
          setDescription(script.description || '');
          setNodes(JSON.parse(script.nodes));
          setEdges(JSON.parse(script.edges));
          setIsNew(false);
        }
      } catch (error) {
        console.error('Failed to load script:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadScript();
  }, [uuid]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { title: type === 'input' ? 'Start' : type === 'output' ? 'End' : 'Process', content: '' },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSave = async (published: boolean) => {
    if (!title) {
      alert('Please enter a title');
      return;
    }

    setIsSaving(true);
    try {
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? '/api/admin/scripts' : `/api/admin/scripts/${uuid}`;
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: uuid,
          title,
          description,
          nodes,
          edges,
          published,
        }),
      });

      if (response.ok) {
        setIsNew(false);
        alert('Flow saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save flow');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const response = await fetch(`/api/admin/scripts/${uuid}/execute`, {
        method: 'POST',
      });

      const result = await response.json();
      if (response.ok) {
        alert('Flow executed successfully!');
      } else {
        alert(`Execution failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to execute:', error);
      alert('Failed to execute flow');
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
      console.error('Failed to delete:', error);
      alert('Failed to delete flow');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-[600px] bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-4">
      <Card className="p-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Flow script title"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => addNode('input')} variant="outline" size="sm">
            Add Start Node
          </Button>
          <Button onClick={() => addNode('default')} variant="outline" size="sm">
            Add Process Node
          </Button>
          <Button onClick={() => addNode('output')} variant="outline" size="sm">
            Add End Node
          </Button>
          <div className="ml-auto flex gap-2">
            {!isNew && (
              <>
                <Button onClick={handleDelete} variant="destructive" size="sm">
                  <Trash2Icon className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button onClick={handleExecute} disabled={isExecuting} size="sm">
                  <PlayIcon className="h-4 w-4 mr-2" />
                  {isExecuting ? 'Running...' : 'Execute'}
                </Button>
              </>
            )}
            <Button onClick={() => handleSave(false)} disabled={isSaving} variant="outline" size="sm">
              <SaveIcon className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={() => handleSave(true)} disabled={isSaving} size="sm">
              <SaveIcon className="h-4 w-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </Card>

      <div className="h-[600px] border rounded-lg bg-background">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
