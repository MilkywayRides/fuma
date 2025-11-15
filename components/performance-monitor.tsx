'use client';

import { useEffect } from 'react';

export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log('Page Load Time:', navEntry.loadEventEnd - navEntry.fetchStart);
          }
        }
      });

      observer.observe({ entryTypes: ['navigation', 'paint'] });

      return () => observer.disconnect();
    }
  }, []);

  return null;
}
