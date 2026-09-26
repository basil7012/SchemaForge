import { MetadataRoute } from 'next';
import { seoRoutes } from '@/lib/seo-routes';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://schemaforge.dev';

  const dynamicRoutes = seoRoutes.map((route) => ({
    url: `${baseUrl}/${route.category}/${route.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const homeRoute = {
    url: `${baseUrl}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 1.0,
  };

  return [homeRoute, ...dynamicRoutes];
}
