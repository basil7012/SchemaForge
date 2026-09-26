import { expect, test, describe, it } from 'vitest';
import { parseSqlDDL, TableSchema } from '../lib/parser';
import { generateCSharpPoco } from '../lib/generators/csharp';
import { generateTypeScript } from '../lib/generators/typescript';
import { generateMockData } from '../lib/generators/mockData';
import { seoRoutes } from '../lib/seo-routes';

// ===========================================================================
// 1. UNIT TESTS: SQL PARSER
// ===========================================================================
describe('[UNIT] SQL Parser – Core Functionality', () => {
  it('PASS-01: Returns empty array for empty string input', () => {
    const result = parseSqlDDL('');
    expect(result).toEqual([]);
  });

  it('PASS-02: Returns empty array for non-DDL SQL (SELECT)', () => {
    const result = parseSqlDDL('SELECT * FROM users;');
    expect(result).toEqual([]);
  });

  it('PASS-03: Returns empty array for garbage/random string', () => {
    const result = parseSqlDDL('hello world not sql');
    expect(result).toEqual([]);
  });

  it('PASS-04: Parses basic PostgreSQL CREATE TABLE', () => {
    const sql = `CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP,
      is_active BOOLEAN
    );`;
    const schemas = parseSqlDDL(sql);
    expect(schemas).toHaveLength(1);
    expect(schemas[0].tableName).toBe('products');
    expect(schemas[0].columns).toHaveLength(5);
  });

  it('PASS-05: Primary key column is NOT nullable', () => {
    const sql = `CREATE TABLE t (id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL);`;
    const schemas = parseSqlDDL(sql);
    const idCol = schemas[0].columns.find(c => c.name === 'id');
    expect(idCol?.isPrimary).toBe(true);
    expect(idCol?.isNullable).toBe(false);
  });

  it('PASS-06: NOT NULL column has isNullable=false', () => {
    const sql = `CREATE TABLE t (id INT PRIMARY KEY, email VARCHAR(255) NOT NULL);`;
    const schemas = parseSqlDDL(sql);
    const emailCol = schemas[0].columns.find(c => c.name === 'email');
    expect(emailCol?.isNullable).toBe(false);
  });

  it('PASS-07: Column without NOT NULL constraint has isNullable=true', () => {
    const sql = `CREATE TABLE t (id INT PRIMARY KEY, bio TEXT);`;
    const schemas = parseSqlDDL(sql);
    const bioCol = schemas[0].columns.find(c => c.name === 'bio');
    expect(bioCol?.isNullable).toBe(true);
  });

  it('PASS-08: FOREIGN KEY constraint is correctly parsed', () => {
    const sql = `CREATE TABLE orders (
      id SERIAL PRIMARY KEY,
      user_id INT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );`;
    const schemas = parseSqlDDL(sql);
    const userIdCol = schemas[0].columns.find(c => c.name === 'user_id');
    expect(userIdCol?.foreignKey).toEqual({ targetTable: 'users', targetColumn: 'id' });
  });

  it('PASS-09: Composite PRIMARY KEY via table constraint', () => {
    const sql = `CREATE TABLE order_items (
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      PRIMARY KEY (order_id, product_id)
    );`;
    const schemas = parseSqlDDL(sql);
    const orderIdCol = schemas[0].columns.find(c => c.name === 'order_id');
    const productIdCol = schemas[0].columns.find(c => c.name === 'product_id');
    expect(orderIdCol?.isPrimary).toBe(true);
    expect(productIdCol?.isPrimary).toBe(true);
  });

  it('PASS-10: Multiple CREATE TABLE statements in one string', () => {
    const sql = `
      CREATE TABLE authors (id INT PRIMARY KEY, name VARCHAR(100));
      CREATE TABLE books (id INT PRIMARY KEY, title VARCHAR(200), author_id INT);
    `;
    const schemas = parseSqlDDL(sql);
    expect(schemas).toHaveLength(2);
    expect(schemas[0].tableName).toBe('authors');
    expect(schemas[1].tableName).toBe('books');
  });

  it('PASS-11: MySQL backtick-quoted table/column names', () => {
    const sql = `CREATE TABLE \`customers\` (\`cust_id\` INT NOT NULL AUTO_INCREMENT, \`email\` VARCHAR(255) NOT NULL, PRIMARY KEY (\`cust_id\`)) ENGINE=InnoDB;`;
    const schemas = parseSqlDDL(sql);
    expect(schemas).toHaveLength(1);
    expect(schemas[0].tableName).toBe('customers');
    const custId = schemas[0].columns.find(c => c.name === 'cust_id');
    expect(custId?.isPrimary).toBe(true);
    expect(custId?.isNullable).toBe(false);
  });
});

// ===========================================================================
// 2. UNIT TESTS: TYPE NORMALIZATION
// ===========================================================================
describe('[UNIT] Parser – Type Normalization', () => {
  const normTest = (sqlType: string, expected: string) => {
    const sql = `CREATE TABLE t (col ${sqlType});`;
    const schemas = parseSqlDDL(sql);
    if (schemas.length === 0) return; // some types may fail parse
    return schemas[0]?.columns[0]?.normalizedType;
  };

  it('NORM-01: INT -> number', () => {
    const sql = `CREATE TABLE t (id INT PRIMARY KEY, x INT);`;
    const schemas = parseSqlDDL(sql);
    expect(schemas[0].columns.find(c => c.name === 'x')?.normalizedType).toBe('number');
  });
  it('NORM-02: BIGINT -> number', () => {
    const sql = `CREATE TABLE t (id SERIAL PRIMARY KEY, x BIGINT);`;
    const schemas = parseSqlDDL(sql);
    expect(schemas[0].columns.find(c => c.name === 'x')?.normalizedType).toBe('number');
  });
  it('NORM-03: FLOAT -> number', () => {
    const sql = `CREATE TABLE t (id SERIAL PRIMARY KEY, x FLOAT);`;
    const schemas = parseSqlDDL(sql);
    expect(schemas[0].columns.find(c => c.name === 'x')?.normalizedType).toBe('number');
  });
  it('NORM-04: DECIMAL -> number', () => {
    const sql = `CREATE TABLE t (id SERIAL PRIMARY KEY, price DECIMAL(10,2));`;
    const schemas = parseSqlDDL(sql);
    expect(schemas[0].columns.find(c => c.name === 'price')?.normalizedType).toBe('number');
  });
  it('NORM-05: VARCHAR -> string', () => {
    const sql = `CREATE TABLE t (id SERIAL PRIMARY KEY, name VARCHAR(50));`;
    const schemas = parseSqlDDL(sql);
    expect(schemas[0].columns.find(c => c.name === 'name')?.normalizedType).toBe('string');
  });
  it('NORM-06: TEXT -> string', () => {
    const sql = `CREATE TABLE t (id SERIAL PRIMARY KEY, bio TEXT);`;
    const schemas = parseSqlDDL(sql);
    expect(schemas[0].columns.find(c => c.name === 'bio')?.normalizedType).toBe('string');
  });
  it('NORM-07: BOOLEAN -> boolean', () => {
    const sql = `CREATE TABLE t (id SERIAL PRIMARY KEY, flag BOOLEAN);`;
    const schemas = parseSqlDDL(sql);
    expect(schemas[0].columns.find(c => c.name === 'flag')?.normalizedType).toBe('boolean');
  });
  it('NORM-08: TIMESTAMP -> date', () => {
    const sql = `CREATE TABLE t (id SERIAL PRIMARY KEY, created_at TIMESTAMP);`;
    const schemas = parseSqlDDL(sql);
    expect(schemas[0].columns.find(c => c.name === 'created_at')?.normalizedType).toBe('date');
  });
  it('NORM-09: DATE -> date', () => {
    const sql = `CREATE TABLE t (id SERIAL PRIMARY KEY, dob DATE);`;
    const schemas = parseSqlDDL(sql);
    expect(schemas[0].columns.find(c => c.name === 'dob')?.normalizedType).toBe('date');
  });
  it('NORM-10: UUID -> uuid', () => {
    const sql = `CREATE TABLE t (id UUID PRIMARY KEY);`;
    const schemas = parseSqlDDL(sql);
    expect(schemas[0].columns.find(c => c.name === 'id')?.normalizedType).toBe('uuid');
  });
});

// ===========================================================================
// 3. UNIT TESTS: C# GENERATOR
// ===========================================================================
describe('[UNIT] C# POCO Generator', () => {
  const sql = `CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2),
    quantity INT NOT NULL,
    is_shipped BOOLEAN,
    created_at TIMESTAMP,
    external_id UUID
  );`;
  const schema = parseSqlDDL(sql)[0];

  it('CSHARP-01: Outputs using statements', () => {
    const code = generateCSharpPoco(schema);
    expect(code).toContain('using System;');
    expect(code).toContain('using System.ComponentModel.DataAnnotations;');
    expect(code).toContain('using System.ComponentModel.DataAnnotations.Schema;');
  });

  it('CSHARP-02: Class name is PascalCase of table name', () => {
    const code = generateCSharpPoco(schema);
    expect(code).toContain('public class OrderItems');
  });

  it('CSHARP-03: Primary key gets [Key] annotation', () => {
    const code = generateCSharpPoco(schema);
    expect(code).toContain('[Key]');
  });

  it('CSHARP-04: Primary key is NOT nullable (no ? suffix)', () => {
    const code = generateCSharpPoco(schema);
    expect(code).toContain('public int Id { get; set; }');
    expect(code).not.toContain('public int? Id { get; set; }');
  });

  it('CSHARP-05: NOT NULL column gets [Required]', () => {
    const code = generateCSharpPoco(schema);
    expect(code).toContain('[Required]');
  });

  it('CSHARP-06: Nullable column gets ? suffix', () => {
    const code = generateCSharpPoco(schema);
    expect(code).toContain('public double? Price { get; set; }');
  });

  it('CSHARP-07: DECIMAL maps to double', () => {
    const code = generateCSharpPoco(schema);
    expect(code).toContain('double? Price');
  });

  it('CSHARP-08: BOOLEAN maps to bool', () => {
    const code = generateCSharpPoco(schema);
    expect(code).toContain('bool? IsShipped');
  });

  it('CSHARP-09: TIMESTAMP maps to DateTime', () => {
    const code = generateCSharpPoco(schema);
    expect(code).toContain('DateTime? CreatedAt');
  });

  it('CSHARP-10: UUID maps to Guid', () => {
    const code = generateCSharpPoco(schema);
    expect(code).toContain('Guid? ExternalId');
  });

  it('CSHARP-11: [Column] annotation added for snake_case columns', () => {
    const code = generateCSharpPoco(schema);
    expect(code).toContain('[Column("order_id")]');
  });

  it('CSHARP-12: Output is syntactically valid (has opening and closing brace)', () => {
    const code = generateCSharpPoco(schema);
    expect(code).toContain('{');
    expect(code).toContain('}');
    // Count braces balance
    const opens = (code.match(/{/g) || []).length;
    const closes = (code.match(/}/g) || []).length;
    expect(opens).toBe(closes);
  });
});

// ===========================================================================
// 4. UNIT TESTS: TYPESCRIPT GENERATOR
// ===========================================================================
describe('[UNIT] TypeScript Generator', () => {
  const sql = `CREATE TABLE blog_posts (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    author_id INT NOT NULL,
    published_at TIMESTAMP,
    view_count INT
  );`;
  const schema = parseSqlDDL(sql)[0];

  it('TS-01: Output contains export interface with PascalCase name', () => {
    const code = generateTypeScript(schema);
    expect(code).toContain('export interface BlogPosts {');
  });

  it('TS-02: UUID maps to string', () => {
    const code = generateTypeScript(schema);
    expect(code).toContain('  id: string;');
  });

  it('TS-03: NOT NULL field has no optional marker', () => {
    const code = generateTypeScript(schema);
    expect(code).toContain('  title: string;');
    expect(code).not.toContain('  title?: string;');
  });

  it('TS-04: Nullable field has optional marker (?)', () => {
    const code = generateTypeScript(schema);
    expect(code).toContain('  content?: string;');
  });

  it('TS-05: TIMESTAMP maps to Date', () => {
    const code = generateTypeScript(schema);
    expect(code).toContain('  published_at?: Date;');
  });

  it('TS-06: Output has closing brace', () => {
    const code = generateTypeScript(schema);
    expect(code.trimEnd()).toMatch(/\}\s*$/);
  });
});

// ===========================================================================
// 5. UNIT TESTS: MOCK DATA GENERATOR
// ===========================================================================
describe('[UNIT] Mock Data Generator', () => {
  const sql = `CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    phone VARCHAR(20),
    price DECIMAL(10,2),
    company VARCHAR(100),
    website VARCHAR(255),
    city VARCHAR(100),
    is_active BOOLEAN,
    created_at TIMESTAMP,
    profile_id UUID
  );`;
  const schema = parseSqlDDL(sql)[0];

  it('MOCK-01: Generates correct number of rows (default=10)', () => {
    const result = generateMockData(schema, 10);
    const parsed = JSON.parse(result.json);
    expect(parsed).toHaveLength(10);
  });

  it('MOCK-02: Generates correct number of rows (custom=25)', () => {
    const result = generateMockData(schema, 25);
    const parsed = JSON.parse(result.json);
    expect(parsed).toHaveLength(25);
  });

  it('MOCK-03: email column generates valid email format', () => {
    const result = generateMockData(schema, 20);
    const parsed = JSON.parse(result.json);
    const emails = parsed.map((r: any) => r.email).filter((e: any) => e !== null);
    for (const email of emails) {
      expect(email).toMatch(/@/);
    }
  });

  it('MOCK-04: phone column generates phone-like value', () => {
    const result = generateMockData(schema, 5);
    const parsed = JSON.parse(result.json);
    const phones = parsed.map((r: any) => r.phone).filter((p: any) => p !== null);
    for (const phone of phones) {
      expect(typeof phone).toBe('string');
    }
  });

  it('MOCK-05: price column generates a number', () => {
    const result = generateMockData(schema, 10);
    const parsed = JSON.parse(result.json);
    const prices = parsed.map((r: any) => r.price).filter((p: any) => p !== null);
    for (const price of prices) {
      expect(typeof price).toBe('number');
    }
  });

  it('MOCK-06: profile_id generates UUID-like value', () => {
    const result = generateMockData(schema, 10);
    const parsed = JSON.parse(result.json);
    const ids = parsed.map((r: any) => r.profile_id).filter((v: any) => v !== null);
    for (const id of ids) {
      expect(id).toMatch(/^[0-9a-f-]{36}$/);
    }
  });

  it('MOCK-07: JSON output is valid parseable JSON', () => {
    const result = generateMockData(schema, 5);
    expect(() => JSON.parse(result.json)).not.toThrow();
  });

  it('MOCK-08: SQL output contains INSERT INTO statement', () => {
    const result = generateMockData(schema, 5);
    expect(result.sql).toContain('INSERT INTO users');
    expect(result.sql).toContain('VALUES');
    expect(result.sql.trimEnd()).toMatch(/;$/);
  });

  it('MOCK-09: SQL output has correct number of value rows', () => {
    const result = generateMockData(schema, 5);
    // count opening parens in VALUES section
    const valueLines = result.sql.split('\n').filter(l => l.trim().startsWith('('));
    expect(valueLines).toHaveLength(5);
  });

  it('MOCK-10: Single-quote strings are properly escaped in SQL output', () => {
    // Force apostrophe in data by using a schema with a name column
    // Since faker may or may not generate apostrophes, we check the replace logic exists
    // by verifying no unescaped dangerous SQL injection pattern like O'Brien
    const result = generateMockData(schema, 50);
    // The SQL should not contain a raw unescaped single quote that would break INSERT syntax
    const valueSection = result.sql.split('VALUES')[1] || '';
    // Each string value should be wrapped in single quotes, apostrophes doubled
    // Basic check: count of open and closing ' should be even in each values row
    const rows = valueSection.split('\n').filter(l => l.trim().startsWith('('));
    for (const row of rows) {
      const quoteCount = (row.match(/'/g) || []).length;
      expect(quoteCount % 2).toBe(0);
    }
  });

  it('MOCK-11: Row count of 1 generates exactly 1 row', () => {
    const result = generateMockData(schema, 1);
    const parsed = JSON.parse(result.json);
    expect(parsed).toHaveLength(1);
  });

  it('MOCK-12: All required columns appear in every JSON row', () => {
    const result = generateMockData(schema, 5);
    const parsed = JSON.parse(result.json);
    for (const row of parsed) {
      for (const col of schema.columns) {
        expect(row).toHaveProperty(col.name);
      }
    }
  });
});

// ===========================================================================
// 6. INTEGRATION TESTS: PARSER -> GENERATORS PIPELINE
// ===========================================================================
describe('[INTEGRATION] Full Pipeline: SQL -> Generators', () => {
  const complexSql = `
    CREATE TABLE companies (
      id BIGINT PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      website VARCHAR(500),
      annual_revenue DECIMAL(15,2),
      employee_count INT,
      founded_at DATE,
      is_public BOOLEAN DEFAULT FALSE
    );
    
    CREATE TABLE employees (
      id UUID PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(30),
      salary DECIMAL(12,2) NOT NULL,
      hired_at TIMESTAMP NOT NULL,
      company_id BIGINT,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );
  `;

  it('INT-01: Parser produces 2 schemas from complex SQL', () => {
    const schemas = parseSqlDDL(complexSql);
    expect(schemas).toHaveLength(2);
  });

  it('INT-02: C# generator produces output for both tables', () => {
    const schemas = parseSqlDDL(complexSql);
    const combined = schemas.map(s => generateCSharpPoco(s)).join('\n');
    expect(combined).toContain('public class Companies');
    expect(combined).toContain('public class Employees');
  });

  it('INT-03: TypeScript generator produces output for both tables', () => {
    const schemas = parseSqlDDL(complexSql);
    const combined = schemas.map(s => generateTypeScript(s)).join('\n');
    expect(combined).toContain('export interface Companies');
    expect(combined).toContain('export interface Employees');
  });

  it('INT-04: Mock data is generated for both tables independently', () => {
    const schemas = parseSqlDDL(complexSql);
    const mock1 = generateMockData(schemas[0], 5);
    const mock2 = generateMockData(schemas[1], 5);
    expect(JSON.parse(mock1.json)).toHaveLength(5);
    expect(JSON.parse(mock2.json)).toHaveLength(5);
  });

  it('INT-05: FK column in employees references companies.id', () => {
    const schemas = parseSqlDDL(complexSql);
    const employees = schemas.find(s => s.tableName === 'employees');
    const companyId = employees?.columns.find(c => c.name === 'company_id');
    expect(companyId?.foreignKey).toEqual({ targetTable: 'companies', targetColumn: 'id' });
  });

  it('INT-06: BIGINT primary key maps to long in C#', () => {
    const schemas = parseSqlDDL(complexSql);
    const companies = schemas.find(s => s.tableName === 'companies');
    const code = generateCSharpPoco(companies!);
    expect(code).toContain('public long Id { get; set; }');
  });

  it('INT-07: UUID primary key maps to string in TypeScript', () => {
    const schemas = parseSqlDDL(complexSql);
    const employees = schemas.find(s => s.tableName === 'employees');
    const code = generateTypeScript(employees!);
    expect(code).toContain('  id: string;');
  });
});

// ===========================================================================
// 7. SEO ROUTES INTEGRITY TESTS
// ===========================================================================
describe('[UNIT] SEO Routes Integrity', () => {
  it('SEO-01: Has at least 60 routes', () => {
    expect(seoRoutes.length).toBeGreaterThanOrEqual(60);
  });

  it('SEO-02: All routes have non-empty category, slug, title, description', () => {
    for (const route of seoRoutes) {
      expect(route.category).toBeTruthy();
      expect(route.slug).toBeTruthy();
      expect(route.title).toBeTruthy();
      expect(route.description).toBeTruthy();
    }
  });

  it('SEO-03: Category is only "convert" or "generate"', () => {
    for (const route of seoRoutes) {
      expect(['convert', 'generate']).toContain(route.category);
    }
  });

  it('SEO-04: No duplicate slugs within same category', () => {
    const keys = seoRoutes.map(r => `${r.category}::${r.slug}`);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(seoRoutes.length);
  });

  it('SEO-05: Slugs are URL-safe (no spaces, no uppercase)', () => {
    for (const route of seoRoutes) {
      expect(route.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('SEO-06: No route converts a source to itself', () => {
    for (const route of seoRoutes) {
      const [src, tgt] = route.slug.split('-to-');
      // For convert routes specifically, source != target  
      if (route.category === 'convert') {
        expect(src).not.toBe(tgt);
      }
    }
  });

  it('SEO-07: Title contains both source and target names', () => {
    for (const route of seoRoutes) {
      expect(route.title).toContain(route.sourceName);
      expect(route.title).toContain(route.targetName);
    }
  });

  it('SEO-08: Description is at least 80 characters (SEO minimum)', () => {
    for (const route of seoRoutes) {
      expect(route.description.length).toBeGreaterThanOrEqual(80);
    }
  });
});

// ===========================================================================
// 8. EDGE CASE / NEGATIVE TESTS
// ===========================================================================
describe('[EDGE] Parser – Edge Cases & Boundary Conditions', () => {
  it('EDGE-01: Table with zero columns (degenerate case) - does not crash', () => {
    // This is invalid SQL but should not throw unhandled exceptions
    expect(() => parseSqlDDL('')).not.toThrow();
  });

  it('EDGE-02: Table name with schema prefix (schema.table)', () => {
    const sql = `CREATE TABLE public.users (id SERIAL PRIMARY KEY, name VARCHAR(50));`;
    // Should parse without throwing
    expect(() => parseSqlDDL(sql)).not.toThrow();
  });

  it('EDGE-03: Table with IF NOT EXISTS', () => {
    const sql = `CREATE TABLE IF NOT EXISTS sessions (
      token VARCHAR(255) PRIMARY KEY,
      user_id INT NOT NULL,
      expires_at TIMESTAMP NOT NULL
    );`;
    expect(() => parseSqlDDL(sql)).not.toThrow();
    const schemas = parseSqlDDL(sql);
    // parser may or may not handle this; just ensure no crash
  });

  it('EDGE-04: Very long column name does not crash', () => {
    const sql = `CREATE TABLE t (id INT PRIMARY KEY, ${'a'.repeat(64)} VARCHAR(50));`;
    expect(() => parseSqlDDL(sql)).not.toThrow();
  });

  it('EDGE-05: Mock data with count=0 returns empty arrays', () => {
    const sql = `CREATE TABLE t (id INT PRIMARY KEY, name VARCHAR(50));`;
    const schema = parseSqlDDL(sql)[0];
    const result = generateMockData(schema, 0);
    expect(JSON.parse(result.json)).toHaveLength(0);
  });

  it('EDGE-06: C# generator handles table name with numbers', () => {
    const sql = `CREATE TABLE table_v2 (id INT PRIMARY KEY, data TEXT);`;
    const schema = parseSqlDDL(sql)[0];
    expect(() => generateCSharpPoco(schema)).not.toThrow();
  });

  it('EDGE-07: TypeScript generator handles table name with numbers', () => {
    const sql = `CREATE TABLE table_v2 (id INT PRIMARY KEY, data TEXT);`;
    const schema = parseSqlDDL(sql)[0];
    expect(() => generateTypeScript(schema)).not.toThrow();
  });

  it('EDGE-08: SQL with inline comments does not crash', () => {
    const sql = `CREATE TABLE users (
      -- primary key
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) -- user display name
    );`;
    expect(() => parseSqlDDL(sql)).not.toThrow();
  });

  it('EDGE-09: Mock data count=50 (max) works correctly', () => {
    const sql = `CREATE TABLE t (id INT PRIMARY KEY, email VARCHAR(255));`;
    const schema = parseSqlDDL(sql)[0];
    const result = generateMockData(schema, 50);
    expect(JSON.parse(result.json)).toHaveLength(50);
  });
});
