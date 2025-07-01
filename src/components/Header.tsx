'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { WaterData } from '@/types';

export default function Header({ waters }: { waters: WaterData[] }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<WaterData[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.length > 1) {
            const filtered = waters.filter(water =>
                (water.name && water.name.toLowerCase().includes(query.toLowerCase())) ||
                (water.brand && water.brand.name.toLowerCase().includes(query.toLowerCase()))
            ).slice(0, 6);
            setResults(filtered);
        } else {
            setResults([]);
        }
    }, [query, waters]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchRef]);


    return (
        <header className="bg-transparent mb-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-8">
                        <Link href="/" className="text-xl font-bold text-gray-800 whitespace-nowrap">
                            Water Brands Leaderboard
                        </Link>
                    </div>

                    <div ref={searchRef} className="relative w-full max-w-md ml-8">
                        <input
                            type="search"
                            placeholder="Search for a water brand..."
                            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>

                        {isFocused && results.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                                <ul className="divide-y divide-gray-100">
                                    {results.map(water => (
                                        <li key={water.id}>
                                            <Link href={`/water/${water.id}`} className="flex items-center p-3 hover:bg-gray-50" onClick={() => setIsFocused(false)}>
                                                <img src={water.image} alt={water.name} className="w-8 h-8 object-contain mr-4"/>
                                                <span className="text-sm font-medium text-gray-700">{water.name}</span>
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