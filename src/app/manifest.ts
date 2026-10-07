import type { MetadataRoute } from 'next';
import { SITE_NAME } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: 'Water Rank',
    description: 'Bottled water, water filters and tap water ranked by lab-tested purity.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fcfcf9',
    theme_color: '#0284c7',
    icons: [
      { src: '/logo-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/logo.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
