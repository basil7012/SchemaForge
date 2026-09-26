import { Parser } from 'node-sql-parser';

export interface TableSchema {
  tableName: string;
  columns: {
    name: string;
    rawType: string;
    normalizedType: 'string' | 'number' | 'boolean' | 'date' | 'uuid';
    isNullable: boolean;
    isPrimary: boolean;
    foreignKey?: { targetTable: string; targetColumn: string };
  }[];
}

function normalizeType(rawType: string): 'string' | 'number' | 'boolean' | 'date' | 'uuid' {
  if (!rawType) return 'string';
  const type = rawType.toUpperCase();
  if (type.includes('INT') || type.includes('FLOAT') || type.includes('DOUBLE') || type.includes('DECIMAL') || type.includes('NUMERIC') || type.includes('REAL') || type.includes('SERIAL')) {
    return 'number';
  }
  if (type.includes('BOOL') || type.includes('BIT')) {
    return 'boolean';
  }
  if (type.includes('DATE') || type.includes('TIME') || type.includes('YEAR')) {
    return 'date';
  }
  if (type.includes('UUID')) {
    return 'uuid';
  }
  return 'string';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getColumnName(colObj: any): string {
  if (!colObj) return '';
  if (typeof colObj === 'string') return colObj;
  if (colObj.column) {
    if (typeof colObj.column === 'string') return colObj.column;
    if (colObj.column.expr && colObj.column.expr.value) return colObj.column.expr.value;
  }
  if (colObj.expr && colObj.expr.value) return colObj.expr.value;
  return String(colObj);
}

export function parseSqlDDL(sqlString: string): TableSchema[] {
  const parser = new Parser();
  const schemas: TableSchema[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type SqlAst = any; // node-sql-parser does not export typed AST nodes
  let ast: SqlAst;
  try {
    ast = parser.astify(sqlString, { database: 'postgresql' });
  } catch (e) {
    console.debug('[parser] PostgreSQL dialect failed, trying MySQL:', (e as Error).message);
    try {
      ast = parser.astify(sqlString, { database: 'mysql' });
    } catch (e2) {
      console.debug('[parser] MySQL dialect failed, trying default:', (e2 as Error).message);
      try {
        ast = parser.astify(sqlString);
      } catch (e3) {
        console.debug('[parser] All dialects failed:', (e3 as Error).message);
        return [];
      }
    }
  }

  const statements = Array.isArray(ast) ? ast : [ast];

  for (const stmt of statements) {
    if (stmt && stmt.type === 'create' && stmt.keyword === 'table') {
      const tableName = stmt.table[0].table;
      const columns = [];

      const defs = stmt.create_definitions || [];
      
      const primaryKeys = new Set<string>();
      const foreignKeys = new Map<string, { targetTable: string; targetColumn: string }>();

      for (const def of defs) {
        if (def.resource === 'constraint') {
          const constraintType = (def.constraint_type || '').toUpperCase();
          if (constraintType === 'PRIMARY KEY') {
            def.definition.forEach((col: any) => {
              primaryKeys.add(getColumnName(col));
            });
          } else if (constraintType === 'FOREIGN KEY') {
            const colName = getColumnName(def.definition[0]);
            const refDef = def.reference_definition;
            if (refDef && refDef.table && refDef.definition) {
              foreignKeys.set(colName, {
                targetTable: refDef.table[0].table,
                targetColumn: getColumnName(refDef.definition[0])
              });
            }
          }
        }
      }

      for (const def of defs) {
        if (def.resource === 'column') {
          const colName = getColumnName(def.column);
          const rawType = def.definition?.dataType || 'VARCHAR';
          
          if (def.primary_key) {
            primaryKeys.add(colName);
          }
          if (def.reference_definition) {
            const refDef = def.reference_definition;
            foreignKeys.set(colName, {
              targetTable: refDef.table[0].table,
              targetColumn: getColumnName(refDef.definition[0].column)
            });
          }

          let isNullable = true;
          if (def.nullable) {
            if (def.nullable.type === 'not null' || def.nullable.value === 'not null') {
              isNullable = false;
            }
          }

          columns.push({
            name: colName,
            rawType: rawType,
            normalizedType: normalizeType(rawType),
            isNullable: isNullable,
            isPrimary: primaryKeys.has(colName),
            foreignKey: foreignKeys.get(colName)
          });
        }
      }
      
      for (const col of columns) {
        if (primaryKeys.has(col.name)) {
          col.isPrimary = true;
          col.isNullable = false;
        }
        if (foreignKeys.has(col.name)) col.foreignKey = foreignKeys.get(col.name);
      }

      schemas.push({
        tableName,
        columns
      });
    }
  }

  return schemas;
}
