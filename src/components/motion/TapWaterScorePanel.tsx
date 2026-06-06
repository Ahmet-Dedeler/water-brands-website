'use client';

import { useEffect, useState } from 'react';

export default function TapWaterScorePanel({
  score,
  label,
}: {
  score: number | null;
  label: string;
}) {
  const clamped = Math.max(0, Math.min(score ?? 0, 100));
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(clamped));
    return () => cancelAnimationFrame(frame);
  }, [clamped]);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-7 shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall rating</p>
      <div className="mt-4 flex items-end gap-2">
        <span className="text-7xl font-semibold leading-none text-gray-900 dark:text-gray-100">
          {score ?? '—'}
        </span>
        <span className="pb-2 text-xl font-medium text-gray-500 dark:text-gray-400">/100</span>
      </div>
      <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-[var(--surface-muted)]">
        <div
          className="h-full rounded-full bg-sky-600 transition-[width] duration-700 ease-[var(--ease-out)] motion-reduce:transition-none dark:bg-sky-500"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
