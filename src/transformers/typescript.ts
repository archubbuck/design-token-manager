import { flattenTokens, camelCase, kebabCase } from '../utils';

export function generateTypeScriptTokens(baseTokens: any, variants: any[] = [], prefix = ''): string {
  const baseFlattened = flattenTokens(baseTokens);
  const prefixStr = prefix ? `${prefix}-` : '';
  
  // Generate base tokens interface
  const interfaceEntries = Object.entries(baseFlattened)
    .map(([key, token]: [string, any]) => {
      const tokenKey = camelCase(key);
      const description = typeof token === 'object' ? token.description : undefined;
      const comment = description ? `  /** ${description} */\n` : '';
      return `${comment}  ${tokenKey}: string;`;
    })
    .join('\n');

  // Generate base tokens object
  const tokenEntries = Object.entries(baseFlattened)
    .map(([key, token]: [string, any]) => {
      const tokenKey = camelCase(key);
      const value = typeof token === 'object' ? token.value : token;
      const description = typeof token === 'object' ? token.description : undefined;
      
      const comment = description ? `  /** ${description} */\n` : '';
      return `${comment}  ${tokenKey}: '${value}'`;
    })
    .join(',\n');

  // Generate theme variants
  const themeVariants = variants.map(variant => {
    const variantFlattened = flattenTokens(variant.tokens);
    const variantEntries = Object.entries(variantFlattened)
      .map(([key, token]: [string, any]) => {
        const tokenKey = camelCase(key);
        const value = typeof token === 'object' ? token.value : token;
        return `  ${tokenKey}: '${value}'`;
      })
      .join(',\n');

    return `export const ${camelCase(variant.name)}Tokens: DesignTokens = {
${variantEntries}
};`;
  }).join('\n\n');

  // Generate theme map
  const themeMap = variants.length > 0 ? `
export const themes = {
  base: tokens,${variants.map(variant => `
  ${camelCase(variant.name)}: ${camelCase(variant.name)}Tokens`).join(',')}
} as const;

export type ThemeName = keyof typeof themes;

export function getThemeTokens(theme: ThemeName = 'base'): DesignTokens {
  return themes[theme];
}` : '';

  return `// Generated design tokens
export interface DesignTokens {
${interfaceEntries}
}

export const tokens: DesignTokens = {
${tokenEntries}
};

${themeVariants}${themeMap}

// CSS Custom Properties (for runtime usage)
export const cssVars = {
${Object.entries(baseFlattened)
  .map(([key, token]: [string, any]) => {
    const tokenKey = camelCase(key);
    const cssVar = `--${prefixStr}${kebabCase(key)}`;
    return `  ${tokenKey}: 'var(${cssVar})'`;
  })
  .join(',\n')}
};

// Token names as constants
export const tokenNames = {
${Object.entries(baseFlattened)
  .map(([key]) => {
    const tokenKey = camelCase(key);
    return `  ${tokenKey}: '${prefixStr}${kebabCase(key)}'`;
  })
  .join(',\n')}
};
`;
}