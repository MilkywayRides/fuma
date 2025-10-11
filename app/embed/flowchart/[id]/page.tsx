'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const WATERMARK_TEXT = '⚡ Powered by BlazeNeuro';

export default function EmbedFlowchartPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const [flowData, setFlowData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetch(`/api/flowcharts/${params.id}/embed?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setFlowData(JSON.parse(data.data));
        }
      })
      .finally(() => setLoading(false));
  }, [params.id, userId]);

  useEffect(() => {
    if (!flowData) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawWatermark = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw watermark background
      const text = WATERMARK_TEXT;
      ctx.font = 'bold 12px system-ui';
      const metrics = ctx.measureText(text);
      const x = canvas.width - metrics.width - 20;
      const y = canvas.height - 20;
      
      // Background box
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(x - 8, y - 18, metrics.width + 16, 26);
      
      // Text
      ctx.fillStyle = 'white';
      ctx.fillText(text, x, y);
    };

    // Initial draw
    setTimeout(drawWatermark, 100);
    
    window.addEventListener('resize', drawWatermark);
    const interval = setInterval(drawWatermark, 100);

    return () => {
      window.removeEventListener('resize', drawWatermark);
      clearInterval(interval);
    };
  }, [flowData]);

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground">Invalid embed code</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!flowData) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground">Flowchart not found</p>
      </div>
    );
  }



  return (
    <div className="relative w-full h-screen" style={{ userSelect: 'none' }}>
      <ReactFlow
        nodes={flowData.nodes || []}
        edges={flowData.edges || []}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      
      {/* Canvas watermark - harder to remove */}
      <canvas
        ref={canvasRef}
        onClick={() => window.open(SITE_URL, '_blank')}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 99999,
          cursor: 'default',
        }}
      />
      
      {/* Clickable area for watermark */}
      <a
        href={SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="watermark-link"
        style={{
          position: 'fixed',
          bottom: '8px',
          right: '8px',
          zIndex: 999999,
          pointerEvents: 'auto',
          cursor: 'pointer',
          width: '200px',
          height: '40px',
        }}
        title="Powered by BlazeNeuro"
      />
      
      <style jsx global>{`
        canvas {
          pointer-events: none !important;
        }
        .watermark-link {
          opacity: 0 !important;
        }
      `}</style>
    </div>
  );
}
