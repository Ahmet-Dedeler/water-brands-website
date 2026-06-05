'use client';

import type { ReactNode } from 'react';

/** Opacity fade for "show more" items — skips replaying the full grid stagger. */
export default function RevealItem({
  index,
  revealFrom,
  children,
  className = '',
}: {
  index: number;
  revealFrom: number;
  children: ReactNode;
  className?: string;
}) {
  const isNew = revealFrom > 0 && index >= revealFrom;
  const delay = isNew ? Math.min((index - revealFrom) * 25, 150) : undefined;

  return (
    <div
      className={`${className}${isNew ? ' reveal-item' : ''}`}
      style={isNew ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
