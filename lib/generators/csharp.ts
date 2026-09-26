import { TableSchema } from '../parser';

function mapTypeToCSharp(normalizedType: string, rawType: string): string {
  if (normalizedType === 'number') {
    const rType = rawType.toUpperCase();
    if (rType.includes('FLOAT') || rType.includes('DOUBLE') || rType.includes('DECIMAL') || rType.includes('NUMERIC') || rType.includes('REAL')) {
      return 'double';
    }
    if (rType.includes('BIGINT')) {
      return 'long';
    }
    return 'int';
  }
  if (normalizedType === 'boolean') return 'bool';
  if (normalizedType === 'date') return 'DateTime';
  if (normalizedType === 'uuid') return 'Guid';
  return 'string';
}

function toPascalCase(str: string): string {
  return str.replace(/(^\w|-\w|_\w)/g, (match) => {
    return match.replace(/-|_/, '').toUpperCase();
  });
}

export function generateCSharpPoco(schema: TableSchema): string {
  const className = toPascalCase(schema.tableName);
  let code = `using System;\nusing System.ComponentModel.DataAnnotations;\nusing System.ComponentModel.DataAnnotations.Schema;\n\n`;
  code += `public class ${className}\n{\n`;

  for (const col of schema.columns) {
    const propName = toPascalCase(col.name);
    const csType = mapTypeToCSharp(col.normalizedType, col.rawType);
    
    // Add nullability marker
    const typeStr = col.isNullable ? `${csType}?` : csType;

    const annotations: string[] = [];
    if (col.isPrimary) {
      annotations.push('[Key]');
    }
    if (!col.isNullable && !col.isPrimary) {
      annotations.push('[Required]');
    }
    if (col.name !== propName) {
      annotations.push(`[Column("${col.name}")]`);
    }

    if (annotations.length > 0) {
      code += `    ${annotations.join('\n    ')}\n`;
    }
    code += `    public ${typeStr} ${propName} { get; set; }\n\n`;
  }

  code += `}\n`;
  return code;
}
