export function processThemeVariants(baseTokens: any, themes: any[]): { base: any; variants: any[] } {
  if (!themes || themes.length === 0) {
    return { base: baseTokens, variants: [] };
  }

  const processedVariants = themes.map(theme => {
    // Merge theme tokens with base tokens
    const mergedTokens = deepMerge(JSON.parse(JSON.stringify(baseTokens)), theme.tokens || {});
    
    return {
      name: theme.name,
      selector: theme.selector || `[data-theme="${theme.name}"]`,
      mediaQuery: theme.mediaQuery,
      tokens: resolveTokenReferences(mergedTokens)
    };
  });

  return {
    base: resolveTokenReferences(baseTokens),
    variants: processedVariants
  };
}

export function mergeTokens(tokenSets: any[]): any {
  const merged = {};
  
  for (const tokens of tokenSets) {
    deepMerge(merged, tokens);
  }
  
  return merged;
}

export function deepMerge(target: any, source: any): any {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      // If it's an object but has a 'value' property, treat it as a token (don't merge deeper)
      if ('value' in source[key]) {
        target[key] = { ...source[key] }; // Shallow copy the token
      } else {
        // It's a nested group, merge recursively
        target[key] = target[key] || {};
        deepMerge(target[key], source[key]);
      }
    } else {
      // Primitive value or array, direct assignment
      target[key] = source[key];
    }
  }
  return target;
}

export function resolveTokenReferences(tokens: any): any {
  const resolved = JSON.parse(JSON.stringify(tokens)); // Deep clone
  
  // First, collect all token paths for reference resolution
  const tokenPaths = new Map<string, any>();
  
  function collectPaths(obj: any, path: string[] = []) {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = [...path, key];
      const pathStr = currentPath.join('.');
      
      if (value && typeof value === 'object') {
        if ('value' in value) {
          tokenPaths.set(pathStr, value);
        } else {
          collectPaths(value, currentPath);
        }
      }
    }
  }
  
  collectPaths(resolved);
  
  // Resolve references
  function resolveValue(value: any): any {
    if (typeof value === 'string' && value.includes('{') && value.includes('}')) {
      return value.replace(/\{([^}]+)\}/g, (match, reference) => {
        const referencedToken = tokenPaths.get(reference);
        if (referencedToken) {
          return resolveValue(referencedToken.value);
        }
        console.warn(`⚠️  Token reference not found: ${reference}`);
        return match; // Return original if not found
      });
    }
    return value;
  }
  
  // Apply resolution to all tokens
  function resolveTokens(obj: any) {
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object') {
        if ('value' in value) {
          (value as any).value = resolveValue((value as any).value);
        } else {
          resolveTokens(value);
        }
      }
    }
  }
  
  resolveTokens(resolved);
  return resolved;
}

export function flattenTokens(tokens: any, prefix = '', separator = '-'): Record<string, any> {
  const flattened: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(tokens)) {
    const newKey = prefix ? `${prefix}${separator}${key}` : key;
    
    if (value && typeof value === 'object' && !('value' in value)) {
      // It's a nested group
      Object.assign(flattened, flattenTokens(value, newKey, separator));
    } else {
      // It's a token with a value
      flattened[newKey] = value;
    }
  }
  
  return flattened;
}

export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

export function camelCase(str: string): string {
  return str
    .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
    .replace(/^[A-Z]/, letter => letter.toLowerCase());
}

export function pascalCase(str: string): string {
  return camelCase(str).replace(/^[a-z]/, letter => letter.toUpperCase());
}