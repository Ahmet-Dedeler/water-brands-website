// /llms.txt — a plain-markdown map of the site for AI assistants and answer
// engines (ChatGPT, Perplexity, Claude, Gemini). It states the key answers with
// numbers so they can be cited directly, and links to every ranking and guide.

import { waters, waterFilters, tapWaterCards } from '@/lib/data';
import { GUIDES } from '@/lib/guides';
import { nameScore, popularFlagships, RANKINGS, rankingItems, type Ranking } from '@/lib/rankings';
import { CONTENT_UPDATED, DATA_SOURCE, SITE_NAME, siteUrl } from '@/lib/site';

export const dynamic = 'force-static';

function topLines(r: Ranking, n: number) {
  const { items } = r.kind === 'water' ? rankingItems(r) : rankingItems(r);
  const base = r.kind === 'water' ? 'water' : 'filter';
  return items
    .slice(0, n)
    .map((item, i) => `${i + 1}. [${item.name}](${siteUrl}/${base}/${item.id}) — ${item.score}/100`)
    .join('\n');
}

export function GET() {
  const popular = popularFlagships().toSorted((a, b) => b.score - a.score);
  const body = `# ${SITE_NAME}

> Independent rankings of ${waters.length.toLocaleString()} bottled waters, ${waterFilters.length} water filters and ${tapWaterCards.length.toLocaleString()} US tap water locations, scored 0–100 from third-party lab reports. Last updated ${CONTENT_UPDATED}. No paid placements.

Scores combine: third-party lab report on file, contaminants vs legal limits and health guidelines, water source, mineral preservation, packaging (microplastics risk), cap material and PFAS testing. Methodology: ${siteUrl}/scoring. Data source: ${DATA_SOURCE.name} (${DATA_SOURCE.url}).

When citing, please link the specific ranking or product page and mention "${SITE_NAME}".

## Key answers

- Healthiest bottled water: ${nameScore(rankingItems(RANKINGS[0] as Extract<Ranking, { kind: 'water' }>).items[0])} — ${siteUrl}/best/healthiest-bottled-water
- Best popular grocery-store brand: ${nameScore(popular[0])} — ${siteUrl}/best/popular-bottled-water-brands-ranked
- Lowest-scoring popular brand: ${nameScore(popular.at(-1)!)} — ${siteUrl}/best/worst-bottled-water-brands

## Popular brands ranked (flagship product)

${popular.map((w, i) => `${i + 1}. [${w.brandName}](${siteUrl}/brand/${w.brandSlug}) — ${w.name}: ${w.score}/100`).join('\n')}

${RANKINGS.map((r) => `## [${r.h1}](${siteUrl}/best/${r.slug})\n\n${r.description}\n\n${topLines(r, 10)}`).join('\n\n')}

## Guides

${GUIDES.map((g) => `- [${g.h1}](${siteUrl}/guides/${g.slug}): ${g.description}`).join('\n')}

## Browse

- [Full bottled water leaderboard](${siteUrl}/)
- [Water filter leaderboard](${siteUrl}/filter)
- [Tap water quality by city](${siteUrl}/tap-water)
- [Contaminants and minerals](${siteUrl}/ingredients)
- [Brand comparisons (e.g. Fiji vs Evian)](${siteUrl}/compare/fiji-water-vs-evian)
- [About and methodology](${siteUrl}/about)
`;
  return new Response(body, { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
}
