'use client';

import { imageCdnUrl } from './image-cdn';

/**
 * Custom next/image loader. Remote product images resolve to the pre-built
 * WebP copies on R2 (see image-cdn.ts); anything else (local /public files,
 * data URIs) is returned untouched. No Vercel image optimization is used.
 */
export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  if (!/^https?:\/\//.test(src)) return src;
  return imageCdnUrl(src, width);
}
