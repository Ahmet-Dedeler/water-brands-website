// Long-form guides (/guides/[slug]).
//
// Each guide answers one high-volume question directly in its first paragraph,
// then backs it with numbers computed live from the dataset, so the content is
// unique to this site and stays true after each data refresh. External facts
// (studies, regulations) are cited inline with links.

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Water } from '@/types';
import { waters } from '@/lib/data';
import { flagshipWater, getRanking, nameScore, rankingItems, type FAQ, type WaterRanking } from '@/lib/rankings';
import { CONTENT_UPDATED, CONTENT_YEAR } from '@/lib/site';

export type Guide = {
  slug: string;
  title: string;
  h1: string;
  description: string;
  emoji: string;
  published: string;
  updated: string;
  body: () => ReactNode;
  faqs: () => FAQ[];
};

// ---------------------------------------------------------------------------
// Live stats

const still = waters.filter((w) => w.type === 'bottled_water' || w.type === 'water_gallon');
const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((s, x) => s + x, 0) / xs.length) * 10) / 10 : 0);

function packagingGroup(w: Water): 'glass' | 'plastic' | 'aluminum' | 'other' {
  const p = (w.packaging ?? '').toLowerCase();
  if (p.includes('glass') && !/(plastic|polyester|polyethylene|polypropylene)/.test(p)) return 'glass';
  if (['plastic', 'polyester', 'polyethylene', 'polypropylene'].includes(p)) return 'plastic';
  if (p.startsWith('aluminum') && !p.includes(',')) return 'aluminum';
  return 'other';
}

const byPackaging = (g: ReturnType<typeof packagingGroup>) => still.filter((w) => packagingGroup(w) === g);
const bySource = (...sources: string[]) => still.filter((w) => w.waterSource && sources.includes(w.waterSource));

const stats = {
  total: waters.length,
  labTested: waters.filter((w) => w.hasLabTest).length,
  labAvg: avg(waters.filter((w) => w.hasLabTest).map((w) => w.score)),
  noLabAvg: avg(waters.filter((w) => !w.hasLabTest).map((w) => w.score)),
  glass: byPackaging('glass'),
  plastic: byPackaging('plastic'),
  aluminum: byPackaging('aluminum'),
  spring: bySource('spring', 'mountain_spring'),
  aquifer: bySource('aquifer', 'well'),
  municipal: bySource('municipal_supply'),
  pfasTested: waters.filter((w) => w.isPfasTested).length,
  pfasDetected: waters.filter((w) => w.isPfasTested && w.pfas === 'Yes').length,
};

const top = (slug: string, n = 10) => rankingItems(getRanking(slug) as WaterRanking).items.slice(0, n);

// ---------------------------------------------------------------------------
// Small presentational helpers

const A = ({ href, children }: { href: string; children: ReactNode }) =>
  href.startsWith('/') ? (
    <Link href={href} className="text-sky-700 underline underline-offset-2 dark:text-sky-400">{children}</Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline underline-offset-2 dark:text-sky-400">{children}</a>
  );

const H2 = ({ children }: { children: ReactNode }) => (
  <h2 className="!mt-10 text-2xl font-bold text-gray-900 dark:text-gray-100">{children}</h2>
);

function TopList({ items }: { items: Water[] }) {
  return (
    <ol className="list-decimal space-y-1 pl-6">
      {items.map((w) => (
        <li key={w.id}>
          <A href={`/water/${w.id}`}>{w.name}</A> — {w.score}/100
          {w.packaging ? `, ${w.packaging}` : ''}
        </li>
      ))}
    </ol>
  );
}

function StatTable({ rows, head }: { head: [string, string, string]; rows: [string, number, number][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left dark:border-[var(--border-soft)]">
            {head.map((h) => (
              <th key={h} scope="col" className="p-3 font-semibold text-gray-900 dark:text-gray-100">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, n, score]) => (
            <tr key={label} className="border-b border-gray-100 last:border-0 dark:border-[var(--border-soft)]">
              <th scope="row" className="p-3 text-left font-medium text-gray-700 dark:text-gray-300">{label}</th>
              <td className="p-3 tabular-nums">{n}</td>
              <td className="p-3 tabular-nums">{score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const flagship = (slug: string) => flagshipWater(slug);
const brandLine = (slugs: string[]) =>
  slugs
    .map(flagship)
    .filter((w): w is Water => Boolean(w))
    .toSorted((a, b) => b.score - a.score);

// ---------------------------------------------------------------------------
// Guides

export const GUIDES: Guide[] = [
  {
    slug: 'what-is-the-healthiest-bottled-water',
    emoji: '🏆',
    title: `What Is the Healthiest Bottled Water? (${CONTENT_YEAR} Lab Data)`,
    h1: 'What is the healthiest bottled water?',
    description:
      'The healthiest bottled water brands according to third-party lab reports, plus the five things that actually separate a great water from an average one.',
    published: '2026-10-07',
    updated: CONTENT_UPDATED,
    body: () => {
      const best = top('healthiest-bottled-water', 10);
      const popular = brandLine(['fiji-water', 'evian', 'dasani', 'aquafina', 'smartwater', 'poland-spring', 'essentia-water', 'voss', 'icelandic-glacial', 'acqua-panna', 'mountain-valley', 'saratoga-spring-water']);
      return (
        <>
          <p>
            <strong>The healthiest bottled water right now is {nameScore(best[0])}</strong>, based on {stats.labTested} waters with
            third-party lab reports. The rest of the top five are {best.slice(1, 5).map((w) => w.name).join(', ')}. They all share
            the same recipe: a protected natural source, glass packaging, published lab results with low contaminants, and PFAS testing.
          </p>
          <H2>The top 10 healthiest bottled waters</H2>
          <TopList items={best} />
          <p>
            See the full, filterable list at <A href="/best/healthiest-bottled-water">healthiest bottled water brands</A>.
          </p>
          <H2>How the famous brands compare</H2>
          <p>
            Most people are choosing between the brands at their grocery store, not imported Italian glass bottles. Here is how the
            big names score, best first:
          </p>
          <TopList items={popular} />
          <p>
            Want a direct matchup? Try <A href="/compare/fiji-water-vs-evian">Fiji vs Evian</A>,{' '}
            <A href="/compare/dasani-vs-aquafina">Dasani vs Aquafina</A> or{' '}
            <A href="/compare/fiji-water-vs-smartwater">Fiji vs Smartwater</A>.
          </p>
          <H2>What makes a bottled water healthy</H2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              <strong>A lab report you can read.</strong> Waters with a third-party lab report average {stats.labAvg}/100 in our data.
              Waters without one average {stats.noLabAvg}. No report means you are trusting the label.
            </li>
            <li>
              <strong>Low contaminants versus health guidelines</strong>, not just legal limits. Legal limits are often set by what is
              practical to treat, while health guidelines are set by what is safe long term.
            </li>
            <li>
              <strong>Glass packaging.</strong> Still waters in glass average {avg(stats.glass.map((w) => w.score))}/100, plastic
              averages {avg(stats.plastic.map((w) => w.score))}. See <A href="/guides/glass-vs-plastic-bottled-water">glass vs plastic</A>.
            </li>
            <li>
              <strong>A natural source.</strong> Spring and aquifer waters keep their minerals. Purified municipal water is clean but
              stripped.
            </li>
            <li>
              <strong>PFAS testing.</strong> Only {stats.pfasTested} of {stats.total.toLocaleString()} products have published a PFAS
              test. See <A href="/guides/pfas-in-bottled-water">PFAS in bottled water</A>.
            </li>
          </ol>
          <H2>Is bottled water healthier than tap water?</H2>
          <p>
            Not automatically. Good municipal tap water run through a quality filter can beat most bottled water, without the plastic.
            Check your city on our <A href="/tap-water">tap water quality map</A> and compare <A href="/best/best-water-filters">the best water filters</A>.
          </p>
        </>
      );
    },
    faqs: () => {
      const best = top('healthiest-bottled-water', 3);
      return [
        { q: 'What is the healthiest bottled water to drink?', a: `${nameScore(best[0])} ranks as the healthiest bottled water in our lab-data ranking, followed by ${nameScore(best[1])} and ${nameScore(best[2])}.` },
        { q: 'What bottled water do doctors recommend?', a: 'There is no single doctor-endorsed brand. Medical guidance focuses on staying hydrated with water that is low in contaminants. Lab-tested waters in glass from a natural source tick the most boxes.' },
        { q: 'Is Fiji water healthy?', a: `Fiji scores ${flagship('fiji-water')?.score ?? '—'}/100 in our data. It is a natural artesian water with good minerals, but it loses points for plastic packaging.` },
      ];
    },
  },
  {
    slug: 'microplastics-in-bottled-water',
    emoji: '🔬',
    title: `Microplastics in Bottled Water: Which Brands Are Safest? (${CONTENT_YEAR})`,
    h1: 'Microplastics in bottled water: what the research says and which brands are safest',
    description:
      'How many microplastics are in bottled water, where they come from and which bottled water brands carry the lowest microplastics risk.',
    published: '2026-10-07',
    updated: CONTENT_UPDATED,
    body: () => {
      const safest = top('bottled-water-without-microplastics', 8);
      return (
        <>
          <p>
            <strong>Most plastic-bottled water contains micro- and nanoplastics.</strong> A 2024 Columbia University study in{' '}
            <A href="https://www.pnas.org/doi/10.1073/pnas.2300582121">PNAS</A> counted about 240,000 plastic particles per liter
            across three popular brands, roughly 90% of them nanoplastics small enough to cross into tissue. The lowest-risk choice is
            water bottled in glass with a metal cap.
          </p>
          <H2>Where microplastics in bottled water come from</H2>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>The bottle itself</strong> (PET plastic), especially when it is squeezed, reused or left in heat.</li>
            <li><strong>The cap.</strong> Opening and closing a plastic cap grinds off particles. Even glass bottles can have plastic-lined caps.</li>
            <li><strong>The filtration and bottling line</strong>, including plastic membranes and tubing.</li>
          </ul>
          <p>
            An earlier <A href="https://www.frontiersin.org/articles/10.3389/fchem.2018.00407/full">2018 study</A> of 259 bottles from 11
            brands found microplastic contamination in 93% of them.
          </p>
          <H2>Lowest microplastics risk brands</H2>
          <p>These waters are either certified plastic-free or sold in glass with a low-risk cap, ranked by overall purity:</p>
          <TopList items={safest} />
          <p>
            Full list: <A href="/best/bottled-water-without-microplastics">bottled water without microplastics</A>.
          </p>
          <H2>Glass vs plastic vs aluminum</H2>
          <StatTable
            head={['Packaging', 'Still waters', 'Average score']}
            rows={[
              ['Glass', stats.glass.length, avg(stats.glass.map((w) => w.score))],
              ['Aluminum', stats.aluminum.length, avg(stats.aluminum.map((w) => w.score))],
              ['Plastic', stats.plastic.length, avg(stats.plastic.map((w) => w.score))],
            ]}
          />
          <p>
            Aluminum cans and bottles are lined with a thin plastic or epoxy coating, so they sit in the middle. Cartons usually have a
            plastic liner too.
          </p>
          <H2>How to cut microplastics from your water</H2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>Choose glass bottles with metal caps.</li>
            <li>Never leave plastic bottles in a hot car or in the sun.</li>
            <li>Do not refill single-use plastic bottles.</li>
            <li>At home, filter tap water. Reverse osmosis removes most microplastics. See <A href="/best/best-reverse-osmosis-systems">the best RO systems</A>.</li>
          </ol>
        </>
      );
    },
    faqs: () => [
      { q: 'Which bottled water has the least microplastics?', a: `Waters in glass with low-risk caps or certified plastic-free packaging. ${nameScore(top('bottled-water-without-microplastics', 1)[0])} is the top-rated option in our data.` },
      { q: 'How many microplastics are in a bottle of water?', a: 'A 2024 PNAS study found about 240,000 plastic particles per liter on average in three major plastic-bottled brands, most of them nanoplastics.' },
      { q: 'Does boiling or filtering remove microplastics?', a: 'Reverse osmosis and fine filtration (sub-micron) remove most microplastics. Boiling hard water can trap some particles in limescale, but filtering is more reliable.' },
    ],
  },
  {
    slug: 'pfas-in-bottled-water',
    emoji: '🧪',
    title: `PFAS in Bottled Water: Which Brands Test for Forever Chemicals (${CONTENT_YEAR})`,
    h1: 'PFAS in bottled water: what to know and which brands test for it',
    description:
      'What PFAS "forever chemicals" are, the EPA limits, whether bottled water contains them and which bottled water brands have PFAS tests with none detected.',
    published: '2026-10-07',
    updated: CONTENT_UPDATED,
    body: () => {
      const clean = top('pfas-free-bottled-water', 10);
      return (
        <>
          <p>
            <strong>Some bottled waters contain PFAS, and most brands do not publish whether theirs does.</strong> Of the{' '}
            {stats.total.toLocaleString()} products we track, only {stats.pfasTested} have a PFAS lab test on file. The safest move is
            to choose a brand that tests and publishes results, like the ones below.
          </p>
          <H2>What are PFAS?</H2>
          <p>
            PFAS (per- and polyfluoroalkyl substances) are thousands of synthetic chemicals used in non-stick, waterproof and
            stain-resistant products. They are called forever chemicals because they barely break down in the environment or in your
            body. Long-term exposure to some PFAS is linked to higher cholesterol, immune effects and certain cancers.
          </p>
          <H2>The rules: tap water vs bottled water</H2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              In April 2024 the <A href="https://www.epa.gov/sdwa/and-polyfluoroalkyl-substances-pfas">EPA</A> set enforceable limits
              of 4.0 parts per trillion for PFOA and PFOS in public tap water. In 2025 the EPA said it would keep those two limits and
              give utilities until 2031 to comply, while reconsidering limits for other PFAS.
            </li>
            <li>
              Bottled water is regulated by the FDA, which has not adopted an equivalent PFAS limit. The bottled water industry
              association recommends its members stay under 5 ppt for a single PFAS and 10 ppt combined.
            </li>
          </ul>
          <H2>Bottled waters tested for PFAS with none detected</H2>
          <TopList items={clean} />
          <p>
            Full list: <A href="/best/pfas-free-bottled-water">PFAS-free bottled water</A>. &quot;None detected&quot; means below the
            lab&apos;s reporting limit, not literally zero.
          </p>
          <H2>How to avoid PFAS in drinking water</H2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>Pick bottled water with a published PFAS test (above).</li>
            <li>Check your city on our <A href="/tap-water">tap water map</A>.</li>
            <li>Use a filter certified for PFOA/PFOS reduction (NSF/ANSI 53 or 58). Reverse osmosis removes the most. See <A href="/best/best-water-filters">best water filters</A>.</li>
          </ol>
        </>
      );
    },
    faqs: () => [
      { q: 'Does bottled water have PFAS?', a: 'Some does. Independent tests have found PFAS in several bottled waters, usually at low levels. Few brands publish PFAS results, so choose one that does.' },
      { q: 'What is the safe level of PFAS in drinking water?', a: 'The EPA set 4.0 parts per trillion as the enforceable limit for PFOA and PFOS in public drinking water, with a health goal of zero.' },
      { q: 'Which water filter removes PFAS?', a: 'Reverse osmosis removes the widest range of PFAS. Some activated carbon filters certified to NSF/ANSI 53 also reduce PFOA and PFOS.' },
    ],
  },
  {
    slug: 'glass-vs-plastic-bottled-water',
    emoji: '🫙',
    title: 'Glass vs Plastic Bottled Water: Is Glass Really Healthier?',
    h1: 'Glass vs plastic bottled water: is glass really healthier?',
    description:
      `We compared ${still.length.toLocaleString()} still waters by packaging. Here is how glass, plastic and aluminum stack up on purity, microplastics and taste.`,
    published: '2026-10-07',
    updated: CONTENT_UPDATED,
    body: () => (
      <>
        <p>
          <strong>Yes, glass is healthier.</strong> Across {still.length.toLocaleString()} still waters in our data, glass-bottled
          waters average {avg(stats.glass.map((w) => w.score))}/100 versus {avg(stats.plastic.map((w) => w.score))}/100 for plastic.
          Glass is inert, it does not shed microplastics and it does not leach plastic additives into the water.
        </p>
        <StatTable
          head={['Packaging', 'Still waters', 'Average score']}
          rows={[
            ['Glass', stats.glass.length, avg(stats.glass.map((w) => w.score))],
            ['Aluminum', stats.aluminum.length, avg(stats.aluminum.map((w) => w.score))],
            ['Plastic (PET, HDPE)', stats.plastic.length, avg(stats.plastic.map((w) => w.score))],
          ]}
        />
        <H2>Why plastic loses points</H2>
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Microplastics.</strong> See <A href="/guides/microplastics-in-bottled-water">microplastics in bottled water</A>.</li>
          <li><strong>Leaching.</strong> PET can release antimony and other compounds, more so with heat and long storage.</li>
          <li><strong>Heat exposure.</strong> Bottles that sit in warehouses, trucks and cars degrade faster.</li>
        </ul>
        <H2>Same brand, glass vs plastic</H2>
        <p>Some brands sell both. Compare for yourself:</p>
        <TopList
          items={waters
            .filter((w) => ['evian', 'icelandic-glacial', 'mountain-valley', 'voss'].includes(w.brandSlug ?? '') && w.type === 'bottled_water')
            .toSorted((a, b) => (a.brandSlug ?? '').localeCompare(b.brandSlug ?? '') || b.score - a.score)
            .slice(0, 10)}
        />
        <H2>The best glass bottled waters</H2>
        <TopList items={top('best-glass-bottled-water', 8)} />
        <p>
          Full list: <A href="/best/best-glass-bottled-water">best glass bottled water brands</A>.
        </p>
      </>
    ),
    faqs: () => [
      { q: 'Is water in glass bottles better than plastic?', a: `In our data, still waters in glass average ${avg(stats.glass.map((w) => w.score))}/100 compared with ${avg(stats.plastic.map((w) => w.score))}/100 for plastic, mainly because glass avoids microplastics and leaching.` },
      { q: 'Is aluminum better than plastic for water?', a: 'Slightly. Aluminum bottles and cans have a thin plastic liner, so they carry a moderate microplastics risk, lower than plastic but higher than glass.' },
    ],
  },
  {
    slug: 'spring-vs-purified-vs-mineral-water',
    emoji: '⛰️',
    title: 'Spring vs Purified vs Mineral Water: Which Is Healthiest?',
    h1: 'Spring water vs purified water vs mineral water: which is healthiest?',
    description:
      'The real difference between spring, purified, mineral, artesian and alkaline water, with average purity scores for each from our lab-data ranking.',
    published: '2026-10-07',
    updated: CONTENT_UPDATED,
    body: () => (
      <>
        <p>
          <strong>Natural spring and aquifer waters score highest on average, purified water scores lower.</strong> In our data,
          aquifer and well waters average {avg(stats.aquifer.map((w) => w.score))}/100, spring waters{' '}
          {avg(stats.spring.map((w) => w.score))} and purified municipal water {avg(stats.municipal.map((w) => w.score))}. Purified
          water is usually very clean, but it has the minerals stripped out and often ships in plastic.
        </p>
        <StatTable
          head={['Source', 'Still waters', 'Average score']}
          rows={[
            ['Aquifer / well / artesian', stats.aquifer.length, avg(stats.aquifer.map((w) => w.score))],
            ['Spring / mountain spring', stats.spring.length, avg(stats.spring.map((w) => w.score))],
            ['Municipal (purified)', stats.municipal.length, avg(stats.municipal.map((w) => w.score))],
          ]}
        />
        <H2>The official definitions</H2>
        <p>
          The FDA defines bottled water types in{' '}
          <A href="https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-165/subpart-B/section-165.110">21 CFR 165.110</A>:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Spring water</strong> comes from an underground formation that flows naturally to the surface.</li>
          <li><strong>Artesian water</strong> comes from a well that taps a confined aquifer under pressure.</li>
          <li><strong>Mineral water</strong> has at least 250 ppm total dissolved solids from the source, with no minerals added.</li>
          <li><strong>Purified water</strong> is treated by distillation, deionization or reverse osmosis. It is often municipal tap water.</li>
        </ul>
        <p>
          &quot;Alkaline&quot; is a marketing term, not an FDA category. Many alkaline brands are purified water with added
          electrolytes. See <A href="/best/best-alkaline-water">the best alkaline waters</A>.
        </p>
        <H2>Best picks by type</H2>
        <ul className="list-disc space-y-2 pl-6">
          <li><A href="/best/best-spring-water">Best spring water</A>: {nameScore(top('best-spring-water', 1)[0])}</li>
          <li><A href="/best/best-mineral-water">Best mineral water</A>: {nameScore(top('best-mineral-water', 1)[0])}</li>
          <li><A href="/best/best-alkaline-water">Best alkaline water</A>: {nameScore(top('best-alkaline-water', 1)[0])}</li>
          <li><A href="/best/best-sparkling-water">Best sparkling water</A>: {nameScore(top('best-sparkling-water', 1)[0])}</li>
        </ul>
      </>
    ),
    faqs: () => [
      { q: 'Is spring water better than purified water?', a: `Spring water keeps natural minerals and averages ${avg(stats.spring.map((w) => w.score))}/100 in our data versus ${avg(stats.municipal.map((w) => w.score))} for purified municipal water. Both are safe; spring water scores higher on source quality.` },
      { q: 'Is purified water just tap water?', a: 'Often, yes. Many purified brands such as Dasani and Aquafina start with municipal water and treat it with reverse osmosis, then sometimes add minerals back for taste.' },
      { q: 'What is the difference between mineral water and spring water?', a: 'Mineral water must contain at least 250 ppm of naturally occurring dissolved solids. Spring water can be low or high in minerals; it is defined by how it reaches the surface.' },
    ],
  },
  {
    slug: 'is-alkaline-water-good-for-you',
    emoji: '⚗️',
    title: 'Is Alkaline Water Good for You? What the Evidence Says',
    h1: 'Is alkaline water good for you?',
    description:
      'What alkaline water is, what the science says about its health claims and which alkaline water brands are actually clean according to lab data.',
    published: '2026-10-07',
    updated: CONTENT_UPDATED,
    body: () => {
      const alk = brandLine(['essentia-water', 'smartwater', 'core-hydration', 'kirkland-signature', 'waiakea', 'proud-source-water']);
      return (
        <>
          <p>
            <strong>Alkaline water is fine to drink, but there is little evidence it is healthier than regular clean water.</strong>{' '}
            Your stomach acid neutralizes it within minutes, and your kidneys and lungs keep blood pH tightly controlled whatever you
            drink. What matters more is the water itself: its contaminants, source and packaging.
          </p>
          <H2>Natural vs artificial alkaline water</H2>
          <p>
            Naturally alkaline waters get a high pH from dissolved minerals like calcium and bicarbonate picked up from rock. Many
            popular alkaline brands are purified water that is ionized or has electrolytes added to raise the pH. Our scoring rewards
            the natural kind because it comes with real minerals.
          </p>
          <H2>How popular alkaline brands score</H2>
          <TopList items={alk} />
          <H2>The best alkaline waters by purity</H2>
          <TopList items={top('best-alkaline-water', 8)} />
          <p>
            Full list: <A href="/best/best-alkaline-water">best alkaline water brands</A>.
          </p>
        </>
      );
    },
    faqs: () => [
      { q: 'Is it OK to drink alkaline water every day?', a: 'For healthy people, yes. There is no strong evidence of harm or of major benefit. People with kidney disease should ask their doctor.' },
      { q: 'Is Essentia water healthy?', a: `Essentia scores ${flagship('essentia-water')?.score ?? '—'}/100 in our data. It is purified water with added electrolytes, sold in plastic, which limits its score.` },
    ],
  },
  {
    slug: 'bottled-water-vs-tap-water',
    emoji: '🚰',
    title: 'Bottled Water vs Tap Water: Which Is Safer to Drink?',
    h1: 'Bottled water vs tap water: which is safer?',
    description:
      'Is bottled water safer than tap water? How the regulations differ, what each can contain and when a home filter beats both.',
    published: '2026-10-07',
    updated: CONTENT_UPDATED,
    body: () => (
      <>
        <p>
          <strong>Neither is automatically safer.</strong> US tap water is regulated by the EPA and tested far more often than bottled
          water, which the FDA regulates as a food. Good tap water through a quality filter usually beats the average plastic bottle.
          Top-tier bottled water in glass beats both on convenience and minerals.
        </p>
        <H2>How the rules differ</H2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Public water systems must test frequently and publish annual Consumer Confidence Reports.</li>
          <li>Bottled water brands must meet FDA standards but are not required to publish full lab results. Many do not.</li>
          <li>The EPA has PFAS limits for tap water. The FDA has none for bottled water.</li>
        </ul>
        <H2>Check your tap water</H2>
        <p>
          Look up your city or zip code on our <A href="/tap-water">tap water quality rankings</A> to see which contaminants your
          utility reported above health guidelines.
        </p>
        <H2>The middle path: filter your tap water</H2>
        <p>
          A certified filter removes most of what is wrong with tap water at a fraction of the cost of bottled water and with no
          plastic waste. Start with <A href="/best/best-water-filter-pitchers">filter pitchers</A> or go all the way with{' '}
          <A href="/best/best-reverse-osmosis-systems">reverse osmosis</A>.
        </p>
        <H2>If you buy bottled</H2>
        <p>
          Pick a lab-tested water in glass. Start with <A href="/best/healthiest-bottled-water">the healthiest bottled waters</A>.
        </p>
      </>
    ),
    faqs: () => [
      { q: 'Is bottled water safer than tap water?', a: 'Not necessarily. Tap water is tested more often and has stricter disclosure rules. Bottled water adds microplastics risk from plastic packaging. A filtered tap or a lab-tested glass-bottled water are the safest options.' },
      { q: 'Is it OK to drink tap water?', a: 'In most US cities, yes. Check your local water report for contaminants above health guidelines and use a certified filter if needed.' },
    ],
  },
];

export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
