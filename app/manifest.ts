import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Voltix Nepal - 24/7 Certified Electrical & Automation Services',
    short_name: 'Voltix Nepal',
    description:
      'Licensed 24/7 emergency electrical engineering, residential wiring, industrial automation, and smart home solutions across Kathmandu Valley, Nepal.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0F172A',
    theme_color: '#DC2626',
    orientation: 'portrait-primary',
    scope: '/',
    categories: ['business', 'utilities', 'productivity', 'lifestyle'],
    lang: 'en',
    dir: 'ltr',
    prefer_related_applications: false,
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
