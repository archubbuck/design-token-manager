import { flattenTokens, kebabCase } from '../utils';

export function generateScssTokens(baseTokens: any, variants: any[] = [], prefix = ''): string {
  const baseFlattened = flattenTokens(baseTokens);
  const prefixStr = prefix ? `${prefix}-` : '';
  
  // Generate base SCSS variables
  const scssVars = Object.entries(baseFlattened)
    .map(([key, token]: [string, any]) => {
      const value = typeof token === 'object' ? token.value : token;
      const description = typeof token === 'object' ? token.description : undefined;
      const varName = `$${prefixStr}${kebabCase(key)}`;
      
      const comment = description ? `// ${description}\n` : '';
      return `${comment}${varName}: ${value};`;
    })
    .join('\n');

  // Generate base CSS custom properties
  const baseCssVars = Object.entries(baseFlattened)
    .map(([key, token]: [string, any]) => {
      const value = typeof token === 'object' ? token.value : token;
      const cssVar = `--${prefixStr}${kebabCase(key)}`;
      return `  ${cssVar}: ${value};`;
    })
    .join('\n');

  // Generate theme variant CSS custom properties
  const themeVariantCss = variants.map(variant => {
    const variantFlattened = flattenTokens(variant.tokens);
    const variantCssVars = Object.entries(variantFlattened)
      .map(([key, token]: [string, any]) => {
        const value = typeof token === 'object' ? token.value : token;
        const cssVar = `--${prefixStr}${kebabCase(key)}`;
        return `  ${cssVar}: ${value};`;
      })
      .join('\n');

    let selector = '';
    if (variant.mediaQuery && variant.selector) {
      selector = `${variant.mediaQuery} {\n  ${variant.selector} {\n${variantCssVars.split('\n').map(line => `  ${line}`).join('\n')}\n  }\n}`;
    } else if (variant.mediaQuery) {
      selector = `${variant.mediaQuery} {\n  :root {\n${variantCssVars.split('\n').map(line => `  ${line}`).join('\n')}\n  }\n}`;
    } else {
      selector = `${variant.selector} {\n${variantCssVars}\n}`;
    }

    return `
// Theme: ${variant.name}
${selector}`;
  }).join('\n');

  // Generate mixins for easy access
  const mixins = Object.entries(baseFlattened)
    .map(([key, token]: [string, any]) => {
      const mixinName = kebabCase(key);
      const varName = `$${prefixStr}${kebabCase(key)}`;
      const type = typeof token === 'object' ? token.type : 'value';
      
      if (type === 'color') {
        return `@mixin ${prefixStr}${mixinName}($property: color) {
  #{$property}: #{${varName}};
}`;
      } else if (type === 'spacing') {
        return `@mixin ${prefixStr}${mixinName}($property: margin) {
  #{$property}: #{${varName}};
}`;
      } else {
        return `@mixin ${prefixStr}${mixinName}($property) {
  #{$property}: #{${varName}};
}`;
      }
    })
    .join('\n\n');

  // Generate theme-aware mixins
  const themeMixins = variants.length > 0 ? `
// Theme-aware mixins
@mixin theme-aware($light-value, $dark-value: null) {
  @if $dark-value == null {
    $dark-value: $light-value;
  }
  
  #{$light-value};
  
  [data-theme="dark"] & {
    #{$dark-value};
  }
}

@mixin for-theme($theme-name) {
  [data-theme="#{$theme-name}"] & {
    @content;
  }
}` : '';

  return `// Generated design tokens

// SCSS Variables (Base Theme)
${scssVars}

// CSS Custom Properties
:root {
${baseCssVars}
}${themeVariantCss}

// Utility Mixins
${mixins}${themeMixins}

// Token map for programmatic access
$${prefixStr}tokens: (
${Object.entries(baseFlattened)
  .map(([key, token]: [string, any]) => {
    const value = typeof token === 'object' ? token.value : token;
    return `  "${kebabCase(key)}": ${value}`;
  })
  .join(',\n')}
);

// Function to get token value
@function ${prefixStr}token($name) {
  @return map-get($${prefixStr}tokens, $name);
}
`;
}