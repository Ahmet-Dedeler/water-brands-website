'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { scoreTier, SCORE_COLORS } from '@/lib/format';

interface ScoreCircleProps {
  score: number;
  size?: number;
}

const RADIUS = 50;

export default function ScoreCircle({ score, size = 96 }: ScoreCircleProps) {
  const circumference = 2 * Math.PI * RADIUS;
  const clamped = Math.max(0, Math.min(100, score));
  const targetOffset = circumference - (clamped / 100) * circumference;
  const colors = SCORE_COLORS[scoreTier(score)];

  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOffset(targetOffset));
    return () => cancelAnimationFrame(frame);
  }, [targetOffset]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          className="text-gray-200 dark:text-gray-700"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={RADIUS}
          cx="60"
          cy="60"
        />
        <circle
          className={colors.stroke}
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={RADIUS}
          cx="60"
          cy="60"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={
            {
              '--score-circumference': `${circumference}px`,
              transition: 'stroke-dashoffset 700ms var(--ease-out)',
            } as CSSProperties
          }
        />
      </svg>
      <span
        className={`absolute font-bold ${colors.text}`}
        style={{ fontSize: size * 0.26 }}
      >
        {score}
      </span>
    </div>
  );
}
