import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { seoRoutes } from '@/lib/seo-routes';
import Workbench from '@/components/Workbench';
import { ArrowLeft, Database, ShieldCheck, ChevronDown } from 'lucide-react';

export async function generateStaticParams() {
  return seoRoutes.map((route) => ({
    category: route.category,
    slug: route.slug,
  }));
}

const SITE_URL = 'https://www.schemaforge.online';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const p = await params;
  const route = seoRoutes.find((r) => r.category === p.category && r.slug === p.slug);

  if (!route) return { title: 'Not Found' };

  const canonicalUrl = `${SITE_URL}/${p.category}/${p.slug}`;

  return {
    title: route.title,
    description: route.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: route.title,
      description: route.description,
      url: canonicalUrl,
      type: 'website',
      siteName: 'SchemaForge',
    },
  };
}

export default async function ProgrammaticSeoPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const p = await params;
  const route = seoRoutes.find((r) => r.category === p.category && r.slug === p.slug);

  if (!route) notFound();

  let defaultTab: 'csharp' | 'typescript' | 'json' | 'sql' = 'csharp';
  if (route.category === 'generate') {
    if (route.targetName.includes('TypeScript')) defaultTab = 'typescript';
    if (route.targetName.includes('Mock JSON')) defaultTab = 'json';
    if (route.targetName.includes('SQL Insert')) defaultTab = 'sql';
  }

  const isPostgres = route.sourceName === 'PostgreSQL';
  const idType = isPostgres ? 'SERIAL PRIMARY KEY' : 'INT NOT NULL AUTO_INCREMENT PRIMARY KEY';

  const defaultSql = `-- ${route.sourceName} schema example
CREATE TABLE customers (
  id ${idType},
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(30),
  company VARCHAR(200),
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE orders (
  id ${idType},
  customer_id INT NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);`;

  const faqItems = [
    {
      q: `How do I convert ${route.sourceName} to ${route.targetName}?`,
      a: `Paste your ${route.sourceName} CREATE TABLE statements into the SQL editor on the left. The ${route.targetName} output appears instantly on the right panel in real-time as you type.`,
    },
    {
      q: 'Is my SQL schema data private?',
      a: 'Yes — completely. The entire conversion runs inside your browser using JavaScript. Your SQL is never sent to any server, logged, or stored anywhere. This makes it safe to use with production or confidential database schemas.',
    },
    {
      q: 'Which SQL dialects are supported?',
      a: 'PostgreSQL, MySQL, SQLite, SQL Server, Oracle, and MariaDB DDL syntax are all supported. The parser auto-detects the dialect from your CREATE TABLE syntax automatically.',
    },
    {
      q: 'Can I convert multiple tables at once?',
      a: 'Yes! Paste multiple CREATE TABLE statements separated by semicolons and all tables will be converted simultaneously, including cross-table foreign key relationships.',
    },
    {
      q: `Does this tool support nullable columns and constraints?`,
      a: `Yes. NULL, NOT NULL, DEFAULT values, PRIMARY KEY, UNIQUE, and FOREIGN KEY constraints are all parsed and reflected in the ${route.targetName} output. Nullable columns are correctly typed as optional properties or nullable types.`,
    },
    {
      q: 'Is SchemaForge free to use?',
      a: 'Yes, SchemaForge is completely free with no usage limits, no account required, and no rate limits. The tool runs entirely in your browser and will always be free.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <div
      className="min-h-screen bg-zinc-950 flex flex-col"
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Nav bar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-5 py-3 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors group">
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

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">100% Private — No Server Calls</span>
          <span className="sm:hidden">Private</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="text-center px-4 pt-10 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/40 text-zinc-400 text-xs font-medium mb-5">
          {route.category === 'generate' ? 'Code Generator' : 'SQL Converter'}
          <span className="text-zinc-600">•</span>
          Free Online Tool
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100 mb-4 leading-tight">
          Convert{' '}
          <span className="text-indigo-400">{route.sourceName}</span>{' '}
          to{' '}
          <span className="text-cyan-400">{route.targetName}</span>
        </h1>
        <p className="text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
          {route.description}
        </p>
      </div>

      {/* Workbench */}
      <div className="px-4 pb-6 max-w-[1600px] w-full mx-auto">
        <Workbench defaultSql={defaultSql} defaultTab={defaultTab} />
      </div>

      {/* FAQ */}
      <div className="px-4 pb-20 max-w-3xl w-full mx-auto">
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-800/60">
            <h2 className="text-xl font-bold text-zinc-100">Frequently Asked Questions</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Everything you need to know about converting {route.sourceName} to {route.targetName}.
            </p>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {faqItems.map((item, idx) => (
              <details key={idx} className="group px-6 py-4">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                  <h3 className="text-sm font-semibold text-zinc-200 group-open:text-indigo-300 transition-colors">
                    {item.q}
                  </h3>
                  <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0 group-open:rotate-180 transition-transform duration-200" />
                </summary>
                <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
