export interface SEORoute {
  category: 'convert' | 'generate';
  slug: string;
  sourceName: string;
  targetName: string;
  title: string;
  description: string;
}

const sources = [
  { id: 'postgres', name: 'PostgreSQL' },
  { id: 'mysql', name: 'MySQL' },
  { id: 'sqlite', name: 'SQLite' },
  { id: 'sql-server', name: 'SQL Server' },
  { id: 'oracle', name: 'Oracle' },
  { id: 'mariadb', name: 'MariaDB' }
];

const generateTargets = [
  { id: 'csharp-poco', name: 'C# POCO' },
  { id: 'typescript', name: 'TypeScript Interfaces' },
  { id: 'mock-json', name: 'Mock JSON Data' },
  { id: 'sql-inserts', name: 'SQL Insert Statements' },
  { id: 'python-dataclass', name: 'Python Dataclasses' },
  { id: 'java-entity', name: 'Java Entities' },
  { id: 'go-struct', name: 'Go Structs' }
];

const convertTargets = [
  { id: 'postgres', name: 'PostgreSQL' },
  { id: 'mysql', name: 'MySQL' },
  { id: 'sqlite', name: 'SQLite' },
  { id: 'sql-server', name: 'SQL Server' }
];

// Audit-specified exact copy for high-intent pages (title ≤60, desc ≤155)
const overrides: Record<string, { title: string; description: string }> = {
  // ── High-intent manually curated ──────────────────────────────────────────
  'convert/mysql-to-sql-server': {
    title: 'MySQL to SQL Server Converter — Free Online | SchemaForge',
    description: 'Convert MySQL CREATE TABLE scripts to SQL Server T-SQL instantly. Free, private, no upload — runs entirely in your browser.',
  },
  'convert/postgres-to-mysql': {
    title: 'PostgreSQL to MySQL Converter — Free Online | SchemaForge',
    description: 'Translate PostgreSQL DDL to MySQL in one click. Free online converter, 100% client-side — your schema never leaves your browser.',
  },
  'convert/oracle-to-postgres': {
    title: 'Oracle to PostgreSQL Converter — Free Online | SchemaForge',
    description: 'Convert Oracle CREATE TABLE scripts to PostgreSQL DDL instantly. Free, private, browser-based — no signup, no data upload.',
  },
  'convert/sqlite-to-postgres': {
    title: 'SQLite to PostgreSQL Converter — Free Online | SchemaForge',
    description: 'Migrate SQLite schemas to PostgreSQL in seconds. Free online DDL converter — private, client-side, no account needed.',
  },
  'generate/postgres-to-typescript': {
    title: 'PostgreSQL to TypeScript Interface Generator | SchemaForge',
    description: 'Paste PostgreSQL CREATE TABLE scripts, get TypeScript interfaces instantly. Nullable-aware, FK-aware, 100% private & free.',
  },
  'generate/mysql-to-typescript': {
    title: 'MySQL to TypeScript Interface Generator | SchemaForge',
    description: 'Generate TypeScript interfaces from MySQL schemas in real time. Free, browser-only, zero data transmission.',
  },
  'generate/mariadb-to-python-dataclass': {
    title: 'MariaDB to Python Dataclass Generator | SchemaForge',
    description: 'Turn MariaDB CREATE TABLE scripts into Python dataclasses instantly. Free, private, runs fully in your browser.',
  },
  'generate/postgres-to-mock-json': {
    title: 'PostgreSQL Mock JSON Data Generator | SchemaForge',
    description: 'Generate realistic mock JSON rows from PostgreSQL schemas. Faker-powered, free, and 100% in-browser — nothing is uploaded.',
  },
  'generate/oracle-to-java-entity': {
    title: 'Oracle to Java Entity (JPA) Generator | SchemaForge',
    description: 'Convert Oracle CREATE TABLE scripts to Java entity classes with JPA annotations. Free, private, runs in your browser.',
  },
  // ── Auto-generated titles that exceed 60 chars — shortened overrides ──────
  'generate/postgres-to-sql-inserts': {
    title: 'PostgreSQL SQL Insert Generator — Free | SchemaForge',
    description: 'Instantly generate SQL INSERT statements from PostgreSQL CREATE TABLE scripts. Free, private, runs entirely in your browser.',
  },
  'generate/postgres-to-python-dataclass': {
    title: 'PostgreSQL to Python Dataclass Generator | SchemaForge',
    description: 'Instantly generate Python dataclasses from PostgreSQL CREATE TABLE scripts. Free, private, runs entirely in your browser.',
  },
  'convert/postgres-to-sql-server': {
    title: 'PostgreSQL to SQL Server Converter — Free | SchemaForge',
    description: 'Convert PostgreSQL CREATE TABLE scripts to SQL Server T-SQL instantly. Free, private, browser-based — no signup, no upload.',
  },
  'generate/mysql-to-sql-inserts': {
    title: 'MySQL SQL Insert Statement Generator | SchemaForge',
    description: 'Instantly generate SQL INSERT statements from MySQL CREATE TABLE scripts. Free, private, runs entirely in your browser.',
  },
  'generate/sqlite-to-typescript': {
    title: 'SQLite to TypeScript Interface Generator | SchemaForge',
    description: 'Instantly generate TypeScript interfaces from SQLite CREATE TABLE scripts. Free, private, runs entirely in your browser.',
  },
  'generate/sqlite-to-sql-inserts': {
    title: 'SQLite SQL Insert Statement Generator | SchemaForge',
    description: 'Instantly generate SQL INSERT statements from SQLite CREATE TABLE scripts. Free, private, runs entirely in your browser.',
  },
  'generate/sql-server-to-typescript': {
    title: 'SQL Server to TypeScript Generator — Free | SchemaForge',
    description: 'Instantly generate TypeScript interfaces from SQL Server CREATE TABLE scripts. Free, private, runs entirely in your browser.',
  },
  'generate/sql-server-to-sql-inserts': {
    title: 'SQL Server SQL Insert Generator — Free | SchemaForge',
    description: 'Instantly generate SQL INSERT statements from SQL Server CREATE TABLE scripts. Free, private, runs entirely in your browser.',
  },
  'generate/sql-server-to-python-dataclass': {
    title: 'SQL Server to Python Dataclass Generator | SchemaForge',
    description: 'Instantly generate Python dataclasses from SQL Server CREATE TABLE scripts. Free, private, runs entirely in your browser.',
  },
  'convert/sql-server-to-postgres': {
    title: 'SQL Server to PostgreSQL Converter — Free | SchemaForge',
    description: 'Convert SQL Server CREATE TABLE scripts to PostgreSQL DDL instantly. Free, private, browser-based — no signup, no upload.',
  },
  'generate/oracle-to-typescript': {
    title: 'Oracle to TypeScript Interface Generator | SchemaForge',
    description: 'Instantly generate TypeScript interfaces from Oracle CREATE TABLE scripts. Free, private, runs entirely in your browser.',
  },
  'generate/oracle-to-sql-inserts': {
    title: 'Oracle SQL Insert Statement Generator | SchemaForge',
    description: 'Instantly generate SQL INSERT statements from Oracle CREATE TABLE scripts. Free, private, runs entirely in your browser.',
  },
  'generate/mariadb-to-typescript': {
    title: 'MariaDB to TypeScript Interface Generator | SchemaForge',
    description: 'Instantly generate TypeScript interfaces from MariaDB CREATE TABLE scripts. Free, private, runs entirely in your browser.',
  },
  'generate/mariadb-to-sql-inserts': {
    title: 'MariaDB SQL Insert Statement Generator | SchemaForge',
    description: 'Instantly generate SQL INSERT statements from MariaDB CREATE TABLE scripts. Free, private, runs entirely in your browser.',
  },
};

function buildRoute(
  category: 'convert' | 'generate',
  slug: string,
  srcName: string,
  tgtName: string,
  defaultTitle: string,
  defaultDescription: string,
): SEORoute {
  const key = `${category}/${slug}`;
  const ov = overrides[key];
  return {
    category,
    slug,
    sourceName: srcName,
    targetName: tgtName,
    title: ov?.title ?? defaultTitle,
    description: ov?.description ?? defaultDescription,
  };
}

const routes: SEORoute[] = [];

// Generate Routes
for (const src of sources) {
  for (const tgt of generateTargets) {
    const slug = `${src.id}-to-${tgt.id}`;
    routes.push(buildRoute(
      'generate',
      slug,
      src.name,
      tgt.name,
      `${src.name} to ${tgt.name} Generator — Free | SchemaForge`,
      `Instantly generate ${tgt.name} from ${src.name} CREATE TABLE scripts. Free, private, runs entirely in your browser — no signup, no data upload.`,
    ));
  }

  for (const tgt of convertTargets) {
    if (src.id === tgt.id) continue;
    const slug = `${src.id}-to-${tgt.id}`;
    routes.push(buildRoute(
      'convert',
      slug,
      src.name,
      tgt.name,
      `${src.name} to ${tgt.name} Converter — Free Online | SchemaForge`,
      `Convert ${src.name} CREATE TABLE scripts to ${tgt.name} DDL instantly. Free, private, browser-based — no signup, no data upload.`,
    ));
  }
}

export const seoRoutes = routes;
