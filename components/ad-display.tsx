'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface Ad {
  id: number;
  title: string;
  content: string;
  link: string | null;
  imageUrl: string | null;
  position: string;
}

export function AdDisplay({ position }: { position: 'sidebar' | 'banner' | 'footer' }) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<number[]>([]);

  useEffect(() => {
    fetch('/api/ads')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter((ad: Ad) => ad.position === position);
        setAds(filtered);
      });
  }, [position]);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  const visibleAds = ads.filter(ad => !dismissed.includes(ad.id));
  if (visibleAds.length === 0) return null;

  const currentAd = visibleAds[currentIndex % visibleAds.length];
  if (!currentAd) return null;

  const AdContent = () => (
    <div className="relative p-4 border rounded-lg bg-card shadow-sm">
      <button
        onClick={() => setDismissed([...dismissed, currentAd.id])}
        className="absolute top-2 right-2 p-1 hover:bg-accent rounded"
      >
        <X className="w-4 h-4" />
      </button>
      {currentAd.imageUrl && (
        <img src={currentAd.imageUrl} alt={currentAd.title} className="w-full rounded mb-3" />
      )}
      <h3 className="font-semibold mb-2">{currentAd.title}</h3>
      <p className="text-sm text-muted-foreground mb-3">{currentAd.content}</p>
      {currentAd.link && (
        <a
          href={currentAd.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          Learn More →
        </a>
      )}
    </div>
  );

  if (currentAd.link) {
    return (
      <a href={currentAd.link} target="_blank" rel="noopener noreferrer" className="block">
        <AdContent />
      </a>
    );
  }

  return <AdContent />;
}
