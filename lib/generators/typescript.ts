import { TableSchema } from '../parser';

function mapTypeToTypeScript(normalizedType: string): string {
  if (normalizedType === 'date') return 'Date';
  if (normalizedType === 'uuid') return 'string';
  return normalizedType; // string, number, boolean
}

function toPascalCase(str: string): string {
  return str.replace(/(^\w|-\w|_\w)/g, (match) => {
    return match.replace(/-|_/, '').toUpperCase();
  });
}

export function generateTypeScript(schema: TableSchema): string {
  const interfaceName = toPascalCase(schema.tableName);
  let code = `export interface ${interfaceName} {\n`;

  for (const col of schema.columns) {
    const tsType = mapTypeToTypeScript(col.normalizedType);
    const optionalMarker = col.isNullable ? '?' : '';
    code += `  ${col.name}${optionalMarker}: ${tsType};\n`;
  }

  code += `}\n`;
  return code;
}
