'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useMemo } from 'react';
import type { WaterCard } from '@/types';
import { waterTypeLabel } from '@/lib/format';

export default function Header({ waters }: { waters: WaterCard[] }) {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (q.length < 2) return [];
        return waters
            .filter(
                (w) =>
                    w.name?.toLowerCase().includes(q) ||
                    w.brandName?.toLowerCase().includes(q)
            )
            .slice(0, 6);
    }, [query, waters]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-100 dark:border-gray-800 mb-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center gap-4 py-3">
                    <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        <span className="text-xl">🚰</span>
                        <span className="hidden sm:inline">Water Leaderboard</span>
                    </Link>

                    <div ref={searchRef} className="relative w-full max-w-md" role="search">
                        <label htmlFor="water-search" className="sr-only">Search waters and brands</label>
                        <input
                            id="water-search"
                            type="search"
                            placeholder="Search 1,900+ waters or brands…"
                            aria-label="Search waters and brands"
                            aria-expanded={isFocused && results.length > 0}
                            aria-controls={results.length > 0 ? 'search-results' : undefined}
                            autoComplete="off"
                            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-transparent rounded-lg focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-600 focus:outline-none"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {isFocused && results.length > 0 && (
                            <div
                                id="search-results"
                                role="listbox"
                                aria-label="Search results"
                                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 overflow-hidden"
                            >
                                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {results.map((water) => (
                                        <li key={water.id} role="option">
                                            <Link
                                                href={`/water/${water.id}`}
                                                className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                onClick={() => setIsFocused(false)}
                                            >
                                                {water.image ? (
                                                    <Image src={water.image} alt="" width={32} height={32} className="w-8 h-8 object-contain mr-3" />
                                                ) : (
                                                    <span className="w-8 h-8 mr-3 flex items-center justify-center text-gray-300" aria-hidden="true">💧</span>
                                                )}
                                                <span className="flex-1 min-w-0">
                                                    <span className="block text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{water.name}</span>
                                                    {water.brandName && <span className="block text-xs text-gray-400 truncate">{water.brandName}</span>}
                                                </span>
                                                <span className="ml-2 text-xs text-gray-400">{waterTypeLabel(water.type)}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
