import type { Metadata } from 'next';
import './globals.css';
import prisma from '@/lib/prisma';
import { generateLocalBusinessSchema } from '@/lib/seo';
import { DEFAULT_SETTINGS } from '@/lib/constants';
import PublicLayoutWrapper from '@/components/layout/PublicLayoutWrapper';

export async function generateMetadata(): Promise<Metadata> {
  let settings = null;
  try {
    settings = await prisma.websiteSettings.findUnique({
      where: { id: 'default_settings' },
    });
  } catch (e) {
    // Fallback
  }

  const businessName = settings?.businessName || DEFAULT_SETTINGS.businessName;
  const tagline = settings?.tagline || DEFAULT_SETTINGS.tagline;

  return {
    title: {
      default: `${businessName} | ${tagline}`,
      template: `%s | ${businessName}`,
    },
    description:
      'Professional electrical services in Kathmandu, Lalitpur, and Bhaktapur by electrician Sanjeet Mishra. House wiring, 24/7 emergency repair, MCB troubleshooting, inverter installation.',
    keywords: [
      'electrician kathmandu',
      'electrical repair nepal',
      'house wiring kathmandu',
      'sanjeet mishra electrician',
      'voltix nepal',
      'inverter installation nepal',
      'emergency electrician lalitpur',
    ],
    authors: [{ name: 'Sanjeet Mishra', url: 'https://voltixnepal.com' }],
    creator: 'Sanjeet Mishra',
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://voltixnepal.com'),
    openGraph: {
      type: 'website',
      locale: 'en_NP',
      url: 'https://voltixnepal.com',
      siteName: businessName,
      title: `${businessName} - Professional Electrical Services in Nepal`,
      description:
        'Certified electrical contractor in Kathmandu Valley. House wiring, short circuit repairs, inverter battery setup, and 24/7 breakdown assistance.',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
          width: 1200,
          height: 630,
          alt: 'VoltixNepal Electrical Contractor',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${businessName} | Electrical Services Nepal`,
      description: 'Expert electrician in Kathmandu for house wiring, breaker repair, and inverter setup.',
    },
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
      apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
      shortcut: ['/icon.svg'],
    },
    verification: {
      google: 'gWRSvZzPkeD0m5lU2iIFwbguSiEVGyRd_GO2kXzrAWA',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings = null;
  try {
    settings = await prisma.websiteSettings.findUnique({
      where: { id: 'default_settings' },
    });
  } catch (e) {
    settings = DEFAULT_SETTINGS as any;
  }

  const safeSettings = settings || (DEFAULT_SETTINGS as any);
  const jsonLd = generateLocalBusinessSchema({
    businessName: safeSettings.businessName,
    ownerName: safeSettings.ownerName,
    phone: safeSettings.phone,
    email: safeSettings.email,
    address: safeSettings.address,
    googleMapsUrl: safeSettings.googleMapsUrl,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  });

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="google-site-verification" content="gWRSvZzPkeD0m5lU2iIFwbguSiEVGyRd_GO2kXzrAWA" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-white text-slate-900 selection:bg-red-600 selection:text-white">
        <PublicLayoutWrapper settings={safeSettings}>
          {children}
        </PublicLayoutWrapper>
      </body>
    </html>
  );
}
