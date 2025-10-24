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
  ConnectionMode,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft, Save, Loader2, Code } from 'lucide-react';
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
import Editor from '@monaco-editor/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; flowX: number; flowY: number } | null>(null);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      onSave(nodes, edges);
    }, 300);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [nodes, edges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = { ...connection, type: 'animated', id: `e${connection.source}-${connection.target}` };
      setEdges((eds) => addEdge(newEdge, eds));
      toast.success('Connected!');
    },
    [setEdges]
  );

  const onPaneClick = useCallback(() => {
    setNodes((nds) => nds.map((node) => ({ ...node, selected: false })));
    setEdges((eds) => eds.map((edge) => ({ ...edge, selected: false })));
  }, [setNodes, setEdges]);

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
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
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
      {contextMenu && (
        <div
          className="fixed bg-popover border rounded-md shadow-md p-1 z-50"
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <button
            className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
            onClick={() => addNode('input')}
          >
            Add Input Node
          </button>
          <button
            className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
            onClick={() => addNode('default')}
          >
            Add Default Node
          </button>
          <button
            className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
            onClick={() => addNode('output')}
          >
            Add Output Node
          </button>
        </div>
      )}
    </>
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
  const [codeEditorOpen, setCodeEditorOpen] = useState(false);
  const [code, setCode] = useState('');
  const [editorWidth, setEditorWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [isCodeEditing, setIsCodeEditing] = useState(false);
  const [scriptCode, setScriptCode] = useState(`// Declarative Flowchart Definition
// Define your flowchart structure - running multiple times produces same result

return {
  nodes: [
    { id: 'start', type: 'input', x: 100, y: 100, title: 'Start', content: 'Begin' },
    { id: 'process', type: 'default', x: 300, y: 100, title: 'Process', content: 'Work' },
    { id: 'end', type: 'output', x: 500, y: 100, title: 'End', content: 'Done' }
  ],
  edges: [
    { from: 'start', to: 'process' },
    { from: 'process', to: 'end' }
  ]
};`);

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

  const handleOpenCodeEditor = () => {
    setCodeEditorOpen(!codeEditorOpen);
  };

  const generateScriptFromFlow = useCallback((nodes: Node[], edges: Edge[]) => {
    const nodesDef = nodes.map(n => 
      `    { id: '${n.id}', type: '${n.type}', x: ${Math.round(n.position.x)}, y: ${Math.round(n.position.y)}, title: '${n.data.title || ''}', content: '${n.data.content || ''}' }`
    ).join(',\n');
    
    const edgesDef = edges.map(e => 
      `    { from: '${e.source}', to: '${e.target}' }`
    ).join(',\n');
    
    return `// Declarative Flowchart Definition\n// Define your flowchart structure - running multiple times produces same result\n\nreturn {\n  nodes: [\n${nodesDef}\n  ],\n  edges: [\n${edgesDef}\n  ]\n};`;
  }, []);

  useEffect(() => {
    if (!isCodeEditing && nodes.length > 0) {
      const timer = setTimeout(() => {
        setCode(JSON.stringify({ nodes, edges }, null, 2));
        const scriptDef = generateScriptFromFlow(nodes, edges);
        setScriptCode(scriptDef);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [nodes, edges, isCodeEditing, generateScriptFromFlow]);

  const handleCodeChange = (value: string | undefined) => {
    if (!value) return;
    setCode(value);
    setIsCodeEditing(true);
    try {
      const flowData = JSON.parse(value);
      setNodes(flowData.nodes || []);
      setEdges(flowData.edges || []);
    } catch (error) {
      // Invalid JSON
    }
    setTimeout(() => setIsCodeEditing(false), 100);
  };

  const handleScriptChange = (value: string | undefined) => {
    if (value !== undefined) {
      setScriptCode(value);
    }
  };

  const executeScript = () => {
    try {
      setIsCodeEditing(true);
      
      const func = new Function(scriptCode);
      const definition = func();
      
      if (!definition || !definition.nodes) {
        throw new Error('Script must return an object with nodes array');
      }
      
      const newNodes: Node[] = definition.nodes.map((n: any) => ({
        id: n.id || `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: n.type || 'default',
        position: { x: n.x || 0, y: n.y || 0 },
        data: {
          title: n.title || 'Node',
          content: n.content || ''
        }
      }));
      
      const newEdges: Edge[] = (definition.edges || []).map((e: any) => ({
        id: `e${e.from}-${e.to}`,
        source: e.from,
        target: e.to,
        type: 'animated'
      }));
      
      setNodes(newNodes);
      setEdges(newEdges);
      
      toast.success(`Flowchart updated: ${newNodes.length} nodes, ${newEdges.length} edges`);
      
      setTimeout(() => setIsCodeEditing(false), 100);
    } catch (error: any) {
      toast.error(`Script error: ${error.message}`);
      setIsCodeEditing(false);
    }
  };

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) {
      setEditorWidth(newWidth);
    }
  }, [isResizing]);

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex">
      {codeEditorOpen && (
        <>
          <div className="h-full flex flex-col border-r" style={{ width: `${editorWidth}%` }}>
            <Tabs defaultValue="scripting" className="h-full flex flex-col">
              <div className="p-4 border-b">
                <TabsList>
                  <TabsTrigger value="scripting">Scripting</TabsTrigger>
                  <TabsTrigger value="json">JSON</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="scripting" className="flex-1 m-0 flex flex-col">
                <div className="p-2 border-b flex items-center justify-between bg-muted/50">
                  <span className="text-xs text-muted-foreground">Declarative API - Define desired state (syncs with UI)</span>
                  <Button size="sm" onClick={executeScript}>Apply Script</Button>
                </div>
                <div onKeyDown={(e) => e.stopPropagation()} className="flex-1">
                  <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    value={scriptCode}
                    onChange={handleScriptChange}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on',
                    }}
                  />
                </div>
              </TabsContent>
              <TabsContent value="json" className="flex-1 m-0">
                <div onKeyDown={(e) => e.stopPropagation()} className="h-full">
                  <Editor
                    height="100%"
                    defaultLanguage="json"
                    value={code}
                    onChange={handleCodeChange}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: true },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      formatOnPaste: true,
                      formatOnType: true,
                      tabSize: 2,
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div
            className="w-1 bg-border hover:bg-primary cursor-col-resize transition-colors"
            onMouseDown={handleMouseDown}
          />
        </>
      )}

      <div className="flex-1 h-full relative">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push('/admin/flow')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outline" onClick={handleOpenCodeEditor}>
            <Code className="w-4 h-4 mr-2" />
            {codeEditorOpen ? 'Hide' : 'Show'} Code
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
