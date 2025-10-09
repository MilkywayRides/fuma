'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FlowEditor } from '@/components/flow-editor';
import { Node, Edge } from 'reactflow';

export default function NewFlowPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSave(nodes: Node[], edges: Edge[], title: string, published: boolean) {
    setLoading(true);

    const data = JSON.stringify({ nodes, edges });

    const res = await fetch('/api/flowcharts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, data, published }),
    });

    if (res.ok) {
      const result = await res.json();
      router.push(`/admin/flow/${result.id}/edit`);
      router.refresh();
    } else {
      alert('Failed to create flowchart');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Create New Flowchart</h1>
      <FlowEditor onSave={handleSave} />
    </div>
  );
}
