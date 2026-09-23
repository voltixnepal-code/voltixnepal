import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voltixnepal.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/admin/', '/api/auth/'],
      },
      // Search Engine Crawlers
      {
        userAgent: [
          'Googlebot',
          'Bingbot',
          'Slurp',
          'DuckDuckBot',
          'Baiduspider',
          'YandexBot',
          'Sogou',
          'Exabot',
          'facebot',
          'ia_archiver',
          'Applebot',
        ],
        allow: '/',
        disallow: ['/admin/'],
      },
      // AI Crawlers & LLM Agents (Permit full discovery & indexing)
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'Google-Extended',
          'ClaudeBot',
          'Claude-Web',
          'anthropic-ai',
          'PerplexityBot',
          'Cohere-ai',
          'Bytespider',
          'CCBot',
          'Diffbot',
          'FacebookBot',
          'Meta-ExternalAgent',
          'Amazonbot',
          'Applebot-Extended',
          'Timpibot',
          'YouBot',
        ],
        allow: '/',
        disallow: ['/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
