import Link from 'next/link';
import type { TapWaterCard } from '@/types';
import { motionPress } from '@/lib/ui-classes';

export const scoreTone = (score: number | null) => {
  if (score == null) return 'text-gray-400 dark:text-gray-500';
  if (score >= 70) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};

export function CityImage({ location, large = false }: { location: TapWaterCard; large?: boolean }) {
  if (location.image) {
    return (
      <img
        src={location.image}
        alt={location.name}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(125,211,252,0.55),transparent_35%),linear-gradient(135deg,#355070,#16213e_55%,#0f172a)] ${
        large ? 'opacity-90' : 'opacity-80'
      }`}
      aria-hidden="true"
    />
  );
}

function FeaturedCard({ location }: { location: TapWaterCard }) {
  return (
    <Link
      href={`/tap-water/${location.id}`}
      className={`group flex h-[96px] w-[240px] shrink-0 items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm hover:border-gray-200 hover:shadow-md dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)] dark:hover:border-gray-500 ${motionPress}`}
    >
      <span className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200 dark:bg-[var(--surface-muted)] dark:ring-gray-700">
        <CityImage location={location} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">{location.name}</span>
        <span className={`mt-0.5 block text-xs font-semibold ${scoreTone(location.score)}`}>
          {location.score ?? 'N/A'}/100
        </span>
        <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
          Tap water
        </span>
      </span>
    </Link>
  );
}

export default function TapWaterFeatured({ featured }: { featured: TapWaterCard[] }) {
  if (featured.length === 0) return null;

  return (
    <section aria-label="Popular tap water locations" className="overflow-hidden pb-12">
      <div className="overflow-hidden pb-4">
        <div className="marquee-track motion-reduce:flex motion-reduce:w-auto motion-reduce:overflow-x-auto motion-reduce:[scrollbar-width:none]">
          {[...featured, ...featured].map((location, index) => (
            <FeaturedCard key={`${location.id}-${index}`} location={location} />
          ))}
        </div>
      </div>
    </section>
  );
}
