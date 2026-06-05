'use client';

import type { ReactNode } from 'react';
import type { CapSafety, PackagingFilter, WaterRankingFilters, WaterSourceFilter } from '@/types';
import {
  CAP_SAFETY_OPTIONS,
  EMPTY_FILTERS,
  PACKAGING_OPTIONS,
  SOURCE_OPTIONS,
} from '@/lib/water-filters';

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active
          ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

export default function WaterFilters({
  value,
  onChange,
  onReset,
}: {
  value: WaterRankingFilters;
  onChange: (next: WaterRankingFilters) => void;
  onReset: () => void;
}) {
  const toggle = (key: 'labTestedOnly' | 'noMicroplastics') => {
    onChange({ ...value, [key]: !value[key] });
  };

  const setCapSafety = (cap: CapSafety) => {
    onChange({ ...value, capSafety: value.capSafety === cap ? null : cap });
  };

  const setPackaging = (packaging: PackagingFilter) => {
    onChange({ ...value, packaging: value.packaging === packaging ? null : packaging });
  };

  const setWaterSource = (waterSource: WaterSourceFilter) => {
    onChange({ ...value, waterSource: value.waterSource === waterSource ? null : waterSource });
  };

  const hasActive = JSON.stringify(value) !== JSON.stringify(EMPTY_FILTERS);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
        {hasActive && (
          <button
            type="button"
            onClick={onReset}
            className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={value.labTestedOnly} onClick={() => toggle('labTestedOnly')}>
          Lab tested only
        </FilterChip>
        <FilterChip active={value.noMicroplastics} onClick={() => toggle('noMicroplastics')}>
          No microplastics
        </FilterChip>
      </div>

      <Section title="Cap safety">
        {CAP_SAFETY_OPTIONS.map((option) => (
          <FilterChip
            key={option.value}
            active={value.capSafety === option.value}
            onClick={() => setCapSafety(option.value)}
          >
            {option.label}
          </FilterChip>
        ))}
      </Section>

      <Section title="Packaging">
        {PACKAGING_OPTIONS.map((option) => (
          <FilterChip
            key={option.value}
            active={value.packaging === option.value}
            onClick={() => setPackaging(option.value)}
          >
            {option.label}
          </FilterChip>
        ))}
      </Section>

      <Section title="Source">
        {SOURCE_OPTIONS.map((option) => (
          <FilterChip
            key={option.value}
            active={value.waterSource === option.value}
            onClick={() => setWaterSource(option.value)}
          >
            {option.label}
          </FilterChip>
        ))}
      </Section>
    </div>
  );
}
