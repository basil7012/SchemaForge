import { expect, test, describe } from 'vitest';
import { parseSqlDDL } from '../lib/parser';

describe('SQL Parser Engine', () => {
  test('parses standard PostgreSQL CREATE TABLE with foreign keys', () => {
    const sql = `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        role_id INT,
        FOREIGN KEY (role_id) REFERENCES roles(id)
      );
    `;
    const schemas = parseSqlDDL(sql);
    expect(schemas).toHaveLength(1);
    expect(schemas[0].tableName).toBe('users');
    
    const idCol = schemas[0].columns.find(c => c.name === 'id');
    expect(idCol?.isPrimary).toBe(true);
    expect(idCol?.normalizedType).toBe('number');
    
    const roleIdCol = schemas[0].columns.find(c => c.name === 'role_id');
    expect(roleIdCol?.foreignKey).toEqual({ targetTable: 'roles', targetColumn: 'id' });
    expect(roleIdCol?.normalizedType).toBe('number');
    
    const usernameCol = schemas[0].columns.find(c => c.name === 'username');
    expect(usernameCol?.isNullable).toBe(false);
    expect(usernameCol?.normalizedType).toBe('string');
  });

  test('parses MySQL CREATE TABLE syntax', () => {
    const sql = `
      CREATE TABLE \`orders\` (
        \`order_id\` int NOT NULL AUTO_INCREMENT,
        \`product_id\` varchar(36) NOT NULL,
        \`quantity\` int DEFAULT NULL,
        \`is_active\` tinyint(1) DEFAULT '1',
        PRIMARY KEY (\`order_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    const schemas = parseSqlDDL(sql);
    expect(schemas).toHaveLength(1);
    expect(schemas[0].tableName).toBe('orders');
    
    const orderId = schemas[0].columns.find(c => c.name === 'order_id');
    expect(orderId?.isPrimary).toBe(true);
    expect(orderId?.isNullable).toBe(false);
    expect(orderId?.normalizedType).toBe('number');
  });
  
  test('parses multiple CREATE TABLE statements', () => {
    const sql = `
      CREATE TABLE authors (
        id INT PRIMARY KEY,
        name VARCHAR(100)
      );
      CREATE TABLE books (
        id INT PRIMARY KEY,
        title VARCHAR(200),
        author_id INT,
        FOREIGN KEY (author_id) REFERENCES authors(id)
      );
    `;
    const schemas = parseSqlDDL(sql);
    expect(schemas).toHaveLength(2);
    expect(schemas[0].tableName).toBe('authors');
    expect(schemas[1].tableName).toBe('books');
    
    const authorId = schemas[1].columns.find(c => c.name === 'author_id');
    expect(authorId?.foreignKey).toEqual({ targetTable: 'authors', targetColumn: 'id' });
  });
});
