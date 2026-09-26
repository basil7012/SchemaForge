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

const routes: SEORoute[] = [];

// Generate Routes
for (const src of sources) {
  for (const tgt of generateTargets) {
    routes.push({
      category: 'generate',
      slug: `${src.id}-to-${tgt.id}`,
      sourceName: src.name,
      targetName: tgt.name,
      title: `Convert ${src.name} Schema to ${tgt.name} Online - Free & Private`,
      description: `Instantly convert your ${src.name} CREATE TABLE scripts to ${tgt.name}. 100% free, private, and runs entirely in your browser with zero server data transmission.`
    });
  }
  
  for (const tgt of convertTargets) {
    if (src.id === tgt.id) continue;
    routes.push({
      category: 'convert',
      slug: `${src.id}-to-${tgt.id}`,
      sourceName: src.name,
      targetName: tgt.name,
      title: `Convert ${src.name} to ${tgt.name} Schema Online - Free & Private`,
      description: `Instantly translate ${src.name} DDL scripts into ${tgt.name} compatible tables. Free, private, client-side SQL conversion tool.`
    });
  }
}

export const seoRoutes = routes;
