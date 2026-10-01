import Link from 'next/link';
import Workbench from '@/components/Workbench';
import { ShieldCheck, Zap, Lock, Code2, ArrowRight } from 'lucide-react';
import { seoRoutes } from '@/lib/seo-routes';

const FEATURES = [
  { icon: Zap, title: 'Instant Conversion', desc: 'Live 300ms debounced preview as you type. No submit button needed.' },
  { icon: ShieldCheck, title: '100% Private', desc: 'Your schema never leaves your browser. Zero server calls, ever.' },
  { icon: Lock, title: 'Multi-Dialect', desc: 'PostgreSQL, MySQL, SQLite, SQL Server — all supported automatically.' },
  { icon: Code2, title: '4 Output Formats', desc: 'C# POCO, TypeScript interfaces, Mock JSON, and SQL INSERT statements.' },
];

export default function HomePage() {
  const convertRoutes = seoRoutes.filter((r) => r.category === 'convert');
  const generateRoutes = seoRoutes.filter((r) => r.category === 'generate');

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col" style={{ fontFamily: 'var(--font-inter)' }}>
      {/* Hero section */}
      <div className="text-center px-4 pt-14 pb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide mb-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          100% Client-Side &amp; Private — Zero Server Transmission
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-100 mb-4 leading-tight">
          Free SQL Schema to{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            C# &amp; TypeScript
          </span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Paste any SQL <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded text-sm">CREATE TABLE</code> script.
          Instantly get C# POCO models, TypeScript interfaces, realistic mock JSON, and SQL INSERT statements.
        </p>
      </div>

      {/* Workbench */}
      <div className="flex-1 px-4 pb-6 max-w-[1600px] w-full mx-auto">
        <Workbench />
      </div>

      {/* Feature pills */}
      <div className="px-4 pb-10 max-w-[1600px] w-full mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 hover:border-zinc-700/60 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">{title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About / Body Text — critical for SEO */}
      <div className="px-4 pb-10 max-w-3xl w-full mx-auto">
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">
            The SQL Schema Converter Built for Developers
          </h2>
          <div className="prose prose-invert prose-sm max-w-none text-zinc-400 leading-relaxed space-y-4">
            <p>
              SchemaForge converts your raw SQL <code className="text-indigo-400 bg-indigo-950/60 px-1 rounded">CREATE TABLE</code> scripts into production-ready code and data — instantly, entirely inside your browser. There is no server, no account, and no data ever leaves your machine.
            </p>
            <p>
              Whether you are working with <strong className="text-zinc-300">PostgreSQL</strong>, <strong className="text-zinc-300">MySQL</strong>, <strong className="text-zinc-300">SQLite</strong>, <strong className="text-zinc-300">SQL Server</strong>, <strong className="text-zinc-300">Oracle</strong>, or <strong className="text-zinc-300">MariaDB</strong> schemas, the parser auto-detects your SQL dialect and maps every column type, constraint, and foreign key to the correct output type.
            </p>
            <p>
              <strong className="text-zinc-300">C# developers</strong> get fully annotated POCO classes with <code className="text-indigo-400 bg-indigo-950/60 px-1 rounded">[Key]</code>, <code className="text-indigo-400 bg-indigo-950/60 px-1 rounded">[Required]</code>, and <code className="text-indigo-400 bg-indigo-950/60 px-1 rounded">[Column]</code> DataAnnotations ready for Entity Framework. <strong className="text-zinc-300">TypeScript developers</strong> get clean, nullable-aware interfaces that match your database schema exactly. Teams that need <strong className="text-zinc-300">realistic test data</strong> can generate contextually accurate mock JSON records powered by Faker.js — names, emails, dates, and UUIDs that respect your column naming conventions.
            </p>
            <p>
              Unlike tools that require you to upload your schema to a remote server, SchemaForge uses <strong className="text-zinc-300">WebAssembly-compatible JavaScript parsing</strong> to process everything locally. Your proprietary database structure never leaves your browser tab — making it safe to use with internal, confidential, or production schemas.
            </p>
          </div>
        </div>
      </div>

      {/* Full Tool Directory — all routes linked for crawlability (P1 SEO fix) */}
      <div className="px-4 pb-10 max-w-[1600px] w-full mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-zinc-100 mb-1">SQL Converters</h2>
          <p className="text-sm text-zinc-500">Convert DDL scripts between SQL dialects — all free, private, and in-browser.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 mb-12">
          {convertRoutes.map((route) => (
            <Link
              key={route.slug}
              href={`/${route.category}/${route.slug}`}
              className="flex items-center justify-between gap-2 px-3 py-2.5 bg-zinc-900/40 border border-zinc-800/60 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-200 group"
            >
              <span>{route.sourceName} → {route.targetName}</span>
              <ArrowRight className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-zinc-100 mb-1">Code Generators</h2>
          <p className="text-sm text-zinc-500">Generate typed code and mock data from any SQL schema.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 mb-8">
          {generateRoutes.map((route) => (
            <Link
              key={route.slug}
              href={`/${route.category}/${route.slug}`}
              className="flex items-center justify-between gap-2 px-3 py-2.5 bg-zinc-900/40 border border-zinc-800/60 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all duration-200 group"
            >
              <span>{route.sourceName} → {route.targetName}</span>
              <ArrowRight className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>

        <div className="text-center pb-8">
          <p className="text-xs text-zinc-600">
            {seoRoutes.length} tools covering all major SQL dialects and output formats — 100% free, private, and in-browser.
          </p>
        </div>
      </div>
    </div>
  );
}
