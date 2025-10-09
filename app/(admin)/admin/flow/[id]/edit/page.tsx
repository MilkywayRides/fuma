'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FlowEditor } from '@/components/flow-editor';
import { Node, Edge } from 'reactflow';
import { use } from 'react';

export default function EditFlowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [flowchart, setFlowchart] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/flowcharts/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setFlowchart(data);
        setLoading(false);
      });
  }, [id]);

  async function handleSave(nodes: Node[], edges: Edge[], title: string, published: boolean) {
    const data = JSON.stringify({ nodes, edges });

    const res = await fetch(`/api/flowcharts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, data, published }),
    });

    if (res.ok) {
      alert('Flowchart saved!');
    } else {
      alert('Failed to update flowchart');
    }
  }

  if (loading) return <div>Loading...</div>;

  const { nodes, edges } = JSON.parse(flowchart.data);

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Edit Flowchart: {flowchart.title}</h1>
      <FlowEditor
        initialNodes={nodes}
        initialEdges={edges}
        initialTitle={flowchart.title}
        flowId={id}
        onSave={handleSave}
      />
    </div>
  );
}
