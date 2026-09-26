import { expect, test, describe } from 'vitest';
import { generateCSharpPoco } from '../lib/generators/csharp';
import { generateTypeScript } from '../lib/generators/typescript';
import { generateMockData } from '../lib/generators/mockData';
import { parseSqlDDL } from '../lib/parser';

describe('Generators', () => {
  const sql = `
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN
    );
  `;
  const schema = parseSqlDDL(sql)[0];

  test('generateCSharpPoco', () => {
    const code = generateCSharpPoco(schema);
    expect(code).toContain('public class Users');
    expect(code).toContain('[Key]');
    expect(code).toContain('public int Id { get; set; }');
    expect(code).toContain('public string Username { get; set; }');
    expect(code).toContain('public string Email { get; set; }');
    expect(code).toContain('public DateTime? CreatedAt { get; set; }');
    expect(code).toContain('public bool? IsActive { get; set; }');
  });

  test('generateTypeScript', () => {
    const code = generateTypeScript(schema);
    expect(code).toContain('export interface Users {');
    expect(code).toContain('  id: number;');
    expect(code).toContain('  username: string;');
    expect(code).toContain('  email: string;');
    expect(code).toContain('  created_at?: Date;');
    expect(code).toContain('  is_active?: boolean;');
  });

  test('generateMockData', () => {
    const mock = generateMockData(schema, 5);
    expect(mock).toHaveProperty('json');
    expect(mock).toHaveProperty('sql');
    
    const parsed = JSON.parse(mock.json);
    expect(parsed).toHaveLength(5);
    expect(parsed[0]).toHaveProperty('id');
    expect(parsed[0]).toHaveProperty('username');
    expect(parsed[0]).toHaveProperty('email');
    
    expect(mock.sql).toContain('INSERT INTO users');
    expect(mock.sql).toContain('VALUES');
  });
});
