import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Images are pre-built WebP files on Cloudflare R2 (img.waterqualityrank.org),
    // so Vercel's paid on-demand image optimization is never used.
    // See src/lib/image-cdn.ts and scripts/sync-images.mts.
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    // Keep srcset short: the loader only has 256px and 640px files anyway.
    imageSizes: [128, 256],
    deviceSizes: [640, 1080],
  },
};

export default nextConfig;
