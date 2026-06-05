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
    <div className="rounded-lg border border-stone-800 bg-[#f5f0e9] p-7 text-[#151413]">
      <p className="text-sm font-medium text-stone-500">Overall rating</p>
      <div className="mt-4 flex items-end gap-2">
        <span className="text-7xl font-semibold leading-none">
          {score ?? '—'}
        </span>
        <span className="pb-2 text-xl font-medium text-stone-500">/100</span>
      </div>
      <p className="mt-4 text-sm font-medium text-stone-700">{label}</p>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-stone-300">
        <div
          className="h-full rounded-full bg-[#151413] transition-[width] duration-700 ease-[var(--ease-out)] motion-reduce:transition-none"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
