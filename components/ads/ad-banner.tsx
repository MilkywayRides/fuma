'use client';

import { useEffect, useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

interface Ad {
  id: number;
  title: string;
  content: string;
  link: string | null;
  imageUrl: string | null;
}

export function AdBanner({ position }: { position: string }) {
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
    <div className="relative w-full bg-gradient-to-r from-primary/10 via-primary/5 to-background border-y">
      <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium bg-background/80 backdrop-blur-sm border rounded">
        Ad
      </div>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {ad.imageUrl && (
              <img src={ad.imageUrl} alt={ad.title} className="w-16 h-16 rounded object-cover" loading="lazy" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{ad.title}</h3>
              <p className="text-sm text-muted-foreground">{ad.content}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {ad.link && (
              <a
                href={`/api/ads/redirect/${ad.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={() => setDismissed(true)}
              className="p-2 rounded-md hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
