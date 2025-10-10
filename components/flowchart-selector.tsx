'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface FlowchartSelectorProps {
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function FlowchartSelector({ onSelect, onClose }: FlowchartSelectorProps) {
  const [flowcharts, setFlowcharts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/flowcharts')
      .then(res => res.json())
      .then(data => setFlowcharts(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Select Flowchart</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading flowcharts...</p>
          ) : flowcharts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No flowcharts available</p>
          ) : (
            <div className="grid gap-3">
              {flowcharts.map((flow) => (
                <button
                  key={flow.id}
                  onClick={() => {
                    onSelect(flow.id);
                    onClose();
                  }}
                  className="text-left p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="font-medium">{flow.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    ID: {flow.id} • {flow.published ? 'Published' : 'Draft'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
