'use client';

import { useEffect, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  content: string;
  link: string | null;
  imageUrl: string | null;
}

export function AdCard({ position }: { position: string }) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/ads')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter((a: Ad & { position: string }) => a.position === position);
        if (filtered.length > 0) {
          const selectedAd = filtered[Math.floor(Math.random() * filtered.length)];
          setAd(selectedAd);
          if (navigator.sendBeacon) {
            navigator.sendBeacon(`/api/ads/${selectedAd.id}/view`);
          } else {
            fetch(`/api/ads/${selectedAd.id}/view`, { method: 'POST', keepalive: true });
          }
        }
      });
  }, [position]);

  if (!ad || dismissed) return null;

  return (
    <div className="relative rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className="absolute top-2 left-2 z-10 px-2 py-1 text-xs font-medium bg-background/80 backdrop-blur-sm border rounded">
        Ad
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-md hover:bg-accent transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      
      {ad.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden">
          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{ad.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{ad.content}</p>
        
        {ad.link && (
          <a
            href={`/api/ads/redirect/${ad.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Learn More
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
