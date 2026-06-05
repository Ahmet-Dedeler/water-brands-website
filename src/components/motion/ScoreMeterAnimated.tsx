'use client';

import { useEffect, useState } from 'react';

function scoreLabel(score: number) {
  if (score <= -4) return 'Very bad';
  if (score < 0) return 'Poor';
  if (score === 0) return 'Okay';
  if (score < 4) return 'Good';
  return 'Very good';
}

function scoreTone(score: number) {
  if (score < 0) return 'text-rose-600 dark:text-rose-400';
  if (score > 0) return 'text-emerald-600 dark:text-emerald-400';
  return 'text-gray-700 dark:text-gray-300';
}

export default function ScoreMeterAnimated({ score }: { score: number }) {
  const clamped = Math.max(-5, Math.min(5, score));
  const pct = ((clamped + 5) / 10) * 100;
  const [markerPct, setMarkerPct] = useState(50);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMarkerPct(pct));
    return () => cancelAnimationFrame(frame);
  }, [pct]);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Health score</span>
        <span className={`text-3xl font-bold tabular-nums ${scoreTone(score)}`}>
          {score > 0 ? '+' : ''}
          {score.toFixed(1)}
        </span>
      </div>
      <div className="relative mt-4 h-3 rounded-full bg-gradient-to-r from-rose-500 via-gray-200 to-emerald-500 dark:via-gray-700 overflow-hidden">
        <span
          className="absolute top-1/2 h-6 w-1.5 -translate-y-1/2 rounded-full bg-gray-950 dark:bg-white shadow transition-[left] duration-700 ease-[var(--ease-out)] motion-reduce:transition-none"
          style={{ left: `calc(${markerPct}% - 3px)` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>-5</span>
        <span>{scoreLabel(score)}</span>
        <span>5</span>
      </div>
    </div>
  );
}
