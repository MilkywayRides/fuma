'use client';

import { useEffect, useState } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

interface EmbeddedFlowchartProps {
  flowchartId: string;
}

export function EmbeddedFlowchart({ flowchartId }: EmbeddedFlowchartProps) {
  const [flowData, setFlowData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  if (loading) {
    return (
      <div className="w-full h-[400px] border rounded-lg flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">Loading flowchart...</p>
      </div>
    );
  }

  if (error || !flowData) {
    return (
      <div className="w-full h-[400px] border rounded-lg flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">Flowchart not found</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] border rounded-lg overflow-hidden bg-background">
      <ReactFlow
        nodes={flowData.nodes || []}
        edges={flowData.edges || []}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
