import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import waterData from '@/data/water_data.json';
import ingredientsMap from '@/data/ingredients.json';
import { WaterData, Ingredient, IngredientsMap } from '@/types';
import Header from '@/components/Header';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const allWaters = waterData as WaterData[];
  const water = allWaters.find(w => w.id.toString() === id);

  if (!water) {
    return {
      title: "Water Not Found",
    }
  }

  return {
    title: water.name,
    description: water.description,
    openGraph: {
      title: water.name,
      description: water.description,
      images: [
        {
          url: water.image,
          width: 800,
          height: 600,
          alt: water.name,
        },
      ],
    },
  }
}

export default async function WaterDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const showSources = false; // Set to true to display the sources section
  const allWaters = waterData as WaterData[];
  const allIngredients = ingredientsMap as IngredientsMap;

  const water = allWaters.find(w => w.id.toString() === id);

  if (!water) {
    notFound();
  }

  const getFullIngredient = (ing: Ingredient): Ingredient => {
    const details = allIngredients[ing.ingredient_id];
    return details ? { ...ing, ...details } : ing;
  };

  const contaminants = water.ingredients.filter(ing => ing.is_contaminant).map(getFullIngredient);
  const nutrients = water.ingredients.filter(ing => !ing.is_contaminant).map(getFullIngredient);

  const labTested = water.score_breakdown.find(item => item.id === 'untested_penalty')?.score === 0 ? "Yes" : "No";
  const microplastics = water.packaging === 'plastic' ? "High Risk" : "Minimal";

  return (
    <main>
      <Header waters={allWaters} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-700 mb-4 inline-block">
          &larr; Back to all waters
        </Link>
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative flex items-center justify-center bg-gray-50 rounded-lg p-4 h-48 md:h-full">
                <Image src={water.image} alt={water.name} fill style={{objectFit:"contain"}} />
              </div>
              <div className="md:col-span-2">
                <h1 className="text-3xl font-bold text-gray-900">{water.name}</h1>
                <p className="text-5xl font-extrabold text-blue-600 mt-4">{water.score}<span className="text-2xl font-medium text-gray-400">/100</span></p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 bg-gray-50 px-6 md:px-8 py-4">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4 text-center">
              <div><dt className="text-sm text-gray-500">Lab Tested</dt><dd className="text-lg font-semibold">{labTested}</dd></div>
              <div><dt className="text-sm text-gray-500">Harmful Ingredients</dt><dd className="text-lg font-semibold">{contaminants.length}</dd></div>
              <div><dt className="text-sm text-gray-500">Nutrients</dt><dd className="text-lg font-semibold">{nutrients.length}</dd></div>
              <div><dt className="text-sm text-gray-500">Microplastics</dt><dd className="text-lg font-semibold">{microplastics}</dd></div>
            </dl>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <p className="text-gray-600">{water.description}</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">Contaminants</h2>
              <ul className="space-y-4">
                {contaminants.map((item, index) => (
                  <li key={index} className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-red-800">{item.name}</h3>
                      <span className="text-sm font-medium text-red-600">{item.amount} {item.measure}</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">{item.risks}</p>
                  </li>
                ))}
                {contaminants.length === 0 && <p className="text-sm text-gray-500">No contaminants listed.</p>}
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">Ingredients & Minerals</h2>
              <ul className="space-y-4">
                {nutrients.map((item, index) => (
                  <li key={index} className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                     <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-green-800">{item.name}</h3>
                      <span className="text-sm font-medium text-green-600">{item.amount} {item.measure}</span>
                    </div>
                    {item.benefits && item.benefits !== 'None' && <p className="text-sm text-green-700 mt-1">{item.benefits}</p>}
                  </li>
                ))}
                {nutrients.length === 0 && <p className="text-sm text-gray-500">No nutrients listed.</p>}
              </ul>
            </section>

            {showSources && water.sources && water.sources.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4">Sources</h2>
                <ul className="space-y-3">
                  {water.sources.map((source, index) => (
                    <li key={index}>
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                        {source.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 