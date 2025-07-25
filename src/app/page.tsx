import Link from 'next/link';
import Image from 'next/image';
import waterData from '@/data/water_data.json';
import { WaterData } from '@/types';
import Header from '@/components/Header';
import ScoreCircle from '@/components/ScoreCircle';

export default function Home() {
  const allWaters = waterData as WaterData[];
  
  // Sort waters by score in descending order
  const sortedWaters = [...allWaters].sort((a, b) => b.score - a.score);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header waters={allWaters} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Water Brands Leaderboard
          </h1>
          <p className="text-lg text-gray-600">
            The healthiest bottled waters based on the latest science
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedWaters.map((water, index) => (
            <Link
              key={water.id}
              href={`/water/${water.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <div className="relative w-16 h-16">
                      <Image
                        src={water.image}
                        alt={water.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                  <ScoreCircle score={water.score} />
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {water.name}
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                  by {water.brand?.name || 'Unknown Brand'}
                </p>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {water.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
