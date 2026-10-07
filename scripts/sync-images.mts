/**
 * Uploads every product / filter / ingredient / brand image the site renders
 * with next/image to the R2 bucket behind img.waterqualityrank.org, as small
 * WebP files (see src/lib/image-cdn.ts). Run after `npm run build:data` so new
 * scraped images exist before deploying:
 *
 *   CLOUDFLARE_API_TOKEN=... npm run images:sync
 *
 * Idempotent: keys already in the bucket are skipped. Needs a Cloudflare API
 * token with R2 write access on the AhmetBuilds account. A short-lived wrangler
 * OAuth token works too: set CLOUDFLARE_API_TOKEN_CMD to a command that prints
 * a fresh one and it is re-run when the token expires.
 *
 * The Cloudflare API allows ~4 requests/s, which is fine for a handful of new
 * images. For a full re-upload, deploy a throwaway Worker with an R2 binding
 * that accepts `PUT /<key>` and set R2_UPLOAD_URL + R2_UPLOAD_SECRET to use it.
 *
 * Never HEAD image URLs on the public domain before uploading: Cloudflare caches
 * the 404 for hours, so the image stays broken even after the upload.
 */
import { execSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { IMAGE_CDN_SIZES, imageCdnKey } from '../src/lib/image-cdn.ts';

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? 'a2ea6e80287547ffb2bc27e324ef154a';
const BUCKET = 'waterqualityrank-images';
const TOKEN_CMD = process.env.CLOUDFLARE_API_TOKEN_CMD;
let TOKEN = process.env.CLOUDFLARE_API_TOKEN ?? (TOKEN_CMD ? execSync(TOKEN_CMD).toString().trim() : undefined);
const API = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET}`;
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 12);
const DATA_FILES = ['waters', 'water-cards', 'water-filters', 'water-filter-cards', 'ingredients', 'brands'];

if (!TOKEN) throw new Error('Set CLOUDFLARE_API_TOKEN or CLOUDFLARE_API_TOKEN_CMD');

/** Collect every `image` string anywhere in the data files. */
function collectImages(node: unknown, out: Set<string>) {
  if (Array.isArray(node)) node.forEach((item) => collectImages(item, out));
  else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === 'image' && typeof value === 'string') out.add(value);
      else collectImages(value, out);
    }
  }
}

/** Every key already in the bucket, via the R2 list API (cursor-paginated). */
async function listExistingKeys(): Promise<Set<string>> {
  const keys = new Set<string>();
  let cursor = '';
  do {
    const res = await fetch(`${API}/objects?per_page=1000${cursor ? `&cursor=${cursor}` : ''}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const body = (await res.json()) as { result: { key: string }[]; result_info?: { cursor?: string; is_truncated?: boolean } };
    body.result.forEach((obj) => keys.add(obj.key));
    cursor = body.result_info?.is_truncated ? (body.result_info.cursor ?? '') : '';
  } while (cursor);
  return keys;
}

const UPLOAD_URL = process.env.R2_UPLOAD_URL;

async function upload(key: string, body: Buffer) {
  const url = UPLOAD_URL ? `${UPLOAD_URL}/${key}` : `${API}/objects/${key}`;
  const auth = UPLOAD_URL ? { 'x-secret': process.env.R2_UPLOAD_SECRET ?? '' } : { Authorization: `Bearer ${TOKEN}` };
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        ...auth,
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
      body,
    });
    if (res.ok) return;
    if ((res.status === 401 || res.status === 403) && TOKEN_CMD) TOKEN = execSync(TOKEN_CMD).toString().trim();
    if (res.status === 429) await new Promise((r) => setTimeout(r, 30_000));
    if (attempt >= 5) throw new Error(`upload ${key}: ${res.status} ${await res.text()}`);
    await new Promise((r) => setTimeout(r, 1000 * attempt));
  }
}

async function processImage(src: string): Promise<'skipped' | 'uploaded'> {
  if (IMAGE_CDN_SIZES.every((size) => existing.has(imageCdnKey(src, size)))) return 'skipped';

  const res = await fetch(src);
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  const original = Buffer.from(await res.arrayBuffer());

  for (const size of IMAGE_CDN_SIZES) {
    const webp = await sharp(original)
      .rotate()
      .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 74, effort: 5, alphaQuality: 80 })
      .toBuffer();
    await upload(imageCdnKey(src, size), webp);
  }
  return 'uploaded';
}

const images = new Set<string>();
for (const name of DATA_FILES) {
  collectImages(JSON.parse(await readFile(new URL(`../src/data/${name}.json`, import.meta.url), 'utf8')), images);
}
const existing = await listExistingKeys();
console.log(`${existing.size} objects already in the bucket`);
const queue = [...images].filter((src) => /^https?:\/\//.test(src));
console.log(`${queue.length} images`);

const counts = { uploaded: 0, skipped: 0, failed: 0 };
const failures: string[] = [];
let done = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const src = queue.shift()!;
      try {
        counts[await processImage(src)]++;
      } catch (err) {
        counts.failed++;
        failures.push(`${src} — ${(err as Error).message}`);
        console.log('failed', failures.at(-1));
      }
      if (++done % 250 === 0) console.log(done, counts);
    }
  }),
);
console.log('done', counts);
if (failures.length) console.log('failures:\n' + failures.join('\n'));
