'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import type { WaterCard, WaterType } from '@/types';
import { scoreTier, SCORE_COLORS, waterTypeLabel, titleize } from '@/lib/format';

const PAGE_SIZE = 60;

type Filter = 'all' | WaterType;

const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'bottled_water', label: 'Still' },
    { key: 'sparkling_water', label: 'Sparkling' },
    { key: 'water_gallon', label: 'Gallon' },
    { key: 'flavored_water', label: 'Flavored' },
];

function ScoreBadge({ score }: { score: number }) {
    const colors = SCORE_COLORS[scoreTier(score)];
    return (
        <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colors.bg} ${colors.text} font-bold ring-1 ${colors.ring}`}>
            {score}
        </span>
    );
}

function Card({ water, rank }: { water: WaterCard; rank: number }) {
    return (
        <Link
            href={`/water/${water.id}`}
            className="group relative flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 overflow-hidden"
        >
            <div className="flex items-start gap-4 p-5">
                <span className="text-sm font-bold text-gray-300 dark:text-gray-600 w-7 shrink-0 pt-1 tabular-nums">#{rank}</span>
                <div className="relative w-16 h-16 shrink-0">
                    {water.image ? (
                        <Image src={water.image} alt="" fill sizes="64px" className="object-contain" loading="lazy" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-gray-200 dark:text-gray-700" aria-hidden="true">💧</div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">{water.name}</h2>
                    {water.brandName && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{water.brandName}</p>}
                </div>
                <ScoreBadge score={water.score} />
            </div>
            <div className="mt-auto flex flex-wrap gap-2 px-5 pb-4 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300">{waterTypeLabel(water.type)}</span>
                {water.packaging && (
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{titleize(water.packaging)}</span>
                )}
                {water.waterSource && water.waterSource !== 'unknown' && (
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{titleize(water.waterSource)}</span>
                )}
            </div>
        </Link>
    );
}

export default function Leaderboard({ waters }: { waters: WaterCard[] }) {
    const [filter, setFilter] = useState<Filter>('all');
    const [visible, setVisible] = useState(PAGE_SIZE);

    const filtered = useMemo(
        () => (filter === 'all' ? waters : waters.filter((w) => w.type === filter)),
        [filter, waters]
    );

    const counts = useMemo(() => {
        const c: Record<string, number> = { all: waters.length };
        for (const w of waters) c[w.type] = (c[w.type] || 0) + 1;
        return c;
    }, [waters]);

    const shown = filtered.slice(0, visible);

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-6">
                {FILTERS.map((f) => {
                    const active = filter === f.key;
                    return (
                        <button
                            key={f.key}
                            onClick={() => {
                                setFilter(f.key);
                                setVisible(PAGE_SIZE);
                            }}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                active
                                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        >
                            {f.label}
                            <span className={`ml-2 ${active ? 'text-gray-300 dark:text-gray-500' : 'text-gray-400'}`}>{counts[f.key] ?? 0}</span>
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shown.map((water, i) => (
                    <Card key={water.id} water={water} rank={i + 1} />
                ))}
            </div>

            {visible < filtered.length && (
                <div className="text-center mt-8">
                    <button
                        onClick={() => setVisible((v) => v + PAGE_SIZE)}
                        className="px-6 py-2.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all"
                    >
                        Show more ({filtered.length - visible} left)
                    </button>
                </div>
            )}
        </div>
    );
}
