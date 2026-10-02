import { Metadata } from 'next';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readingTimeMin: number;
  content: string; // HTML string
  relatedToolHref: string;
  relatedToolLabel: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-convert-postgresql-schema-to-csharp-models',
    title: 'How to Convert a PostgreSQL Schema to C# Models',
    description:
      'A step-by-step guide to mapping PostgreSQL CREATE TABLE DDL to C# POCO classes with Entity Framework annotations — including type mapping, nullability, primary keys, and foreign keys.',
    publishedAt: '2026-09-15',
    readingTimeMin: 7,
    relatedToolHref: '/generate/postgres-to-csharp-poco',
    relatedToolLabel: 'PostgreSQL → C# POCO Generator',
    content: `
<p>When you're building a .NET application on top of a PostgreSQL database, one of the most tedious tasks is manually writing C# POCO (Plain Old CLR Object) classes to match your database schema. Every time the schema changes, you risk your C# models going out of sync — leading to runtime errors and hard-to-track bugs.</p>

<p>This guide walks through the complete process of converting a PostgreSQL <code>CREATE TABLE</code> script into C# model classes with proper Entity Framework Core data annotations.</p>

<h2>Why Schema-to-Code Generation Matters</h2>

<p>Database schemas and application models are two representations of the same data. Keeping them in sync manually is error-prone and time-consuming. A schema-to-code converter eliminates this friction by:</p>
<ul>
  <li>Generating correct C# property types from SQL column types</li>
  <li>Mapping <code>NOT NULL</code> constraints to <code>[Required]</code> or non-nullable types</li>
  <li>Handling nullable columns as <code>Type?</code> (nullable reference types in C# 8+)</li>
  <li>Adding <code>[Key]</code>, <code>[Column]</code>, and <code>[MaxLength]</code> annotations automatically</li>
  <li>Representing foreign keys as navigation properties</li>
</ul>

<h2>PostgreSQL to C# Type Mapping</h2>

<p>The most important step is understanding how PostgreSQL types map to C# types. Here are the key mappings:</p>

<table>
  <thead><tr><th>PostgreSQL Type</th><th>C# Type</th><th>Notes</th></tr></thead>
  <tbody>
    <tr><td><code>SERIAL</code></td><td><code>int</code></td><td>[Key] [DatabaseGenerated(Identity)]</td></tr>
    <tr><td><code>BIGSERIAL</code></td><td><code>long</code></td><td>[Key] [DatabaseGenerated(Identity)]</td></tr>
    <tr><td><code>INTEGER</code></td><td><code>int</code></td><td></td></tr>
    <tr><td><code>BIGINT</code></td><td><code>long</code></td><td></td></tr>
    <tr><td><code>BOOLEAN</code></td><td><code>bool</code></td><td></td></tr>
    <tr><td><code>VARCHAR(n)</code></td><td><code>string</code></td><td>[MaxLength(n)]</td></tr>
    <tr><td><code>TEXT</code></td><td><code>string</code></td><td></td></tr>
    <tr><td><code>DECIMAL(p,s)</code></td><td><code>decimal</code></td><td>Use for money fields</td></tr>
    <tr><td><code>TIMESTAMP</code></td><td><code>DateTime</code></td><td></td></tr>
    <tr><td><code>TIMESTAMP WITH TIME ZONE</code></td><td><code>DateTimeOffset</code></td><td>Preserves tz offset</td></tr>
    <tr><td><code>DATE</code></td><td><code>DateOnly</code></td><td>.NET 6+</td></tr>
    <tr><td><code>UUID</code></td><td><code>Guid</code></td><td></td></tr>
    <tr><td><code>JSONB</code></td><td><code>string</code></td><td>[Column(TypeName="jsonb")]</td></tr>
    <tr><td><code>BYTEA</code></td><td><code>byte[]</code></td><td></td></tr>
  </tbody>
</table>

<h2>Example: Converting a PostgreSQL Schema</h2>

<p>Consider this PostgreSQL schema for a simple e-commerce application:</p>

<pre><code>CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);</code></pre>

<p>Here is the equivalent C# POCO class with Entity Framework annotations:</p>

<pre><code>using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("customers")]
public class Customer
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("first_name")]
    public string FirstName { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    [Column("last_name")]
    public string LastName { get; set; } = null!;

    [Required]
    [MaxLength(255)]
    [Column("email")]
    public string Email { get; set; } = null!;

    [MaxLength(30)]
    [Column("phone")]
    public string? Phone { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; }

    // Navigation property
    public ICollection&lt;Order&gt; Orders { get; set; } = [];
}

[Table("orders")]
public class Order
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("customer_id")]
    public int CustomerId { get; set; }

    [Required]
    [Column("total_amount")]
    public decimal TotalAmount { get; set; }

    [MaxLength(50)]
    [Column("status")]
    public string? Status { get; set; }

    [Column("ordered_at")]
    public DateTime OrderedAt { get; set; }

    // Navigation property
    [ForeignKey(nameof(CustomerId))]
    public Customer Customer { get; set; } = null!;
}</code></pre>

<h2>Key Rules When Mapping PostgreSQL to C#</h2>

<h3>1. Nullability</h3>
<p>PostgreSQL columns with <code>NOT NULL</code> constraints become required, non-nullable C# properties. Columns without <code>NOT NULL</code> become nullable types (<code>string?</code>, <code>int?</code>, <code>bool?</code>) when you enable C# 8+ nullable reference types — which you should always do in new projects.</p>

<h3>2. Primary Keys and Identity Columns</h3>
<p>A <code>SERIAL PRIMARY KEY</code> in PostgreSQL becomes an <code>int</code> with <code>[Key]</code> and <code>[DatabaseGenerated(DatabaseGeneratedOption.Identity)]</code> in C#. Use <code>long</code> for <code>BIGSERIAL</code>.</p>

<h3>3. Decimal vs Float</h3>
<p>Always use <code>decimal</code> (not <code>double</code> or <code>float</code>) for PostgreSQL <code>DECIMAL</code>, <code>NUMERIC</code>, or <code>MONEY</code> columns. The <code>decimal</code> type is exact and won't introduce floating-point rounding errors in financial calculations.</p>

<h3>4. DateTime vs DateTimeOffset</h3>
<p><code>TIMESTAMP</code> (without time zone) maps to <code>DateTime</code>. <code>TIMESTAMP WITH TIME ZONE</code> should map to <code>DateTimeOffset</code> to preserve the timezone offset. In .NET 6+, you can also use <code>DateOnly</code> for <code>DATE</code> columns.</p>

<h3>5. UUID to Guid</h3>
<p>PostgreSQL's <code>UUID</code> type maps directly to C#'s <code>Guid</code>. Entity Framework Core handles the conversion automatically.</p>

<h2>Automating the Conversion</h2>

<p>Instead of writing these classes by hand, use <strong>SchemaForge's free PostgreSQL to C# POCO generator</strong>. Paste your <code>CREATE TABLE</code> statements and get production-ready C# classes with all annotations instantly — in your browser, with zero data upload.</p>

<p>The tool handles:</p>
<ul>
  <li>All PostgreSQL column types → correct C# types</li>
  <li><code>NOT NULL</code> → <code>[Required]</code> attribute and non-nullable type</li>
  <li><code>PRIMARY KEY</code> → <code>[Key]</code> and <code>[DatabaseGenerated]</code></li>
  <li><code>VARCHAR(n)</code> → <code>[MaxLength(n)]</code></li>
  <li>Foreign keys → navigation properties</li>
  <li>Multiple tables in one paste</li>
</ul>
    `,
  },

  {
    slug: 'postgres-vs-mysql-ddl-differences',
    title: 'PostgreSQL vs MySQL: Key DDL Differences You Must Know Before Migrating',
    description:
      'A practical comparison of PostgreSQL and MySQL CREATE TABLE syntax differences — data types, auto-increment, boolean, JSON, UUID, and constraints — with a complete migration type mapping table.',
    publishedAt: '2026-09-20',
    readingTimeMin: 8,
    relatedToolHref: '/convert/postgres-to-mysql',
    relatedToolLabel: 'PostgreSQL → MySQL Converter',
    content: `
<p>Migrating a database from PostgreSQL to MySQL (or vice versa) is one of the most common database migration tasks. While both are relational databases with SQL syntax, there are significant differences in their DDL (Data Definition Language) that will cause syntax errors if you try to run PostgreSQL scripts directly in MySQL — or the other way around.</p>

<p>This guide covers the most important differences you need to know before migrating.</p>

<h2>Auto-Increment: SERIAL vs AUTO_INCREMENT</h2>

<p>The most common difference you'll hit immediately:</p>

<table>
  <thead><tr><th>PostgreSQL</th><th>MySQL</th></tr></thead>
  <tbody>
    <tr><td><code>SERIAL PRIMARY KEY</code></td><td><code>INT AUTO_INCREMENT PRIMARY KEY</code></td></tr>
    <tr><td><code>BIGSERIAL PRIMARY KEY</code></td><td><code>BIGINT AUTO_INCREMENT PRIMARY KEY</code></td></tr>
    <tr><td><code>SMALLSERIAL</code></td><td><code>SMALLINT AUTO_INCREMENT</code></td></tr>
  </tbody>
</table>

<p>PostgreSQL's <code>SERIAL</code> is a shorthand that creates an integer column with a default sequence. MySQL uses the <code>AUTO_INCREMENT</code> keyword appended to the column definition. You cannot use <code>SERIAL</code> in MySQL.</p>

<h2>Boolean: BOOLEAN vs TINYINT(1)</h2>

<p>PostgreSQL has a native <code>BOOLEAN</code> type that stores <code>TRUE</code>/<code>FALSE</code>/<code>NULL</code>. MySQL does not — it uses <code>TINYINT(1)</code> as a convention where 1 = true and 0 = false:</p>

<pre><code>-- PostgreSQL
is_active BOOLEAN DEFAULT TRUE

-- MySQL equivalent
is_active TINYINT(1) DEFAULT 1</code></pre>

<p>MySQL does accept <code>BOOLEAN</code> as a synonym for <code>TINYINT(1)</code>, but it stores values as 0/1. Your application code needs to handle this conversion.</p>

<h2>Text Types: TEXT vs LONGTEXT</h2>

<p>PostgreSQL's <code>TEXT</code> type has unlimited length. MySQL's <code>TEXT</code> is limited to 65,535 bytes. When migrating from PostgreSQL to MySQL, you should use <code>LONGTEXT</code> to preserve the unlimited nature of the column:</p>

<table>
  <thead><tr><th>PostgreSQL</th><th>MySQL</th><th>Max Length</th></tr></thead>
  <tbody>
    <tr><td><code>TEXT</code></td><td><code>LONGTEXT</code></td><td>4 GB</td></tr>
    <tr><td><code>VARCHAR(n)</code></td><td><code>VARCHAR(n)</code></td><td>65,535 bytes</td></tr>
    <tr><td>N/A</td><td><code>TINYTEXT</code></td><td>255 bytes</td></tr>
    <tr><td>N/A</td><td><code>MEDIUMTEXT</code></td><td>16 MB</td></tr>
  </tbody>
</table>

<h2>JSON: JSONB vs JSON</h2>

<p>PostgreSQL has two JSON types: <code>JSON</code> (stores text verbatim) and <code>JSONB</code> (stores binary-parsed JSON with indexing support). MySQL 5.7+ has a <code>JSON</code> type but nothing equivalent to JSONB:</p>

<pre><code>-- PostgreSQL
metadata JSONB,
data JSON

-- MySQL equivalent
metadata JSON,  -- No binary JSON or GIN index support
data JSON</code></pre>

<p>You lose PostgreSQL's GIN indexing on JSONB when migrating to MySQL. If you rely on <code>@&gt;</code> (contains), <code>?</code> (key exists), or other JSONB operators, you'll need to rewrite those queries.</p>

<h2>UUID: Native Type vs CHAR(36)</h2>

<p>PostgreSQL has a native <code>UUID</code> column type. MySQL (before 8.0) does not — the convention is to store UUIDs as <code>CHAR(36)</code> strings or <code>BINARY(16)</code> for efficiency:</p>

<pre><code>-- PostgreSQL
id UUID DEFAULT gen_random_uuid() PRIMARY KEY

-- MySQL (as CHAR)
id CHAR(36) DEFAULT (UUID()) PRIMARY KEY

-- MySQL (as BINARY — more efficient)
id BINARY(16) DEFAULT (UUID_TO_BIN(UUID())) PRIMARY KEY</code></pre>

<h2>Timestamps: TIMESTAMP vs DATETIME</h2>

<p>PostgreSQL's <code>TIMESTAMP WITH TIME ZONE</code> stores UTC and auto-converts to the session timezone. MySQL's <code>TIMESTAMP</code> also stores UTC but has a year-2038 problem (32-bit unix timestamp limit). For MySQL, prefer <code>DATETIME</code> for future-proof storage:</p>

<table>
  <thead><tr><th>PostgreSQL</th><th>MySQL Equivalent</th><th>Caveat</th></tr></thead>
  <tbody>
    <tr><td><code>TIMESTAMP</code></td><td><code>DATETIME</code></td><td>MySQL DATETIME has no timezone awareness</td></tr>
    <tr><td><code>TIMESTAMP WITH TIME ZONE</code></td><td><code>DATETIME</code></td><td>Store UTC explicitly; MySQL TIMESTAMP has 2038 limit</td></tr>
    <tr><td><code>DATE</code></td><td><code>DATE</code></td><td>Identical</td></tr>
    <tr><td><code>TIME</code></td><td><code>TIME</code></td><td>Identical</td></tr>
  </tbody>
</table>

<h2>BYTEA vs BLOB</h2>

<p>PostgreSQL stores binary data as <code>BYTEA</code>. MySQL uses <code>BLOB</code> (or <code>LONGBLOB</code> for large data):</p>

<pre><code>-- PostgreSQL
avatar BYTEA

-- MySQL
avatar LONGBLOB</code></pre>

<h2>ENUM Types</h2>

<p>Both PostgreSQL and MySQL support ENUM, but the syntax differs:</p>

<pre><code>-- PostgreSQL: create a type first (reusable)
CREATE TYPE status_type AS ENUM ('active', 'inactive', 'pending');
ALTER TABLE users ADD COLUMN status status_type;

-- MySQL: inline definition
status ENUM('active', 'inactive', 'pending')</code></pre>

<p>PostgreSQL's ENUM types are reusable objects. MySQL's ENUMs are defined inline per column. When migrating from MySQL to PostgreSQL, you'll need to extract all ENUM definitions into <code>CREATE TYPE</code> statements first.</p>

<h2>Double Quotes vs Backticks</h2>

<p>PostgreSQL uses double quotes to quote identifiers: <code>"column_name"</code>. MySQL uses backticks: <code>\`column_name\`</code>. If you have reserved words as column names, you'll need to replace the quoting characters when migrating.</p>

<h2>Quick Migration Checklist</h2>

<p>When converting PostgreSQL DDL to MySQL:</p>
<ol>
  <li>Replace <code>SERIAL</code> with <code>INT AUTO_INCREMENT</code></li>
  <li>Replace <code>BOOLEAN</code> with <code>TINYINT(1)</code></li>
  <li>Replace <code>TEXT</code> with <code>LONGTEXT</code></li>
  <li>Replace <code>JSONB</code> with <code>JSON</code></li>
  <li>Replace <code>UUID</code> with <code>CHAR(36)</code></li>
  <li>Replace <code>BYTEA</code> with <code>LONGBLOB</code></li>
  <li>Replace <code>TIMESTAMP WITH TIME ZONE</code> with <code>DATETIME</code></li>
  <li>Remove PostgreSQL-specific ENUM type definitions</li>
  <li>Replace double-quote identifiers with backtick identifiers</li>
  <li>Add <code>DEFAULT CHARSET=utf8mb4</code> to each table</li>
</ol>

<p>Use <strong>SchemaForge's free PostgreSQL to MySQL converter</strong> to handle all of these transformations automatically. Paste your PostgreSQL DDL and get MySQL-compatible syntax instantly — no upload, no account required.</p>
    `,
  },

  {
    slug: 'sql-to-typescript-complete-type-mapping-guide',
    title: 'SQL to TypeScript: The Complete Type Mapping Guide',
    description:
      'How to correctly map SQL column types from PostgreSQL, MySQL, and SQLite to TypeScript types — including nullable handling, dates, JSON, UUIDs, and arrays.',
    publishedAt: '2026-09-25',
    readingTimeMin: 9,
    relatedToolHref: '/generate/postgres-to-typescript',
    relatedToolLabel: 'SQL → TypeScript Interface Generator',
    content: `
<p>Writing TypeScript interfaces by hand from a SQL schema is tedious and error-prone. The tricky part isn't just mapping <code>VARCHAR</code> to <code>string</code> — it's handling nullability, dates, JSON columns, arrays, and foreign key relationships correctly.</p>

<p>This guide provides a complete reference for mapping SQL column types to TypeScript types across PostgreSQL, MySQL, and SQLite.</p>

<h2>The Fundamental Mapping</h2>

<p>At the highest level, SQL types map to TypeScript types in these broad categories:</p>

<table>
  <thead><tr><th>SQL Category</th><th>TypeScript Type</th></tr></thead>
  <tbody>
    <tr><td>Integer columns</td><td><code>number</code></td></tr>
    <tr><td>Floating-point columns</td><td><code>number</code></td></tr>
    <tr><td>String / text columns</td><td><code>string</code></td></tr>
    <tr><td>Boolean columns</td><td><code>boolean</code></td></tr>
    <tr><td>Timestamp / datetime columns</td><td><code>Date</code> or <code>string</code></td></tr>
    <tr><td>UUID columns</td><td><code>string</code></td></tr>
    <tr><td>JSON / JSONB columns</td><td><code>Record&lt;string, unknown&gt;</code></td></tr>
    <tr><td>Binary data (BYTEA, BLOB)</td><td><code>Buffer</code> or <code>Uint8Array</code></td></tr>
    <tr><td>Array columns (PostgreSQL)</td><td><code>Type[]</code></td></tr>
  </tbody>
</table>

<h2>PostgreSQL Type Mappings</h2>

<p>PostgreSQL has the richest type system of any open-source database. Here are the important mappings:</p>

<h3>Integer Types</h3>
<pre><code>-- PostgreSQL
id SERIAL PRIMARY KEY           → id: number
user_id INTEGER NOT NULL        → userId: number
big_counter BIGINT              → bigCounter: number   // Use bigint for > 2^53
small_num SMALLINT              → smallNum: number</code></pre>

<p>Note: PostgreSQL's <code>BIGINT</code> can hold values larger than JavaScript's safe integer limit (<code>Number.MAX_SAFE_INTEGER = 2^53 - 1</code>). If your BIGINT columns could hold values exceeding this, consider using TypeScript's <code>bigint</code> type instead of <code>number</code>.</p>

<h3>String Types</h3>
<pre><code>name VARCHAR(100) NOT NULL      → name: string
bio TEXT                        → bio: string | null
code CHAR(5)                    → code: string</code></pre>

<h3>Boolean</h3>
<pre><code>is_active BOOLEAN DEFAULT TRUE  → isActive: boolean
deleted BOOLEAN                 → deleted: boolean | null</code></pre>

<h3>Dates and Times</h3>
<p>This is where it gets nuanced. When data comes from a PostgreSQL database through a Node.js driver like <code>pg</code>, dates are typically already parsed to JavaScript <code>Date</code> objects. When data comes through an HTTP API (JSON), dates are ISO 8601 strings:</p>

<pre><code>created_at TIMESTAMP            → createdAt: Date    // Direct DB connection
created_at TIMESTAMP            → createdAt: string  // Via REST API (JSON)
updated_at TIMESTAMPTZ          → updatedAt: Date    // Timezone preserved
birth_date DATE                 → birthDate: string  // 'YYYY-MM-DD' string
start_time TIME                 → startTime: string  // 'HH:MM:SS' string</code></pre>

<p>The safest approach is to define both and use the one that matches your data layer:</p>
<pre><code>interface User {
  createdAt: Date;    // When using pg/postgres.js directly
  // or
  createdAt: string;  // When receiving from a REST API
}</code></pre>

<h3>UUID</h3>
<pre><code>id UUID DEFAULT gen_random_uuid() → id: string</code></pre>

<p>PostgreSQL UUIDs are stored as 16 bytes internally but exposed as 36-character hyphenated strings (<code>a1b2c3d4-e5f6-...</code>) in all drivers. Always type them as <code>string</code> in TypeScript.</p>

<h3>JSON and JSONB</h3>
<pre><code>settings JSONB                  → settings: Record&lt;string, unknown&gt;
metadata JSON                   → metadata: Record&lt;string, unknown&gt;</code></pre>

<p>For JSON columns with known shapes, define a specific interface:</p>
<pre><code>interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

interface User {
  settings: UserSettings;
}</code></pre>

<h3>Arrays</h3>
<pre><code>tags TEXT[]                     → tags: string[]
scores INTEGER[]                → scores: number[]
flags BOOLEAN[]                 → flags: boolean[]</code></pre>

<h2>Handling Nullability Correctly</h2>

<p>This is the most important distinction. SQL has three states for a column:</p>
<ol>
  <li><strong><code>NOT NULL</code></strong> — column will always have a value</li>
  <li><strong>No constraint (nullable)</strong> — column might be <code>NULL</code></li>
  <li><strong>DEFAULT value</strong> — column has a default but can still be <code>NULL</code></li>
</ol>

<p>In TypeScript with strict null checks enabled (which you should always use), these map to:</p>

<pre><code>// NOT NULL column → required, non-optional
interface User {
  name: string;        // Always present
  age: number;         // Always present
  isActive: boolean;   // Always present
}

// NULL column → optional or nullable
interface User {
  bio?: string;         // Optional (undefined or string)
  // or
  bio: string | null;   // Explicitly null-able
  phone: string | null; // From database: null if not set
}</code></pre>

<p>Best practice: use <code>string | null</code> for database-facing types (where the DB driver returns <code>null</code>), and use <code>field?: string</code> for API-facing types (where the field might simply be absent from the JSON).</p>

<h2>MySQL Type Mappings</h2>

<p>MySQL type mapping is similar to PostgreSQL with a few differences:</p>

<pre><code>-- MySQL specific
id INT AUTO_INCREMENT PRIMARY KEY   → id: number
is_active TINYINT(1)                → isActive: boolean  // Cast 0/1 to bool
created_at DATETIME                 → createdAt: Date
metadata JSON                       → metadata: Record&lt;string, unknown&gt;
status ENUM('active','inactive')    → status: 'active' | 'inactive'</code></pre>

<p>For MySQL's <code>TINYINT(1)</code> boolean, many ORMs handle the 0/1 → boolean conversion automatically. If you're using raw queries, you'll need to cast explicitly: <code>Boolean(row.is_active)</code>.</p>

<h2>SQLite Type Mappings</h2>

<p>SQLite uses a dynamic type system with only 5 storage classes: NULL, INTEGER, REAL, TEXT, BLOB. Most SQLite types are "type affinities" rather than strict types:</p>

<pre><code>-- SQLite
id INTEGER PRIMARY KEY              → id: number
price REAL                         → price: number
name TEXT NOT NULL                 → name: string
created_at TEXT                    → createdAt: string  // ISO 8601 stored as TEXT
is_active INTEGER                  → isActive: boolean  // Cast 0/1
data BLOB                          → data: Uint8Array</code></pre>

<p>The key challenge with SQLite is that boolean and date types don't exist natively. You must cast them in your TypeScript code:</p>
<pre><code>const isActive = Boolean(row.is_active);
const createdAt = new Date(row.created_at);</code></pre>

<h2>Generating TypeScript Interfaces Automatically</h2>

<p>Instead of manually mapping types, use <strong>SchemaForge's free SQL to TypeScript generator</strong>. Paste any <code>CREATE TABLE</code> statement from PostgreSQL, MySQL, or SQLite and get complete TypeScript interfaces instantly — with correct nullability, typed arrays, and navigation properties for foreign keys.</p>

<p>The generator runs entirely in your browser. Your database schema never leaves your machine.</p>
    `,
  },

  {
    slug: 'generating-python-dataclasses-from-sql-schemas',
    title: 'Generating Python Dataclasses from SQL Database Schemas',
    description:
      'How to convert SQL CREATE TABLE statements to Python dataclasses — with type hints, Optional fields, datetime, Decimal, UUID, and field defaults for auto-generated columns.',
    publishedAt: '2026-09-28',
    readingTimeMin: 7,
    relatedToolHref: '/generate/postgres-to-python-dataclass',
    relatedToolLabel: 'SQL → Python Dataclass Generator',
    content: `
<p>Python dataclasses (introduced in Python 3.7) are the modern, idiomatic way to represent database rows as Python objects. They provide automatic <code>__init__</code>, <code>__repr__</code>, and <code>__eq__</code> methods, work seamlessly with type checkers like mypy, and are compatible with libraries like Pydantic, SQLAlchemy, and dataclasses-json.</p>

<p>This guide shows you exactly how to convert SQL <code>CREATE TABLE</code> statements into Python dataclasses with proper type hints and field defaults.</p>

<h2>Why Use Dataclasses for Database Models?</h2>

<p>Before Python 3.7, developers typically used regular classes with <code>__init__</code> methods or NamedTuples. Dataclasses offer several advantages for database models:</p>

<ul>
  <li><strong>Auto-generated boilerplate</strong>: No manual <code>__init__</code>, <code>__repr__</code>, or <code>__eq__</code></li>
  <li><strong>Type hints built-in</strong>: Each field has a declared type, enabling mypy and IDE support</li>
  <li><strong>Field defaults</strong>: Default values and factory functions via <code>field()</code></li>
  <li><strong>Mutable by default</strong>: Unlike NamedTuples, you can update field values after creation</li>
  <li><strong>Frozen option</strong>: <code>@dataclass(frozen=True)</code> for immutable value objects</li>
</ul>

<h2>The Core SQL to Python Type Mapping</h2>

<table>
  <thead><tr><th>SQL Type</th><th>Python Type</th><th>Import</th></tr></thead>
  <tbody>
    <tr><td><code>INTEGER / INT</code></td><td><code>int</code></td><td>built-in</td></tr>
    <tr><td><code>BIGINT</code></td><td><code>int</code></td><td>built-in (arbitrary precision)</td></tr>
    <tr><td><code>FLOAT / REAL</code></td><td><code>float</code></td><td>built-in</td></tr>
    <tr><td><code>DECIMAL / NUMERIC</code></td><td><code>Decimal</code></td><td><code>from decimal import Decimal</code></td></tr>
    <tr><td><code>VARCHAR / TEXT</code></td><td><code>str</code></td><td>built-in</td></tr>
    <tr><td><code>BOOLEAN</code></td><td><code>bool</code></td><td>built-in</td></tr>
    <tr><td><code>TIMESTAMP / DATETIME</code></td><td><code>datetime</code></td><td><code>from datetime import datetime</code></td></tr>
    <tr><td><code>DATE</code></td><td><code>date</code></td><td><code>from datetime import date</code></td></tr>
    <tr><td><code>TIME</code></td><td><code>time</code></td><td><code>from datetime import time</code></td></tr>
    <tr><td><code>UUID</code></td><td><code>UUID</code></td><td><code>from uuid import UUID</code></td></tr>
    <tr><td><code>JSONB / JSON</code></td><td><code>dict[str, Any]</code></td><td><code>from typing import Any</code></td></tr>
    <tr><td><code>BYTEA / BLOB</code></td><td><code>bytes</code></td><td>built-in</td></tr>
  </tbody>
</table>

<h2>Handling Nullable Columns with Optional</h2>

<p>SQL columns without <code>NOT NULL</code> constraints can be <code>NULL</code>. In Python, this maps to <code>Optional[Type]</code> (or <code>Type | None</code> in Python 3.10+) with a default of <code>None</code>:</p>

<pre><code>from dataclasses import dataclass, field
from typing import Optional

@dataclass
class Customer:
    # NOT NULL columns — required at construction
    id: int
    first_name: str
    last_name: str
    email: str

    # Nullable columns — optional, default to None
    phone: Optional[str] = None
    company: Optional[str] = None</code></pre>

<p>In Python 3.10+, you can use the cleaner union syntax:</p>
<pre><code>@dataclass
class Customer:
    phone: str | None = None</code></pre>

<h2>Complete Example: PostgreSQL Schema to Dataclass</h2>

<p>Consider this PostgreSQL schema:</p>

<pre><code>CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock_count INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sku UUID DEFAULT gen_random_uuid(),
  metadata JSONB
);</code></pre>

<p>The equivalent Python dataclass:</p>

<pre><code>from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Any, Optional
from uuid import UUID


@dataclass
class Product:
    # Required fields (NOT NULL without DEFAULT)
    id: int
    name: str
    price: Decimal

    # NOT NULL with DEFAULT — optional at construction
    stock_count: int = 0
    is_available: bool = True

    # Auto-generated — use None as sentinel for DB-assigned values
    created_at: Optional[datetime] = None
    sku: Optional[UUID] = None

    # Truly nullable
    description: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None</code></pre>

<h2>Handling Auto-Generated Primary Keys</h2>

<p>For auto-increment primary keys (<code>SERIAL</code>, <code>INT AUTO_INCREMENT</code>), the value is generated by the database, not the application. The cleanest pattern is to make the <code>id</code> field optional with a default of <code>None</code> and only set it after the row is inserted:</p>

<pre><code>@dataclass
class Product:
    name: str
    price: Decimal
    # id is None before INSERT, set after DB assignment
    id: Optional[int] = field(default=None)</code></pre>

<h2>Using Dataclasses with Database Libraries</h2>

<h3>With psycopg3 (PostgreSQL)</h3>
<pre><code>import psycopg
from psycopg.rows import class_row

with psycopg.connect("postgresql://...") as conn:
    with conn.cursor(row_factory=class_row(Product)) as cur:
        cur.execute("SELECT * FROM products WHERE id = %s", (1,))
        product: Product = cur.fetchone()
        print(product.name)  # Fully typed!</code></pre>

<h3>With SQLAlchemy 2.0</h3>
<pre><code>from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))</code></pre>

<h2>Decimal vs Float for Money</h2>

<p>Never use <code>float</code> for monetary values or any SQL <code>DECIMAL</code>/<code>NUMERIC</code> column. Python's <code>float</code> uses binary floating-point which cannot represent most decimal fractions exactly:</p>

<pre><code># Wrong — floating-point precision error
total: float = 19.99 + 0.01  # → 20.000000000000004

# Correct — exact decimal arithmetic
from decimal import Decimal
total: Decimal = Decimal('19.99') + Decimal('0.01')  # → 20.00</code></pre>

<h2>Generate Dataclasses Automatically</h2>

<p>Instead of writing dataclasses by hand, use <strong>SchemaForge's free SQL to Python dataclass generator</strong>. Paste your <code>CREATE TABLE</code> statements and get correctly typed dataclasses with <code>Optional</code> fields, proper imports, and <code>field()</code> defaults — instantly in your browser.</p>
    `,
  },

  {
    slug: 'how-to-generate-mock-data-from-sql-schemas',
    title: 'How to Generate Realistic Mock Data from SQL Schemas',
    description:
      'Generate contextually accurate test data from your SQL CREATE TABLE scripts — names, emails, dates, UUIDs, and JSON — using Faker.js and the SchemaForge mock data generator.',
    publishedAt: '2026-10-01',
    readingTimeMin: 6,
    relatedToolHref: '/generate/postgres-to-mock-json',
    relatedToolLabel: 'SQL → Mock JSON Data Generator',
    content: `
<p>Writing realistic test data by hand is one of the most tedious parts of development. Hard-coded test fixtures with names like "Test User" and emails like "test@test.com" don't represent real-world data distributions and often miss edge cases. A SQL schema-based mock data generator solves this by creating contextually accurate test rows directly from your database structure.</p>

<h2>What is Schema-Based Mock Data Generation?</h2>

<p>Instead of writing test fixtures manually, you provide your <code>CREATE TABLE</code> DDL and the generator:</p>

<ol>
  <li>Reads each column's type to determine what kind of data to generate</li>
  <li>Reads the column name to add context (e.g., a column named <code>email</code> gets email addresses)</li>
  <li>Respects <code>NOT NULL</code> constraints (always generates a value)</li>
  <li>Handles nullable columns by occasionally returning <code>null</code> (~20% of the time for realism)</li>
  <li>Maintains referential integrity between foreign key relationships</li>
  <li>Generates multiple rows in a single output</li>
</ol>

<h2>Column Type to Mock Data Mapping</h2>

<table>
  <thead><tr><th>SQL Type</th><th>Generated Mock Data</th><th>Example</th></tr></thead>
  <tbody>
    <tr><td><code>SERIAL / INT AUTO_INCREMENT</code></td><td>Sequential integer</td><td>1, 2, 3</td></tr>
    <tr><td><code>INTEGER</code></td><td>Random integer in range</td><td>42, 1337</td></tr>
    <tr><td><code>DECIMAL(10,2)</code></td><td>Float with 2dp</td><td>99.95, 1234.50</td></tr>
    <tr><td><code>VARCHAR(n) — name column</code></td><td>Full name</td><td>"Jane Smith"</td></tr>
    <tr><td><code>VARCHAR(n) — email column</code></td><td>Email address</td><td>"jane.smith@example.com"</td></tr>
    <tr><td><code>VARCHAR(n) — phone column</code></td><td>Phone number</td><td>"+1-555-0147"</td></tr>
    <tr><td><code>VARCHAR(n) — url/website</code></td><td>URL</td><td>"https://example.com"</td></tr>
    <tr><td><code>TEXT</code></td><td>Lorem ipsum paragraph</td><td>"Lorem ipsum..."</td></tr>
    <tr><td><code>BOOLEAN / TINYINT(1)</code></td><td>true or false</td><td>true</td></tr>
    <tr><td><code>TIMESTAMP / DATETIME</code></td><td>ISO 8601 datetime</td><td>"2024-03-15T09:41:22Z"</td></tr>
    <tr><td><code>DATE</code></td><td>ISO 8601 date</td><td>"2024-03-15"</td></tr>
    <tr><td><code>UUID</code></td><td>UUID v4</td><td>"a1b2c3d4-e5f6-..."</td></tr>
    <tr><td><code>JSONB / JSON</code></td><td>Nested JSON object</td><td>{"key": "value"}</td></tr>
    <tr><td><code>BYTEA / BLOB</code></td><td>Base64 string</td><td>"SGVsbG8="</td></tr>
  </tbody>
</table>

<h2>Context-Aware Column Name Detection</h2>

<p>The most powerful feature is <strong>column name inference</strong>. The generator detects common column name patterns and generates appropriate data:</p>

<pre><code>-- These column names trigger specific Faker generators:
first_name, last_name, full_name, name  → Person names
email, email_address                    → Email addresses
phone, phone_number, mobile             → Phone numbers
address, street_address                 → Street addresses
city                                    → City names
country                                 → Country names
zip_code, postal_code                   → Postal codes
company, company_name, organization     → Company names
website, url, homepage                  → URLs
description, bio, about                 → Lorem paragraphs
price, amount, total, cost              → Monetary amounts
quantity, count, num_                   → Integer counts
ip_address, ip                          → IP addresses
user_agent                              → Browser user agent strings</code></pre>

<h2>Example: Schema to Mock Data</h2>

<p>Given this schema:</p>

<pre><code>CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(30),
  company VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);</code></pre>

<p>The generator produces realistic JSON output like:</p>

<pre><code>[
  {
    "id": 1,
    "first_name": "Marcus",
    "last_name": "Chen",
    "email": "marcus.chen@example.net",
    "phone": "+1-415-555-0189",
    "company": "Apex Systems LLC",
    "created_at": "2024-02-14T11:23:45.000Z",
    "is_active": true
  },
  {
    "id": 2,
    "first_name": "Sarah",
    "last_name": "O'Brien",
    "email": "sarah.obrien@workplace.io",
    "phone": null,
    "company": null,
    "created_at": "2024-03-01T08:15:00.000Z",
    "is_active": true
  }
]</code></pre>

<p>Notice: <code>phone</code> and <code>company</code> are nullable columns, so some rows have <code>null</code> values for realism.</p>

<h2>Use Cases for Schema-Based Mock Data</h2>

<h3>1. Unit and Integration Testing</h3>
<p>Generate test fixtures that look like real data. Tests that use "test@test.com" miss real-world edge cases like apostrophes in names, international characters, and long string values.</p>

<h3>2. Frontend Development Before the Backend is Ready</h3>
<p>Frontend developers can generate realistic JSON responses matching the exact schema the API will eventually return, enabling parallel development.</p>

<h3>3. Load and Performance Testing</h3>
<p>Generate thousands of rows for load testing without needing a production data dump. The data distributions are realistic enough to test query performance and caching behavior.</p>

<h3>4. Database Seeding</h3>
<p>Seed a development or staging database with realistic data for demos, QA testing, or developer onboarding.</p>

<h3>5. API Documentation and Examples</h3>
<p>Generate realistic example JSON for API documentation that shows what real responses look like, instead of placeholder data.</p>

<h2>Generate Mock Data from Your SQL Schema</h2>

<p>Use <strong>SchemaForge's free SQL mock data generator</strong> to generate realistic JSON from your <code>CREATE TABLE</code> scripts. Supports PostgreSQL, MySQL, SQLite, SQL Server, Oracle, and MariaDB. Choose how many rows to generate, then copy the output directly into your tests or seed scripts.</p>

<p>Everything runs in your browser — your schema never leaves your machine, making it safe to use with production or confidential table structures.</p>
    `,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
