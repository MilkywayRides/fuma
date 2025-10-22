'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface Ad {
  id: number;
  title: string;
  content: string;
  link: string | null;
  imageUrl: string | null;
}

export function AdSidebar({ position }: { position: string }) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [dismissed, setDismissed] = useState<number[]>([]);

  useEffect(() => {
    fetch('/api/ads')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter((a: Ad & { position: string }) => a.position === position);
        setAds(filtered);
      });
  }, [position]);

  const visibleAds = ads.filter(ad => !dismissed.includes(ad.id));
  if (visibleAds.length === 0) return null;

  return (
    <div className="space-y-4">
      {visibleAds.map((ad) => (
        <div key={ad.id} className="relative rounded-lg border bg-card p-4 shadow-sm">
          <div className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-background/80 backdrop-blur-sm border rounded">
            Ad
          </div>
          <button
            onClick={() => setDismissed([...dismissed, ad.id])}
            className="absolute top-2 right-2 p-1 rounded hover:bg-accent"
          >
            <X className="w-3 h-3" />
          </button>
          
          {ad.imageUrl && (
            <img src={ad.imageUrl} alt={ad.title} className="w-full rounded mb-3 aspect-video object-cover" />
          )}
          
          <h4 className="font-semibold text-sm mb-2">{ad.title}</h4>
          <p className="text-xs text-muted-foreground mb-3">{ad.content}</p>
          
          {ad.link && (
            <a
              href={ad.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline font-medium"
            >
              Learn More →
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
