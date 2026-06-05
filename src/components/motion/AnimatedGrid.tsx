'use client';

import type { ReactNode } from 'react';

/** Re-mounts on `gridKey` change so stagger CSS replays when filters/tabs switch. */
export default function AnimatedGrid({
  gridKey,
  className = '',
  children,
}: {
  gridKey: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div key={gridKey} className={`stagger-grid ${className}`}>
      {children}
    </div>
  );
}
