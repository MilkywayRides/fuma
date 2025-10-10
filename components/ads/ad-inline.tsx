'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';

interface Ad {
  id: number;
  title: string;
  content: string;
  link: string | null;
  imageUrl: string | null;
}

export function AdInline({ position }: { position: string }) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/ads')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter((a: Ad & { position: string }) => a.position === position);
        if (filtered.length > 0) {
          setAd(filtered[Math.floor(Math.random() * filtered.length)]);
        }
      });
  }, [position]);

  if (!ad || dismissed) return null;

  return (
    <div className="my-8 relative rounded-lg border-2 border-dashed bg-muted/50 p-6">
      <div className="absolute -top-3 left-4 bg-background px-2 flex items-center gap-1 text-xs text-muted-foreground">
        <Sparkles className="w-3 h-3" />
        Sponsored
      </div>
      
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 rounded hover:bg-accent"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex gap-4 items-start">
        {ad.imageUrl && (
          <img src={ad.imageUrl} alt={ad.title} className="w-24 h-24 rounded object-cover flex-shrink-0" />
        )}
        
        <div className="flex-1">
          <h3 className="font-semibold mb-2">{ad.title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{ad.content}</p>
          
          {ad.link && (
            <a
              href={ad.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              Visit Website →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
