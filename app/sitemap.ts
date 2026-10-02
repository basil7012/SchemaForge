import { MetadataRoute } from 'next';
import { seoRoutes } from '@/lib/seo-routes';
import { blogPosts } from '@/lib/blog-posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.schemaforge.online';

  const dynamicRoutes = seoRoutes.map((route) => ({
    url: `${baseUrl}/${route.category}/${route.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const homeRoute = {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 1.0,
  };

  const blogIndex = {
    url: `${baseUrl}/blog`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  };

  return [homeRoute, blogIndex, ...dynamicRoutes, ...blogRoutes];
}
