import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { seoRoutes } from '@/lib/seo-routes';
import { getTypeMappings } from '@/lib/type-mappings';
import Workbench from '@/components/Workbench';
import { ArrowLeft, Database, ShieldCheck, ChevronDown, ArrowRight } from 'lucide-react';

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
    twitter: {
      card: 'summary_large_image',
      title: route.title,
      description: route.description,
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

  // JSON-LD: FAQPage
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  // JSON-LD: BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'SchemaForge',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: route.category === 'convert' ? 'SQL Converters' : 'Code Generators',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${route.sourceName} to ${route.targetName} ${route.category === 'generate' ? 'Generator' : 'Converter'}`,
        item: `${SITE_URL}/${route.category}/${route.slug}`,
      },
    ],
  };

  // JSON-LD: SoftwareApplication
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${route.sourceName} to ${route.targetName} ${route.category === 'generate' ? 'Generator' : 'Converter'}`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: route.description,
    url: `${SITE_URL}/${route.category}/${route.slug}`,
  };

  // Related routes for internal linking (same category, different slug, limit 6)
  const relatedRoutes = seoRoutes
    .filter((r) => r.category === route.category && r.slug !== route.slug)
    .slice(0, 6);

  return (
    <div
      className="min-h-screen bg-zinc-950 flex flex-col"
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      {/* Nav bar */}
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

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">100% Private — No Server Calls</span>
          <span className="sm:hidden">Private</span>
        </div>
      </nav>

      {/* Breadcrumb — visible to users and crawlers */}
      <nav aria-label="Breadcrumb" className="px-5 pt-4 pb-1 max-w-[1600px] w-full mx-auto">
        <ol className="flex items-center gap-1.5 text-xs text-zinc-600">
          <li><Link href="/" className="hover:text-zinc-400 transition-colors">SchemaForge</Link></li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/`}
              className="hover:text-zinc-400 transition-colors capitalize"
            >
              {route.category === 'convert' ? 'SQL Converters' : 'Code Generators'}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-zinc-400 truncate max-w-[200px]">{route.title.split(' — ')[0].split(' | ')[0]}</li>
        </ol>
      </nav>

      {/* Hero */}
      <div className="text-center px-4 pt-6 pb-4">
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
        {/* 50+ word intro text — P1 SEO fix: crawlers see prose before the tool UI */}
        <p className="text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          {route.category === 'generate'
            ? <>This free online {route.sourceName} to {route.targetName} generator turns your <code className="text-indigo-400 bg-indigo-950/60 px-1 rounded text-sm">CREATE TABLE</code> DDL statements into ready-to-use {route.targetName} instantly — with no server upload, no account, and no rate limits. Simply paste your {route.sourceName} schema on the left and the generated {route.targetName} code appears on the right in real time. All processing runs entirely in your browser using client-side JavaScript, keeping your database schema 100% private.</>
            : <>This free online {route.sourceName} to {route.targetName} SQL converter translates your <code className="text-indigo-400 bg-indigo-950/60 px-1 rounded text-sm">CREATE TABLE</code> DDL scripts between dialects instantly — with no server upload, no account, and no rate limits. Paste your {route.sourceName} schema on the left and the converted {route.targetName} DDL appears on the right in real time. All conversion logic runs entirely in your browser, keeping your database schema 100% private and secure.</>
          }
        </p>
      </div>

      {/* Workbench */}
      <div className="px-4 pb-6 max-w-[1600px] w-full mx-auto">
        <Workbench defaultSql={defaultSql} defaultTab={defaultTab} />
      </div>

      {/* Type Mapping Table — unique per page, critical for SEO content differentiation */}
      {(() => {
        const mappings = getTypeMappings(route.category, route.slug);
        if (!mappings || mappings.length === 0) return null;
        const isGenerate = route.category === 'generate';
        const sourceLabel = route.sourceName + ' Type';
        const targetLabel = isGenerate ? route.targetName + ' Type' : route.targetName + ' Equivalent';
        return (
          <div className="px-4 pb-10 max-w-4xl w-full mx-auto">
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-zinc-800/60">
                <h2 className="text-xl font-bold text-zinc-100">
                  {route.sourceName} → {route.targetName} Type Reference
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  {isGenerate
                    ? `Complete type mapping from ${route.sourceName} SQL column types to ${route.targetName} — including nullability, constraints, and gotchas.`
                    : `How ${route.sourceName} column types map to their ${route.targetName} equivalents, with migration notes for each type.`
                  }
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800/60 bg-zinc-900/60">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider w-2/5">
                        {sourceLabel}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider w-2/5">
                        {targetLabel}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {mappings.map((row, i) => (
                      <tr key={i} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-3 font-mono text-xs text-indigo-300 align-top">
                          {row.sourceType}
                        </td>
                        <td className="px-6 py-3 font-mono text-xs text-cyan-300 align-top">
                          {row.targetType}
                        </td>
                        <td className="px-6 py-3 text-xs text-zinc-500 align-top">
                          {row.notes ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* FAQ */}
      <div className="px-4 pb-10 max-w-3xl w-full mx-auto">
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

      {/* Related Tools — internal linking for SEO crawl depth */}
      {relatedRoutes.length > 0 && (
        <div className="px-4 pb-16 max-w-3xl w-full mx-auto">
          <h2 className="text-base font-semibold text-zinc-300 mb-3">
            Related {route.category === 'convert' ? 'SQL Converters' : 'Code Generators'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {relatedRoutes.map((r) => (
              <Link
                key={r.slug}
                href={`/${r.category}/${r.slug}`}
                className="flex items-center justify-between gap-2 px-3 py-2.5 bg-zinc-900/40 border border-zinc-800/60 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-200 group"
              >
                <span>{r.sourceName} → {r.targetName}</span>
                <ArrowRight className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
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
            <Link href="/convert/postgres-to-mysql" className="hover:text-zinc-300 transition-colors">SQL Converters</Link>
            <Link href="/generate/postgres-to-csharp-poco" className="hover:text-zinc-300 transition-colors">Code Generators</Link>
            <Link href="/sitemap.xml" className="hover:text-zinc-300 transition-colors">Sitemap</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
