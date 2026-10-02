import { faker } from '@faker-js/faker';
import { TableSchema } from '../parser';

export interface MockDataResult {
  json: string;
  sql: string;
}

function generateValueForColumn(col: TableSchema['columns'][0]) {
  const name = col.name.toLowerCase();
  
  if (name.includes('email')) return faker.internet.email();
  if (name.includes('first_name') || name === 'firstname') return faker.person.firstName();
  if (name.includes('last_name') || name === 'lastname') return faker.person.lastName();
  if (name.includes('name')) return faker.person.fullName();
  if (name.includes('phone')) return faker.phone.number({ style: 'national' });
  if (name.includes('price') || name.includes('amount') || name.includes('cost')) return parseFloat(faker.commerce.price());
  if (name.includes('company')) return faker.company.name();
  if (name.includes('address') || name.includes('street')) return faker.location.streetAddress();
  if (name.includes('city')) return faker.location.city();
  if (name.includes('country')) return faker.location.country();
  if (name.includes('zip') || name.includes('postal')) return faker.location.zipCode();
  if (name.includes('url') || name.includes('website')) return faker.internet.url();
  
  if (name === 'id' || name.endsWith('_id')) {
    if (col.normalizedType === 'uuid') return faker.string.uuid();
    if (col.normalizedType === 'string') return faker.string.alphanumeric(10);
    return faker.number.int({ min: 1, max: 10000 });
  }

  if (col.normalizedType === 'boolean') return faker.datatype.boolean();
  if (col.normalizedType === 'date') return faker.date.past();
  if (col.normalizedType === 'uuid') return faker.string.uuid();
  if (col.normalizedType === 'number') return faker.number.int({ min: 1, max: 1000 });
  
  return faker.lorem.word();
}

export function generateMockData(schema: TableSchema, count: number = 10): MockDataResult {
  const rows: any[] = [];
  
  for (let i = 0; i < count; i++) {
    const row: any = {};
    for (const col of schema.columns) {
      if (col.isNullable && Math.random() > 0.8) {
        row[col.name] = null;
      } else {
        row[col.name] = generateValueForColumn(col);
      }
    }
    rows.push(row);
  }

  let sql = `INSERT INTO ${schema.tableName} (${schema.columns.map(c => c.name).join(', ')}) VALUES\n`;
  const sqlValues = rows.map(row => {
    const vals = schema.columns.map(col => {
      const val = row[col.name];
      if (val === null) return 'NULL';
      if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
      if (val instanceof Date) return `'${val.toISOString()}'`;
      return val;
    });
    return `  (${vals.join(', ')})`;
  });
  sql += sqlValues.join(',\n') + ';\n';

  return {
    json: JSON.stringify(rows, null, 2),
    sql: sql
  };
}
