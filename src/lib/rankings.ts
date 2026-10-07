// "Best of" ranking pages (/best/[slug]).
//
// Each entry targets one search intent ("healthiest bottled water", "best shower
// filter", ...) and is generated straight from the dataset, so the lists stay in
// sync with every data refresh. Copy is written to answer the query in the first
// paragraph — that is what Google snippets and AI answer engines quote.

import type { Water, WaterFilter } from '@/types';
import { waters, waterFilters } from '@/lib/data';
import { CONTENT_YEAR } from '@/lib/site';

export type FAQ = { q: string; a: string };

type Base = {
  slug: string;
  /** <title> — keyword first, under ~60 chars. */
  title: string;
  h1: string;
  description: string;
  /** Short label for hub cards and related links. */
  label: string;
  emoji: string;
  limit: number;
  related: string[];
  /** Rank lowest score first (the "worst" list). */
  worstFirst?: boolean;
};

export type WaterRanking = Base & {
  kind: 'water';
  filter: (w: Water) => boolean;
  intro: (top: Water[], total: number) => string[];
  faqs: (top: Water[], total: number) => FAQ[];
};

export type FilterRanking = Base & {
  kind: 'filter';
  filter: (f: WaterFilter) => boolean;
  intro: (top: WaterFilter[], total: number) => string[];
  faqs: (top: WaterFilter[], total: number) => FAQ[];
};

export type Ranking = WaterRanking | FilterRanking;

// ---------------------------------------------------------------------------
// Helpers

const lower = (s: string | null | undefined) => (s ?? '').toLowerCase();
const isGlassOnly = (w: Water) => {
  const p = lower(w.packaging);
  return p.includes('glass') && !/(plastic|polyester|polyethylene|polypropylene)/.test(p);
};
const isGallon = (w: Water) => w.type === 'water_gallon' || /gallon|\bjug\b/i.test(w.name);
// Some sparkling products are typed as bottled_water upstream; the name is the tell.
const isStill = (w: Water) => (w.type === 'bottled_water' || w.type === 'water_gallon') && !/sparkling|carbonated/i.test(w.name);

/** "Panama Blue Water Glass Bottle (96/100)" */
export const nameScore = (item: { name: string; score: number }) => `${item.name} (${item.score}/100)`;

/** Joins the first n names: "A (96/100), B (95/100) and C (94/100)". */
export function listNames(items: { name: string; score: number }[], n = 3) {
  const names = items.slice(0, n).map(nameScore);
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

/**
 * Popular mainstream brands people actually search for. Used by the
 * "popular brands" and "worst" lists and by /compare pages.
 */
export const POPULAR_BRAND_SLUGS = [
  'fiji-water',
  'evian',
  'dasani',
  'aquafina',
  'smartwater',
  'poland-spring',
  'deer-park',
  'arrowhead',
  'ozarka',
  'ice-mountain',
  'zephyrhills',
  'kirkland-signature',
  'pure-life',
  'essentia-water',
  'core-hydration',
  'voss',
  'icelandic-glacial',
  'acqua-panna',
  'san-pellegrino',
  'perrier',
  'topo-chico',
  'mountain-valley',
  'saratoga-spring-water',
  'crystal-geyser',
  'liquid-death',
  'waiakea',
  'gerolsteiner',
  'path-water',
  'great-value',
  'lacroix',
  'bubly',
  'spindrift',
  'proud-source-water',
];

/** Premium / enthusiast brands that people compare against the big names (compare pages only). */
export const PREMIUM_BRAND_SLUGS = ['panama-blue', 'hallstein', 'eternal-water', 'aqua-carpatica', 'hawaii-volcanic', 'filette-prime-water', 'lauretana'];

/** A brand's most-viewed product — the one people mean when they say "Fiji water". */
export function flagshipWater(brandSlug: string): Water | undefined {
  return waters
    .filter((w) => w.brandSlug === brandSlug)
    .toSorted((a, b) => b.views - a.views || b.score - a.score)[0];
}

export function popularFlagships(): Water[] {
  return POPULAR_BRAND_SLUGS.map(flagshipWater).filter((w): w is Water => Boolean(w));
}

const methodFaq: FAQ = {
  q: 'How are these waters scored?',
  a: 'Every product gets a 0–100 purity score built from a lab report being on file, contaminants detected versus legal limits and health guidelines, the water source, mineral preservation, packaging material, cap material and PFAS testing. Products without a third-party lab report cannot score high, no matter how good the marketing is.',
};

// ---------------------------------------------------------------------------
// Rankings

export const RANKINGS: Ranking[] = [
  {
    kind: 'water',
    slug: 'healthiest-bottled-water',
    label: 'Healthiest bottled water',
    emoji: '💧',
    title: `Healthiest Bottled Water Brands (${CONTENT_YEAR}), Ranked by Lab Tests`,
    h1: `The healthiest bottled water brands in ${CONTENT_YEAR}`,
    description:
      'Which bottled water is the healthiest? We ranked still bottled waters by lab-tested contaminants, microplastics risk, PFAS testing, source and packaging. See the top picks.',
    limit: 30,
    related: ['best-glass-bottled-water', 'best-spring-water', 'bottled-water-without-microplastics', 'popular-bottled-water-brands-ranked'],
    filter: (w) => isStill(w) && w.hasLabTest,
    intro: (top, total) => [
      `The healthiest bottled water right now is ${nameScore(top[0])}, followed by ${listNames(top.slice(1), 3)}. We ranked ${total} lab-tested still waters, and the winners share a pattern: a natural spring or aquifer source, glass packaging and published third-party lab reports with low contaminant levels.`,
      'Big supermarket brands mostly land in the middle of the pack. They are usually purified municipal water in plastic, which costs them points for source quality and microplastics risk even when their contaminant results are clean.',
    ],
    faqs: (top) => [
      {
        q: 'What is the healthiest bottled water brand?',
        a: `Based on our lab-data ranking, ${top[0].brandName ?? top[0].name} is the healthiest bottled water brand right now with ${nameScore(top[0])}. ${listNames(top.slice(1), 2)} round out the top three. Scores update whenever new lab reports come in.`,
      },
      {
        q: 'Is glass bottled water healthier than plastic?',
        a: 'Usually, yes. Glass does not shed microplastics or leach plastic additives, so glass-bottled waters score higher on packaging. Plastic bottles, especially ones exposed to heat, can release micro- and nanoplastics into the water.',
      },
      {
        q: 'Is spring water healthier than purified water?',
        a: 'Spring and aquifer waters keep their natural minerals such as calcium, magnesium and bicarbonate, which our scoring rewards. Purified water (often municipal water run through reverse osmosis) is very clean but mineral-stripped, so it earns fewer source points.',
      },
      methodFaq,
    ],
  },
  {
    kind: 'water',
    slug: 'popular-bottled-water-brands-ranked',
    label: 'Popular brands ranked',
    emoji: '🛒',
    title: `Popular Bottled Water Brands Ranked Best to Worst (${CONTENT_YEAR})`,
    h1: 'Popular bottled water brands, ranked best to worst',
    description:
      'Fiji vs Evian vs Dasani vs Aquafina vs Smartwater and more. The bottled water brands you find in every grocery store, ranked by lab-tested purity score.',
    limit: 40,
    related: ['worst-bottled-water-brands', 'healthiest-bottled-water', 'best-sparkling-water'],
    filter: (w) => popularFlagships().some((f) => f.id === w.id),
    intro: (top, total) => [
      `Of the ${total} big-name bottled water brands we track, ${nameScore(top[0])} scores highest, followed by ${listNames(top.slice(1), 2)}. Each brand is represented by its best-selling product, so this is the bottle you are most likely to pick up in a store.`,
      'The bottom of the list is dominated by purified municipal water in thin plastic bottles. None of these are unsafe to drink under US rules, but they lose points for source quality, microplastics risk and limited lab transparency.',
    ],
    faqs: (top) => {
      const last = top.at(-1)!;
      return [
        {
          q: 'Which grocery store bottled water is best?',
          a: `Among widely available brands, ${nameScore(top[0])} ranks highest in our data, with ${listNames(top.slice(1), 2)} close behind.`,
        },
        {
          q: 'Which popular bottled water brand scores lowest?',
          a: `${nameScore(last)} is the lowest-scoring of the popular brands we track. Low scores usually come from plastic packaging, a municipal or undisclosed source and few published lab results rather than from a single dangerous contaminant.`,
        },
        methodFaq,
      ];
    },
  },
  {
    kind: 'water',
    slug: 'worst-bottled-water-brands',
    label: 'Lowest-scoring brands',
    emoji: '👎',
    title: `Worst Bottled Water Brands? Lowest-Scoring Waters (${CONTENT_YEAR})`,
    h1: 'The lowest-scoring popular bottled water brands',
    description:
      'Which bottled water brands score worst for purity? See the popular waters with the lowest lab-based scores and exactly why they lose points.',
    limit: 15,
    worstFirst: true,
    related: ['popular-bottled-water-brands-ranked', 'healthiest-bottled-water', 'bottled-water-without-microplastics'],
    filter: (w) => popularFlagships().some((f) => f.id === w.id),
    intro: (top) => [
      `The lowest-scoring popular bottled waters in our dataset are ${listNames(top, 3)}. These are the bottles to swap first if you want cleaner water without changing your routine.`,
      'A low score does not mean a water breaks the law. It means the product combines weaker factors: plastic packaging with high microplastics risk, purified municipal source water, detected contaminants close to health guidelines, or no recent third-party lab report.',
    ],
    faqs: (top) => [
      {
        q: 'What is the worst bottled water to drink?',
        a: `Among popular brands, ${nameScore(top[0])} has the lowest purity score in our data. Scores reflect contaminants, source, packaging and lab transparency.`,
      },
      {
        q: 'Is it safe to drink low-scoring bottled water?',
        a: 'Bottled water sold in the US must meet FDA standards, so these products are legal to sell. Our scores measure how close a water gets to ideal, using stricter health guidelines than legal limits plus packaging and source quality.',
      },
      methodFaq,
    ],
  },
  {
    kind: 'water',
    slug: 'best-glass-bottled-water',
    label: 'Glass bottled water',
    emoji: '🫙',
    title: `Best Glass Bottled Water Brands (${CONTENT_YEAR}), Lab-Tested`,
    h1: 'The best water in glass bottles',
    description:
      'The best glass bottled water brands ranked by lab-tested purity. Glass avoids plastic leaching and microplastics. Compare still and sparkling options.',
    limit: 30,
    related: ['bottled-water-without-microplastics', 'healthiest-bottled-water', 'best-sparkling-water'],
    filter: (w) => isGlassOnly(w) && w.type !== 'flavored_water',
    intro: (top, total) => [
      `The best glass bottled water is ${nameScore(top[0])}, ahead of ${listNames(top.slice(1), 3)}. We ranked ${total} waters sold in glass.`,
      'Glass is the gold standard packaging for water: it is inert, it does not shed microplastics and it does not leach plastic additives like antimony or BPA-type compounds. Watch the cap though. Plastic-lined caps can still add a small amount of plastic exposure.',
    ],
    faqs: (top) => [
      { q: 'What is the best water in a glass bottle?', a: `${nameScore(top[0])} currently ranks #1 among glass-bottled waters, followed by ${listNames(top.slice(1), 2)}.` },
      { q: 'Does glass bottled water have microplastics?', a: 'Glass bottles themselves do not shed microplastics, so glass-bottled water carries the lowest microplastics risk. Small amounts can still come from the cap liner or the bottling line.' },
      methodFaq,
    ],
  },
  {
    kind: 'water',
    slug: 'bottled-water-without-microplastics',
    label: 'No microplastics',
    emoji: '🚫',
    title: `Bottled Water Without Microplastics (${CONTENT_YEAR}): Best Brands`,
    h1: 'Bottled water with the lowest microplastics risk',
    description:
      'Which bottled water has no microplastics? Brands certified plastic-free or packaged in glass, ranked by lab-tested purity score.',
    limit: 30,
    related: ['best-glass-bottled-water', 'healthiest-bottled-water', 'pfas-free-bottled-water'],
    filter: (w) => (w.noMicroplastics || (isGlassOnly(w) && w.capSafety === 'low')) && w.type !== 'flavored_water',
    intro: (top, total) => [
      `The best bottled water for avoiding microplastics is ${nameScore(top[0])}, followed by ${listNames(top.slice(1), 3)}. This list includes ${total} waters that are either certified free of plastic packaging or sold in glass with a low-risk cap.`,
      'A 2024 Columbia University study found roughly 240,000 plastic particles per liter in popular plastic-bottled waters, most of them nanoplastics. The simplest fix is packaging: glass bottles with metal caps carry the lowest risk.',
    ],
    faqs: (top) => [
      { q: 'Which bottled water has no microplastics?', a: `No bottled water can promise zero particles, but waters in glass with low-risk caps or certified plastic-free packaging have the lowest risk. ${nameScore(top[0])} is the top-rated option.` },
      { q: 'How many microplastics are in bottled water?', a: 'A 2024 study in PNAS (Columbia University) measured about 240,000 plastic particles per liter on average across three major plastic-bottled brands, roughly 90% of them nanoplastics.' },
      { q: 'Does aluminum packaging have microplastics?', a: 'Aluminum cans and bottles are lined with a thin plastic or epoxy coating, so they carry a moderate risk. Glass is the lower-risk choice.' },
    ],
  },
  {
    kind: 'water',
    slug: 'pfas-free-bottled-water',
    label: 'PFAS-tested water',
    emoji: '🧪',
    title: `PFAS-Free Bottled Water: Brands Tested for PFAS (${CONTENT_YEAR})`,
    h1: 'Bottled waters tested for PFAS with none detected',
    description:
      'Bottled water brands that published PFAS ("forever chemicals") lab tests with no PFAS detected, ranked by overall purity score.',
    limit: 40,
    related: ['healthiest-bottled-water', 'bottled-water-without-microplastics', 'best-water-filters'],
    filter: (w) => w.isPfasTested && w.pfas === 'No',
    intro: (top, total) => [
      `${total} bottled waters in our data have a PFAS lab test on file with no PFAS detected. The highest-scoring of them is ${nameScore(top[0])}, followed by ${listNames(top.slice(1), 3)}.`,
      'PFAS are "forever chemicals" that build up in the body. In 2024 the EPA set a drinking water limit of 4 parts per trillion for PFOA and PFOS. Most bottled water brands still do not publish PFAS results, which is why a test on file earns points in our score.',
    ],
    faqs: (top) => [
      { q: 'Which bottled water is PFAS free?', a: `These waters published PFAS lab tests with no PFAS detected. ${nameScore(top[0])} scores highest overall. "Not detected" means below the lab's reporting limit.` },
      { q: 'Does bottled water have PFAS?', a: 'Some brands do. Independent testing has found PFAS in a number of bottled waters, usually at low levels. Few brands publish PFAS tests, so look for one with a recent report.' },
      { q: 'What is the EPA limit for PFAS in water?', a: 'The EPA set enforceable limits of 4.0 parts per trillion for PFOA and PFOS in public drinking water in 2024. Bottled water is regulated by the FDA, which has not adopted a matching PFAS limit.' },
    ],
  },
  {
    kind: 'water',
    slug: 'best-spring-water',
    label: 'Spring water',
    emoji: '⛰️',
    title: `Best Spring Water Brands (${CONTENT_YEAR}), Ranked by Purity`,
    h1: 'The best spring water brands',
    description:
      'The best natural spring and mountain spring water brands ranked by lab-tested contaminants, minerals, packaging and PFAS testing.',
    limit: 30,
    related: ['healthiest-bottled-water', 'best-mineral-water', 'best-alkaline-water'],
    filter: (w) => isStill(w) && (w.waterSource === 'spring' || w.waterSource === 'mountain_spring'),
    intro: (top, total) => [
      `The best spring water is ${nameScore(top[0])}, followed by ${listNames(top.slice(1), 3)}. We compared ${total} spring and mountain spring waters.`,
      'Spring water comes from an underground source that flows naturally to the surface. It keeps its natural minerals, but quality varies a lot by spring and by bottle, which is why lab reports matter more than the label.',
    ],
    faqs: (top) => [
      { q: 'What is the best spring water to drink?', a: `${nameScore(top[0])} is the top-ranked spring water in our data, ahead of ${listNames(top.slice(1), 2)}.` },
      { q: 'Is spring water better than purified water?', a: 'Spring water keeps natural minerals like calcium and magnesium, while purified water has most minerals removed. Both can be clean, but spring water scores higher for source quality in our ranking.' },
      methodFaq,
    ],
  },
  {
    kind: 'water',
    slug: 'best-mineral-water',
    label: 'Mineral water',
    emoji: '🪨',
    title: `Best Mineral Water Brands (${CONTENT_YEAR}): High-Mineral Waters`,
    h1: 'The best mineral water brands',
    description:
      'Mineral waters with at least 250 ppm total dissolved solids, ranked by lab-tested purity. Compare TDS, pH, calcium and magnesium-rich brands.',
    limit: 30,
    related: ['best-spring-water', 'best-sparkling-water', 'best-alkaline-water'],
    filter: (w) => (w.tds ?? 0) >= 250 && w.type !== 'flavored_water',
    intro: (top, total) => [
      `The best mineral water is ${nameScore(top[0])}, followed by ${listNames(top.slice(1), 3)}. All ${total} waters here have at least 250 ppm total dissolved solids (TDS), the FDA threshold for calling a water "mineral water".`,
      'High-mineral waters can be a meaningful source of calcium, magnesium and bicarbonate. Higher TDS also means a stronger taste, so expect these to taste noticeably different from purified water.',
    ],
    faqs: (top) => [
      { q: 'What is the healthiest mineral water?', a: `${nameScore(top[0])} ranks highest among mineral waters in our data.` },
      { q: 'What counts as mineral water?', a: 'In the US, the FDA defines mineral water as water with at least 250 parts per million of total dissolved solids that come naturally from the source, with no minerals added.' },
      methodFaq,
    ],
  },
  {
    kind: 'water',
    slug: 'best-alkaline-water',
    label: 'Alkaline water',
    emoji: '⚗️',
    title: `Best Alkaline Water Brands (${CONTENT_YEAR}), Lab-Tested`,
    h1: 'The best alkaline water brands',
    description:
      'Alkaline bottled waters with a pH of 8 or higher, ranked by lab-tested purity, source and packaging. See which high-pH waters are actually clean.',
    limit: 30,
    related: ['best-mineral-water', 'healthiest-bottled-water', 'best-spring-water'],
    filter: (w) => (w.ph ?? 0) >= 8 && w.type !== 'flavored_water',
    intro: (top, total) => [
      `The best alkaline water is ${nameScore(top[0])}, followed by ${listNames(top.slice(1), 3)}. Every one of these ${total} waters has a reported pH of 8 or higher.`,
      'Naturally alkaline waters get their pH from dissolved minerals. Many "ionized" alkaline brands are purified water with electrolytes added. A high pH alone does not make a water healthier, so we rank these by overall purity, not by pH.',
    ],
    faqs: (top) => [
      { q: 'What is the best alkaline water brand?', a: `${nameScore(top[0])} is the highest-scoring alkaline water in our data.` },
      { q: 'Is alkaline water healthier?', a: 'There is limited evidence that alkaline water improves health for most people. Your stomach acid neutralizes it quickly. Purity, source and packaging matter more than pH.' },
      methodFaq,
    ],
  },
  {
    kind: 'water',
    slug: 'best-sparkling-water',
    label: 'Sparkling water',
    emoji: '🫧',
    title: `Best Sparkling Water Brands (${CONTENT_YEAR}), Ranked by Purity`,
    h1: 'The healthiest sparkling water brands',
    description:
      'The best sparkling and mineral water brands ranked by lab-tested purity, contaminants, PFAS testing and packaging. Topo Chico, Gerolsteiner, San Pellegrino and more.',
    limit: 30,
    related: ['best-mineral-water', 'best-glass-bottled-water', 'popular-bottled-water-brands-ranked'],
    filter: (w) => w.type === 'sparkling_water',
    intro: (top, total) => [
      `The healthiest sparkling water is ${nameScore(top[0])}, followed by ${listNames(top.slice(1), 3)}. We ranked ${total} sparkling waters, seltzers and sparkling mineral waters.`,
      'Naturally sparkling mineral waters in glass tend to win. Canned seltzers are convenient, but cans have a plastic lining and many use municipal water, so they rarely reach the top.',
    ],
    faqs: (top) => [
      { q: 'What is the healthiest sparkling water?', a: `${nameScore(top[0])} ranks #1 for purity among sparkling waters in our data.` },
      { q: 'Is sparkling water as healthy as still water?', a: 'Plain sparkling water hydrates just as well as still water. Carbonation can be slightly harder on tooth enamel, but far less than soda. Choose brands with low contaminants and no added sweeteners.' },
      methodFaq,
    ],
  },
  {
    kind: 'water',
    slug: 'best-water-gallons',
    label: 'Gallon water',
    emoji: '🪣',
    title: `Best Gallon Water Brands (${CONTENT_YEAR}), Ranked by Purity`,
    h1: 'The best gallon and jug water brands',
    description:
      'The best gallon, half-gallon and jug waters ranked by lab-tested purity. Compare glass gallons, spring water jugs and delivery water.',
    limit: 30,
    related: ['healthiest-bottled-water', 'best-spring-water', 'best-water-filters'],
    filter: (w) => isGallon(w) && w.type !== 'flavored_water',
    intro: (top, total) => [
      `The best gallon water is ${nameScore(top[0])}, ahead of ${listNames(top.slice(1), 3)}. We ranked ${total} gallon, half-gallon and jug waters.`,
      'If you drink a lot of water, gallons are where packaging matters most because you are exposed to it every day. Glass gallons score best. If you are buying plastic jugs weekly, a good home filter can be cheaper and cleaner.',
    ],
    faqs: (top) => [
      { q: 'What is the best gallon water to buy?', a: `${nameScore(top[0])} ranks highest among gallon waters in our data.` },
      methodFaq,
    ],
  },
  {
    kind: 'water',
    slug: 'best-flavored-water',
    label: 'Flavored water',
    emoji: '🍋',
    title: `Healthiest Flavored Water Brands (${CONTENT_YEAR})`,
    h1: 'The healthiest flavored water brands',
    description: 'Flavored and infused waters ranked by lab-tested purity, packaging and ingredients.',
    limit: 25,
    related: ['best-sparkling-water', 'healthiest-bottled-water'],
    filter: (w) => w.type === 'flavored_water',
    intro: (top, total) => [
      `The healthiest flavored water is ${nameScore(top[0])}, followed by ${listNames(top.slice(1), 2)}. We ranked ${total} flavored waters.`,
    ],
    faqs: () => [methodFaq],
  },
  // ------------------------------------------------------------- Filters
  {
    kind: 'filter',
    slug: 'best-water-filters',
    label: 'Water filters',
    emoji: '🫖',
    title: `Best Water Filters (${CONTENT_YEAR}), Ranked by Contaminant Removal`,
    h1: 'The best water filters',
    description:
      'The best home water filters ranked by verified contaminant removal, certifications and lab data: pitchers, reverse osmosis, under-sink and whole-house systems.',
    limit: 30,
    related: ['best-reverse-osmosis-systems', 'best-water-filter-pitchers', 'best-under-sink-water-filters', 'best-shower-filters'],
    filter: () => true,
    intro: (top, total) => [
      `The best water filter in our ranking is ${nameScore(top[0])}, followed by ${listNames(top.slice(1), 3)}. We ranked ${total} filters on how many contaminant categories they remove, by how much, and whether that is backed by certifications or independent lab tests.`,
      'Reverse osmosis systems dominate the top because they remove the widest range of contaminants, including PFAS, fluoride and heavy metals. If you cannot install one, a certified pitcher is the best budget pick.',
    ],
    faqs: (top) => [
      { q: 'What is the best water filter?', a: `${nameScore(top[0])} ranks #1 in our data for verified contaminant removal.` },
      { q: 'Do water filters remove PFAS?', a: 'Reverse osmosis and high-quality activated carbon filters can remove most PFAS. Look for NSF/ANSI 53 or 58 certification for PFOA/PFOS reduction.' },
      { q: 'Is filtered tap water better than bottled water?', a: 'A good filter on tap water can match or beat most bottled water for contaminants, without the plastic packaging and at a fraction of the cost.' },
    ],
  },
  {
    kind: 'filter',
    slug: 'best-reverse-osmosis-systems',
    label: 'Reverse osmosis',
    emoji: '🔬',
    title: `Best Reverse Osmosis Water Filter Systems (${CONTENT_YEAR})`,
    h1: 'The best reverse osmosis systems',
    description: 'Reverse osmosis water filters ranked by verified contaminant removal, certifications and lab tests, from countertop to under-sink RO.',
    limit: 25,
    related: ['best-water-filters', 'best-under-sink-water-filters', 'best-water-filter-pitchers'],
    filter: (f) => f.technologies.includes('Reverse Osmosis') || /reverse osmosis|\bRO\b/i.test(f.name),
    intro: (top, total) => [
      `The best reverse osmosis system is ${nameScore(top[0])}, followed by ${listNames(top.slice(1), 3)}. We ranked ${total} RO filters.`,
      'Reverse osmosis pushes water through a membrane fine enough to block PFAS, fluoride, nitrates, arsenic and most dissolved solids. It also strips minerals, so systems with a remineralization stage are a nice bonus.',
    ],
    faqs: (top) => [
      { q: 'What is the best reverse osmosis system?', a: `${nameScore(top[0])} ranks highest among RO systems in our data.` },
      { q: 'Does reverse osmosis remove fluoride and PFAS?', a: 'Yes. Reverse osmosis typically removes over 90% of fluoride and PFAS, which is why RO systems top our filter rankings.' },
    ],
  },
  {
    kind: 'filter',
    slug: 'best-water-filter-pitchers',
    label: 'Filter pitchers',
    emoji: '🫗',
    title: `Best Water Filter Pitchers (${CONTENT_YEAR}), Lab-Tested`,
    h1: 'The best water filter pitchers',
    description: 'Water filter pitchers ranked by verified contaminant removal: Clearly Filtered, ProOne, Epic, Brita, ZeroWater and more.',
    limit: 25,
    related: ['best-water-filters', 'best-reverse-osmosis-systems', 'best-water-filter-bottles'],
    filter: (f) => /pitcher|carafe/i.test(f.name),
    intro: (top, total) => [
      `The best water filter pitcher is ${nameScore(top[0])}, followed by ${listNames(top.slice(1), 3)}. We ranked ${total} pitchers and carafes.`,
      'Basic carbon pitchers mainly improve taste and chlorine. The top-ranked pitchers use multi-stage media that also reduce lead, PFAS and fluoride, backed by independent test results.',
    ],
    faqs: (top) => [
      { q: 'What is the best water filter pitcher?', a: `${nameScore(top[0])} ranks #1 among pitchers in our data.` },
      { q: 'Do Brita filters remove PFAS?', a: 'Standard Brita pitcher filters are not certified for PFAS. Some Brita Elite filters are certified to reduce PFOA/PFOS. Several competitors remove a wider range of contaminants.' },
    ],
  },
  {
    kind: 'filter',
    slug: 'best-under-sink-water-filters',
    label: 'Under-sink filters',
    emoji: '🚰',
    title: `Best Under-Sink Water Filters (${CONTENT_YEAR})`,
    h1: 'The best under-sink and faucet water filters',
    description: 'Under-sink and faucet water filters ranked by verified contaminant removal and certifications.',
    limit: 25,
    related: ['best-reverse-osmosis-systems', 'best-water-filters', 'best-whole-house-water-filters'],
    filter: (f) => f.type === 'sink_filter',
    intro: (top, total) => [
      `The best under-sink water filter is ${nameScore(top[0])}, followed by ${listNames(top.slice(1), 3)}. We ranked ${total} sink and faucet filters.`,
    ],
    faqs: (top) => [{ q: 'What is the best under-sink water filter?', a: `${nameScore(top[0])} ranks highest in our data.` }],
  },
  {
    kind: 'filter',
    slug: 'best-shower-filters',
    label: 'Shower filters',
    emoji: '🚿',
    title: `Best Shower Filters (${CONTENT_YEAR}), Ranked by Lab Data`,
    h1: 'The best shower filters',
    description: 'Shower filters ranked by verified chlorine, chloramine and heavy-metal removal, certifications and lab tests.',
    limit: 25,
    related: ['best-whole-house-water-filters', 'best-water-filters'],
    filter: (f) => f.type === 'shower_filter',
    intro: (top, total) => [
      `The best shower filter is ${nameScore(top[0])}, followed by ${listNames(top.slice(1), 3)}. We ranked ${total} shower filters.`,
      'Hot water makes it hard for filters to work, so many shower filters do little beyond chlorine. The best ones show lab evidence for chloramine and heavy metal reduction too.',
    ],
    faqs: (top) => [
      { q: 'What is the best shower filter?', a: `${nameScore(top[0])} ranks #1 among shower filters in our data.` },
      { q: 'Do shower filters actually work?', a: 'Good ones reduce chlorine noticeably, which helps with dry skin and hair. Claims beyond chlorine are often unverified, so look for independent lab tests.' },
    ],
  },
  {
    kind: 'filter',
    slug: 'best-whole-house-water-filters',
    label: 'Whole-house filters',
    emoji: '🏠',
    title: `Best Whole House Water Filters (${CONTENT_YEAR})`,
    h1: 'The best whole-house water filters',
    description: 'Whole-house water filtration systems ranked by verified contaminant removal and certifications.',
    limit: 25,
    related: ['best-shower-filters', 'best-water-filters', 'best-under-sink-water-filters'],
    filter: (f) => f.type === 'home_filter',
    intro: (top, total) => [
      `The best whole-house water filter is ${nameScore(top[0])}, followed by ${listNames(top.slice(1), 2)}. We ranked ${total} whole-home systems.`,
    ],
    faqs: (top) => [{ q: 'What is the best whole-house water filter?', a: `${nameScore(top[0])} ranks highest in our data.` }],
  },
  {
    kind: 'filter',
    slug: 'best-water-filter-bottles',
    label: 'Filter bottles',
    emoji: '🍶',
    title: `Best Water Filter Bottles (${CONTENT_YEAR}), Lab-Tested`,
    h1: 'The best water filter bottles',
    description: 'Filtered water bottles for travel and hiking ranked by verified contaminant removal and lab data.',
    limit: 25,
    related: ['best-water-filter-pitchers', 'best-water-filters'],
    filter: (f) => f.type === 'bottle_filter',
    intro: (top, total) => [
      `The best water filter bottle is ${nameScore(top[0])}, followed by ${listNames(top.slice(1), 2)}. We ranked ${total} filter bottles.`,
    ],
    faqs: (top) => [{ q: 'What is the best filtered water bottle?', a: `${nameScore(top[0])} ranks highest in our data.` }],
  },
];

export const getRanking = (slug: string) => RANKINGS.find((r) => r.slug === slug);

/** Ranked, de-duplicated items for a list (best score first, popularity as tie-break). */
export function rankingItems(r: WaterRanking): { items: Water[]; total: number };
export function rankingItems(r: FilterRanking): { items: WaterFilter[]; total: number };
export function rankingItems(r: Ranking): { items: (Water | WaterFilter)[]; total: number } {
  const pool = (r.kind === 'water' ? waters.filter(r.filter) : waterFilters.filter(r.filter)) as (Water | WaterFilter)[];
  const dir = r.worstFirst ? -1 : 1;
  const sorted = pool.toSorted((a, b) => dir * (b.score - a.score) || b.views - a.views);
  return { items: sorted.slice(0, r.limit), total: pool.length };
}
