export function generateLocalBusinessSchema(settings: {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  googleMapsUrl?: string;
  appUrl?: string;
}) {
  const baseUrl = settings.appUrl || 'https://voltixnepal.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Electrician',
    name: settings.businessName || 'VoltixNepal',
    alternateName: 'Voltix Nepal Electrical Services',
    description: 'Professional residential and commercial electrical installation, repair, house wiring, and 24/7 emergency electrical services in Kathmandu Valley by Sanjit Mishra.',
    url: baseUrl,
    telephone: settings.phone || '+9779825870047',
    email: settings.email || 'voltixnepal@gmail.com',
    priceRange: 'NPR',
    image: `${baseUrl}/volti-x-nepal-logo.svg`,
    logo: `${baseUrl}/volti-x-nepal-logo.svg`,
    founder: {
      '@type': 'Person',
      name: settings.ownerName || 'Sanjit Mishra',
      jobTitle: 'Electrician & Electrical Contractor',
      worksFor: {
        '@type': 'Organization',
        name: 'VoltixNepal',
      },
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address || 'Kathmandu Valley',
      addressLocality: 'Kathmandu',
      addressRegion: 'Bagmati Province',
      postalCode: '44600',
      addressCountry: 'NP',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 27.7172,
      longitude: 85.324,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '00:00',
        closes: '23:59',
      },
    ],
    areaServed: [
      { '@type': 'City', name: 'Kathmandu' },
      { '@type': 'City', name: 'Lalitpur' },
      { '@type': 'City', name: 'Bhaktapur' },
      { '@type': 'AdministrativeArea', name: 'Kathmandu Valley' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Electrical Services Catalog',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Complete House Wiring & Conduit Piping',
            description: 'Conduit piping, load-balanced distribution boards, earthing systems, and premium concealed wiring for homes and buildings in Kathmandu.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: '24/7 Emergency Electrical Repair & Short Circuit Finding',
            description: 'Rapid diagnostic and repair for tripping MCBs, phase line faults, sparking, and electrical breakdown.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Inverter & Solar Battery Setup',
            description: 'Accurate wattage load sizing, inverter installation, and battery maintenance.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Distribution Board (DB) & Earthing Installation',
            description: 'Copper plate earthing, chemical earthing pits, and RCCB/ELCB shock protection.',
          },
        },
      ],
    },
  };
}

export function generateServiceSchema(service: {
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  imageUrl: string;
  slug: string;
  serviceArea?: string;
}, baseUrl: string = 'https://voltixnepal.com') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    serviceType: service.category,
    description: service.shortDescription || service.fullDescription.substring(0, 200),
    provider: {
      '@type': 'Electrician',
      name: 'VoltixNepal',
      telephone: '+9779825870047',
      url: baseUrl,
      image: `${baseUrl}/volti-x-nepal-logo.svg`,
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: service.serviceArea || 'Kathmandu Valley (Kathmandu, Lalitpur, Bhaktapur)',
    },
    url: `${baseUrl}/services/${service.slug}`,
    image: service.imageUrl,
  };
}

export function generateBlogPostSchema(post: {
  title: string;
  excerpt: string;
  author: string;
  imageUrl?: string | null;
  slug: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}, baseUrl: string = 'https://voltixnepal.com') {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.imageUrl || `${baseUrl}/volti-x-nepal-logo.svg`,
    author: {
      '@type': 'Person',
      name: post.author || 'Sanjit Mishra',
      jobTitle: 'Electrician & Safety Consultant',
      url: `${baseUrl}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'VoltixNepal',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/volti-x-nepal-logo.svg`,
      },
    },
    datePublished: new Date(post.createdAt).toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${post.slug}`,
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
