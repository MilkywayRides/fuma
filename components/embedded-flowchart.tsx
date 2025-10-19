'use client';

import { useEffect, useState } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import { Share2, Copy, Check } from 'lucide-react';
import 'reactflow/dist/style.css';
import { DefaultNode, InputNode, OutputNode } from '@/components/flow-nodes';
import { AnimatedEdge } from '@/components/animated-edge';

const customNodeTypes = {
  default: DefaultNode,
  input: InputNode,
  output: OutputNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

interface EmbeddedFlowchartProps {
  flowchartId: string;
  userId?: string;
}

export function EmbeddedFlowchart({ flowchartId, userId }: EmbeddedFlowchartProps) {
  const [flowData, setFlowData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/flowcharts/${flowchartId}`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setFlowData(JSON.parse(data.data));
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [flowchartId]);

  const embedCode = userId && typeof window !== 'undefined'
    ? `<iframe src="${window.location.origin}/embed/flowchart/${flowchartId}?userId=${userId}" width="100%" height="600" frameborder="0"></iframe>`
    : '';

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="w-full h-[500px] rounded-lg border bg-card shadow-sm flex items-center justify-center">
        <p className="text-muted-foreground">Loading flowchart...</p>
      </div>
    );
  }

  if (error || !flowData) {
    return (
      <div className="w-full h-[500px] rounded-lg border bg-card shadow-sm flex items-center justify-center">
        <p className="text-muted-foreground">Flowchart not found</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Flowchart</h3>
        {userId && (
          <button
            onClick={() => setShowShare(!showShare)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md hover:bg-accent transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share Embed
          </button>
        )}
      </div>

      {showShare && userId && (
        <div className="p-4 rounded-lg border bg-muted/50">
          <p className="text-sm font-medium mb-2">Embed Code</p>
          <div className="flex gap-2">
            <code className="flex-1 p-2 text-xs bg-background border rounded overflow-x-auto">
              {embedCode}
            </code>
            <button
              onClick={copyEmbed}
              className="px-3 py-2 border rounded-md hover:bg-accent transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      <div className="w-full h-[500px] rounded-lg border bg-card shadow-sm overflow-hidden">
        <ReactFlow
          nodes={flowData.nodes || []}
          edges={flowData.edges || []}
          nodeTypes={customNodeTypes}
          edgeTypes={edgeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
        <style jsx global>{`
          .react-flow__node {
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            width: auto !important;
          }
          .react-flow__edge-path {
            stroke: #94a3b8 !important;
            stroke-width: 2px !important;
            stroke-linecap: round !important;
          }
          .react-flow__edge.animated path:nth-child(2) {
            stroke: url(#beam-gradient) !important;
            stroke-width: 2px !important;
            stroke-opacity: 1 !important;
            stroke-linecap: round !important;
          }
        `}</style>
      </div>
    </div>
  );
}
