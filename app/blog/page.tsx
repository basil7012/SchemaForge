import { Metadata } from 'next';
import Link from 'next/link';
import { Database, ArrowRight, Clock, Calendar } from 'lucide-react';
import { blogPosts } from '@/lib/blog-posts';

export const metadata: Metadata = {
  title: 'SQL Guides & Tutorials — SchemaForge Blog',
  description:
    'In-depth guides on SQL schema conversion, type mapping, and code generation. Learn how to convert PostgreSQL to C#, TypeScript, Python, and more.',
  alternates: {
    canonical: 'https://www.schemaforge.online/blog',
  },
  openGraph: {
    title: 'SQL Guides & Tutorials — SchemaForge Blog',
    description:
      'In-depth guides on SQL schema conversion, type mapping, and code generation.',
    type: 'website',
    url: 'https://www.schemaforge.online/blog',
    siteName: 'SchemaForge',
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col" style={{ fontFamily: 'var(--font-inter)' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-5 py-3 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2" aria-label="SchemaForge home">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Database className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            SchemaForge
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-xs text-zinc-500">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Tools</Link>
          <Link href="/blog" className="text-zinc-200">Blog</Link>
        </nav>
      </nav>

      {/* Header */}
      <div className="text-center px-4 pt-14 pb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide mb-6">
          SQL Guides &amp; Tutorials
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100 mb-4 leading-tight">
          The SchemaForge Blog
        </h1>
        <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
          In-depth guides on SQL type mapping, schema conversion, and code generation across every major database dialect and programming language.
        </p>
      </div>

      {/* Article grid */}
      <div className="px-4 pb-16 max-w-4xl w-full mx-auto">
        <div className="space-y-4">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
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
                  <h2 className="text-lg font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors mb-2 leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">
                    {post.description}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    Read article
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

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
