/**
 * Product images are pre-converted to small WebP files and served from a
 * Cloudflare R2 bucket (free egress) instead of going through Vercel's image
 * optimizer, which bills per transformation and per byte transferred.
 *
 * Every source URL maps to a stable key, so the same function is used by the
 * upload script (`npm run images:sync`) and by the Next.js image loader.
 */

export const IMAGE_CDN_BASE = 'https://img.waterqualityrank.org';

/** The two widths uploaded per image. */
export const IMAGE_CDN_SIZES = [256, 640] as const;
export type ImageCdnSize = (typeof IMAGE_CDN_SIZES)[number];

/** cyrb53: tiny, fast, deterministic 53-bit string hash (same result in Node and the browser). */
function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/** Object key in the bucket for a source image at a given width, e.g. `w/1x2abc-256.webp`. */
export function imageCdnKey(src: string, size: ImageCdnSize): string {
  return `w/${cyrb53(src).toString(36)}-${size}.webp`;
}

/** Smallest uploaded size that covers the requested width (falls back to the largest). */
export function pickImageCdnSize(width: number): ImageCdnSize {
  return IMAGE_CDN_SIZES.find((size) => size >= width) ?? IMAGE_CDN_SIZES[IMAGE_CDN_SIZES.length - 1];
}

export function imageCdnUrl(src: string, width: number): string {
  return `${IMAGE_CDN_BASE}/${imageCdnKey(src, pickImageCdnSize(width))}`;
}
