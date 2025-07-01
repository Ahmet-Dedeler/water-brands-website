import Link from 'next/link';
import waterData from '@/data/water_data.json';
import { WaterData } from '@/types';
import Header from '@/components/Header';
import ScoreCircle from '@/components/ScoreCircle';

export default function Home() {
  const allWaters = waterData as WaterData[];
  const sortedWaters = [...allWaters].sort((a, b) => b.score - a.score);

  return (
    <>
      <Header waters={allWaters} />
      <main className="max-w-4xl mx-auto px-4">
        <div className="text-left mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Top rated bottled waters</h1>
            <p className="text-gray-500 mt-1">The healthiest bottled waters based on the latest science.</p>
        </div>
        <div className="space-y-4">
          {sortedWaters.map((water) => (
            <Link key={water.id} href={`/water/${water.id}`} className="flex items-center bg-white p-4 pr-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="w-16 h-16 flex-shrink-0 mr-6 flex items-center justify-center">
                <img src={water.image} alt={water.name} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="flex-grow">
                <h2 className="text-lg font-semibold text-gray-800">{water.name}</h2>
              </div>
              <div className="flex-shrink-0">
                <ScoreCircle score={water.score} />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
