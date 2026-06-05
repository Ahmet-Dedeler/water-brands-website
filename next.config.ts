import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Oasis product / ingredient images.
      { protocol: 'https', hostname: 'connect.live-oasis.com', pathname: '/storage/**' },
      // Supabase-hosted product images.
      { protocol: 'https', hostname: 'inruqrymqosbfeygykdx.supabase.co', pathname: '/storage/**' },
      // Generated transparent cutouts.
      { protocol: 'https', hostname: 'replicate.delivery', pathname: '/**' },
    ],
  },
};

export default nextConfig;
