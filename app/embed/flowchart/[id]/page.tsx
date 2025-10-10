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
  const [watermarkVisible, setWatermarkVisible] = useState(true);
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

    // Watermark protection - start after component mounts
    const startProtection = setTimeout(() => {
      const checkWatermark = () => {
        const watermark = document.querySelector('.watermark-link');
        if (watermark) {
          const styles = getComputedStyle(watermark);
          if (styles.display === 'none' || 
              styles.visibility === 'hidden' ||
              parseFloat(styles.opacity) < 0.5) {
            setWatermarkVisible(false);
          }
        }
      };

      const observer = new MutationObserver(checkWatermark);
      observer.observe(document.body, { 
        attributes: true, 
        subtree: true,
        attributeFilter: ['style', 'class']
      });

      const interval = setInterval(checkWatermark, 2000);

      return () => {
        observer.disconnect();
        clearInterval(interval);
      };
    }, 2000);

    return () => {
      clearTimeout(startProtection);
    };
  }, [params.id, userId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawWatermark = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw watermark
      ctx.font = 'bold 12px system-ui';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      
      const text = WATERMARK_TEXT;
      const metrics = ctx.measureText(text);
      const x = canvas.width - metrics.width - 20;
      const y = canvas.height - 20;
      
      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(x - 8, y - 16, metrics.width + 16, 24);
      
      // Text
      ctx.fillStyle = 'white';
      ctx.fillText(text, x, y);
    };

    drawWatermark();
    window.addEventListener('resize', drawWatermark);
    const interval = setInterval(drawWatermark, 100);

    return () => {
      window.removeEventListener('resize', drawWatermark);
      clearInterval(interval);
    };
  }, []);

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

  if (!watermarkVisible) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <p className="text-xl font-bold mb-2">Watermark Removed</p>
          <p className="text-muted-foreground">This embed requires the BlazeNeuro watermark to be visible.</p>
        </div>
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
