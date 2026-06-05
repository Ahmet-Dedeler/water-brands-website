'use client';

import { useEffect, useState } from 'react';
import type { ScoreBreakdownItem } from '@/types';
import { titleize } from '@/lib/format';

function PenaltyBar({ item }: { item: ScoreBreakdownItem }) {
  return (
    <li className="flex items-center justify-between py-2.5">
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {item.label}
        {item.description && (
          <span className="text-gray-400 dark:text-gray-500"> · {titleize(item.description)}</span>
        )}
      </span>
      <span className="text-sm font-semibold text-rose-600 dark:text-rose-400 tabular-nums">{item.score}</span>
    </li>
  );
}

function ProgressBar({ item }: { item: ScoreBreakdownItem }) {
  const max = item.max ?? Math.max(item.score, 1);
  const pct = Math.max(0, Math.min(100, (item.score / max) * 100));
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(pct));
    return () => cancelAnimationFrame(frame);
  }, [pct]);

  return (
    <li className="py-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {item.label}
          {item.description && (
            <span className="text-gray-400 dark:text-gray-500"> · {titleize(item.description)}</span>
          )}
        </span>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
          {item.score}
          {item.max != null && <span className="text-gray-400 dark:text-gray-500">/{item.max}</span>}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-[var(--surface-muted)] overflow-hidden">
        <div
          className="h-full rounded-full bg-sky-500 transition-[width] duration-700 ease-[var(--ease-out)] motion-reduce:transition-none"
          style={{ width: `${width}%` }}
        />
      </div>
    </li>
  );
}

export default function ScoreBarAnimated({ item }: { item: ScoreBreakdownItem }) {
  const isPenalty = item.id.endsWith('_penalty') || item.score < 0;
  if (isPenalty) return <PenaltyBar item={item} />;
  return <ProgressBar item={item} />;
}
