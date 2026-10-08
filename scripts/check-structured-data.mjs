#!/usr/bin/env node
/**
 * Checks the JSON-LD on rendered pages against the fields Google Search Console requires, so structured-data
 * errors fail here instead of showing up weeks later as a Search Console email.
 *
 * Usage:
 *   node scripts/check-structured-data.mjs [dir|file.html|url ...]
 *   node scripts/check-structured-data.mjs --sitemap http://localhost:3000/sitemap.xml [--per-template 3]
 *
 * With no arguments it scans every .html file under .next/server/app (run `npm run build` first).
 * Directories are scanned recursively; URLs are fetched with a browser User-Agent.
 * --sitemap samples a few URLs per page template (first path segment, e.g. /water/*) from a sitemap and fetches them
 * from the sitemap's own origin, so it also covers pages rendered on demand. Works on `next start` or production.
 * Exits 1 on any error. Warnings (Google's "non-critical" issues) are printed but don't fail.
 *
 * Rules follow https://developers.google.com/search/docs/appearance/structured-data/search-gallery.
 * The same script lives in free-north-korea; keep them in sync.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36';
const MAX_EXAMPLES = 3;

const types = (node) => [].concat(node['@type'] ?? []);
const has = (v) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0);
const list = (v) => (v === undefined || v === null ? [] : [].concat(v));
const authorName = (a) => list(a).some((x) => (typeof x === 'string' ? x : x?.name));

/** Per-type checks. Each returns [errors, warnings] as arrays of short issue names. */
const RULES = {
  Dataset(n) {
    const e = [], w = [];
    if (!has(n.name)) e.push('Dataset: missing "name"');
    if (!has(n.description)) e.push('Dataset: missing "description"');
    else if (String(n.description).length < 50) e.push('Dataset: "description" shorter than 50 characters');
    else if (String(n.description).length > 5000) e.push('Dataset: "description" longer than 5000 characters');
    if (!has(n.creator)) w.push('Dataset: missing "creator"');
    if (!has(n.license)) w.push('Dataset: missing "license"');
    return [e, w];
  },
  Product(n) {
    const e = [];
    if (!has(n.name)) e.push('Product: missing "name"');
    if (!has(n.review) && !has(n.aggregateRating) && !has(n.offers))
      e.push('Product: needs one of "review", "aggregateRating" or "offers"');
    return [e, []];
  },
  AggregateRating(n) {
    const e = [];
    if (!has(n.ratingValue)) e.push('AggregateRating: missing "ratingValue"');
    // The error Search Console sent for waterqualityrank.org. An editorial score is a Review, not an AggregateRating.
    if (!has(n.ratingCount) && !has(n.reviewCount)) e.push('AggregateRating: needs "ratingCount" or "reviewCount"');
    return [e, []];
  },
  Review(n) {
    const e = [];
    if (!has(n.reviewRating?.ratingValue)) e.push('Review: missing "reviewRating.ratingValue"');
    if (!authorName(n.author)) e.push('Review: missing "author.name"');
    return [e, []];
  },
  FAQPage(n) {
    const e = [];
    const qs = list(n.mainEntity);
    if (!qs.length) e.push('FAQPage: no "mainEntity" questions');
    for (const q of qs) if (!has(q?.name) || !has(q?.acceptedAnswer?.text)) e.push('FAQPage: question missing "name" or "acceptedAnswer.text"');
    return [e, []];
  },
  BreadcrumbList(n) {
    const e = [];
    const items = list(n.itemListElement);
    items.forEach((it, i) => {
      if (!has(it?.position) || !has(it?.name)) e.push('BreadcrumbList: item missing "position" or "name"');
      if (i < items.length - 1 && !has(it?.item)) e.push('BreadcrumbList: non-final item missing "item"');
    });
    return [e, []];
  },
  Article(n) {
    return [has(n.headline) ? [] : ['Article: missing "headline"'], []];
  },
};

/** Walks every object in a JSON-LD tree (nested values, arrays, @graph) and applies the rules. */
function check(node, out) {
  if (Array.isArray(node)) return node.forEach((x) => check(x, out));
  if (!node || typeof node !== 'object') return;
  for (const t of types(node)) {
    const rule = RULES[t];
    if (!rule) continue;
    const [e, w] = rule(node);
    out.errors.push(...e);
    out.warnings.push(...w);
  }
  for (const v of Object.values(node)) if (v && typeof v === 'object') check(v, out);
}

function htmlFiles(path) {
  if (statSync(path).isFile()) return [path];
  return readdirSync(path, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? htmlFiles(join(path, d.name)) : d.name.endsWith('.html') ? [join(path, d.name)] : [],
  );
}

async function load(target) {
  if (/^https?:\/\//.test(target)) {
    const res = await fetch(target, { headers: { 'user-agent': UA } });
    if (!res.ok) throw new Error(`${target}: HTTP ${res.status}`);
    return [[target, await res.text()]];
  }
  return htmlFiles(target).map((f) => [f, readFileSync(f, 'utf8')]);
}

/** Up to `per` URLs for each template in a sitemap, with the origin swapped to the sitemap's (sitemaps list prod URLs). */
async function sample(sitemap, per) {
  const res = await fetch(sitemap, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`${sitemap}: HTTP ${res.status}`);
  const origin = new URL(sitemap).origin;
  const byTemplate = new Map();
  for (const [, loc] of (await res.text()).matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
    const u = new URL(loc);
    const parts = u.pathname.split('/').filter(Boolean);
    const template = parts.length > 1 ? `/${parts.slice(0, -1).join('/')}/*` : u.pathname;
    const urls = byTemplate.get(template) ?? [];
    if (urls.length < per) urls.push(origin + u.pathname + u.search);
    byTemplate.set(template, urls);
  }
  return [...byTemplate.values()].flat();
}

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args.splice(i, 2)[1];
};
const sitemap = flag('--sitemap');
const per = Number(flag('--per-template') ?? 3);
const targets = [...args, ...(sitemap ? await sample(sitemap, per) : [])];
if (!targets.length) targets.push('.next/server/app');

const issues = { error: new Map(), warning: new Map() };
const note = (kind, issue, page) => {
  const pages = issues[kind].get(issue) ?? [];
  pages.push(page);
  issues[kind].set(issue, pages);
};

let pages = 0, blocks = 0;
for (const target of targets) {
  let loaded;
  try {
    loaded = await load(target);
  } catch (err) {
    note('error', `Could not load page (${err.message.split(': ').pop()})`, target);
    continue;
  }
  for (const [page, html] of loaded) {
    pages++;
    for (const [, raw] of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
      blocks++;
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        note('error', 'Invalid JSON in ld+json block', page);
        continue;
      }
      const out = { errors: [], warnings: [] };
      check(data, out);
      new Set(out.errors).forEach((i) => note('error', i, page));
      new Set(out.warnings).forEach((i) => note('warning', i, page));
    }
  }
}

const report = (kind, label) => {
  for (const [issue, ps] of issues[kind]) {
    console.log(`${label} ${issue} (${ps.length} page${ps.length === 1 ? '' : 's'})`);
    ps.slice(0, MAX_EXAMPLES).forEach((p) => console.log(`    ${p}`));
  }
};
report('error', '✗');
report('warning', '!');
console.log(`Structured data: ${pages} pages, ${blocks} JSON-LD blocks, ${issues.error.size} error types, ${issues.warning.size} warning types.`);
if (!pages) {
  console.log('No pages found. Run `npm run build` first or pass URLs.');
  process.exit(1);
}
process.exit(issues.error.size ? 1 : 0);
