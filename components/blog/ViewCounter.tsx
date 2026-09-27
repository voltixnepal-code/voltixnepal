'use client';

import React, { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

interface ViewCounterProps {
  slug: string;
  initialViews?: number;
}

export default function ViewCounter({ slug, initialViews = 0 }: ViewCounterProps) {
  const [views, setViews] = useState<number>(initialViews || 0);

  useEffect(() => {
    let isMounted = true;

    async function incrementAndFetchViews() {
      try {
        const res = await fetch(`/api/blog/${encodeURIComponent(slug)}/view`, {
          method: 'POST',
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && typeof data.views === 'number') {
            setViews(data.views);
          }
        }
      } catch (err) {
        console.warn('Failed to increment view count:', err);
      }
    }

    incrementAndFetchViews();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const formattedViews = views.toLocaleString('en-US');

  return (
    <span className="flex items-center gap-1.5 font-medium text-slate-600">
      <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <span>{formattedViews} {views === 1 ? 'view' : 'views'}</span>
    </span>
  );
}
