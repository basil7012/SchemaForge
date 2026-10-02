import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Database, ArrowLeft, Clock, Calendar, ArrowRight } from 'lucide-react';
import { blogPosts, getBlogPost } from '@/lib/blog-posts';

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

const SITE_URL = 'https://www.schemaforge.online';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: 'Not Found' };

  const url = `${SITE_URL}/blog/${post.slug}`;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Organization', name: 'SchemaForge' },
    publisher: { '@type': 'Organization', name: 'SchemaForge', url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  return {
    title: `${post.title} — SchemaForge`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url,
      siteName: 'SchemaForge',
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
    other: {
      'application/ld+json': JSON.stringify(articleSchema),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Organization', name: 'SchemaForge' },
    publisher: { '@type': 'Organization', name: 'SchemaForge', url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'SchemaForge', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };

  const otherPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col" style={{ fontFamily: 'var(--font-inter)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-5 py-3 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
        <Link href="/" aria-label="Back to SchemaForge home" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <Database className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              SchemaForge
            </span>
          </div>
        </Link>
        <Link href="/blog" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          ← All Articles
        </Link>
      </nav>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="px-5 pt-4 pb-1 max-w-3xl w-full mx-auto">
        <ol className="flex items-center gap-1.5 text-xs text-zinc-600">
          <li><Link href="/" className="hover:text-zinc-400 transition-colors">SchemaForge</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/blog" className="hover:text-zinc-400 transition-colors">Blog</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-zinc-400 truncate max-w-[200px]">{post.title}</li>
        </ol>
      </nav>

      {/* Article */}
      <article className="px-4 pt-8 pb-16 max-w-3xl w-full mx-auto">
        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-zinc-500 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readingTimeMin} min read
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-100 mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Description */}
        <p className="text-base text-zinc-400 leading-relaxed mb-8 pb-8 border-b border-zinc-800/60">
          {post.description}
        </p>

        {/* Content */}
        <div
          className="prose-blog"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA to tool */}
        <div className="mt-12 p-6 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl">
          <h2 className="text-base font-bold text-zinc-100 mb-2">Try it now — free &amp; instant</h2>
          <p className="text-sm text-zinc-400 mb-4">
            Use SchemaForge to convert your SQL schema automatically. No upload, no account, no rate limits — everything runs in your browser.
          </p>
          <Link
            href={post.relatedToolHref}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors group"
          >
            {post.relatedToolLabel}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </article>

      {/* Related articles */}
      {otherPosts.length > 0 && (
        <div className="px-4 pb-16 max-w-3xl w-full mx-auto">
          <h2 className="text-base font-semibold text-zinc-300 mb-4">More SQL Guides</h2>
          <div className="space-y-3">
            {otherPosts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group flex items-center justify-between gap-4 px-4 py-3 bg-zinc-900/40 border border-zinc-800/60 rounded-xl hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-200"
              >
                <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors line-clamp-1">
                  {p.title}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 bg-zinc-900/30 mt-auto">
        <div className="max-w-[1600px] mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <Database className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-semibold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              SchemaForge
            </span>
            <span className="text-xs text-zinc-600">© {new Date().getFullYear()} — Free, open, private.</span>
          </div>
          <nav aria-label="Footer navigation" className="flex items-center gap-4 text-xs text-zinc-500">
            <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
            <Link href="/blog" className="hover:text-zinc-300 transition-colors">Blog</Link>
            <Link href="/convert/postgres-to-mysql" className="hover:text-zinc-300 transition-colors">SQL Converters</Link>
            <Link href="/generate/postgres-to-csharp-poco" className="hover:text-zinc-300 transition-colors">Code Generators</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
