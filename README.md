# Design Token Manager 🔥

A zero-dependency npm package that transforms JSON design tokens into TypeScript and SCSS files with support for theme variants, token references, and watch mode.

[![npm version](https://badge.fury.io/js/design-token-manager.svg)](https://www.npmjs.com/package/design-token-manager)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🚀 **Zero dependencies** - Pure Node.js implementation
- 🎯 **Type-safe TypeScript** output with interfaces and utilities
- 🎨 **Complete SCSS utilities** with variables, mixins, and functions
- 🌙 **Theme variants** - Built-in dark mode, brand themes, accessibility support
- 📁 **Multiple inputs** - Merge multiple JSON files intelligently
- 🔗 **Token references** - Reference other tokens using `{path.to.token}` syntax
- 👀 **Watch mode** - Auto-regenerate during development
- 📦 **Lightweight** - No bloat, just what you need
- 🌐 **Cross-platform** - Works on Windows, Mac, and Linux

## 📦 Installation

```bash
npm install design-token-manager
# or
yarn add design-token-manager
# or
pnpm add design-token-manager
```

## 🚀 Quick Start

### CLI Usage

```bash
# Transform a single token file
npx design-token-manager transform -i tokens.json -o ./src/tokens

# Watch for changes during development
npx design-token-manager transform -i tokens.json -o ./src/tokens --watch

# Multiple files with custom prefix
npx design-token-manager transform -i "colors.json,spacing.json" -o ./dist --prefix app
```

### Programmatic Usage

```typescript
import { TokenTransformer } from 'design-token-manager';

const transformer = new TokenTransformer({
  inputPath: './design-tokens.json',
  outputDir: './src/tokens'
});

await transformer.transform();
```

## 📚 Comprehensive Examples

### 1. Basic Token File

Create a `tokens.json` file:

```json
{
  "colors": {
    "brand": {
      "primary": {
        "value": "#007bff",
        "type": "color",
        "description": "Primary brand color"
      },
      "secondary": {
        "value": "#6c757d",
        "type": "color",
        "description": "Secondary brand color"
      }
    },
    "semantic": {
      "success": { "value": "#28a745", "type": "color" },
      "warning": { "value": "#ffc107", "type": "color" },
      "danger": { "value": "#dc3545", "type": "color" }
    }
  },
  "spacing": {
    "xs": { "value": "4px", "type": "spacing" },
    "sm": { "value": "8px", "type": "spacing" },
    "md": { "value": "16px", "type": "spacing" },
    "lg": { "value": "24px", "type": "spacing" },
    "xl": { "value": "32px", "type": "spacing" }
  },
  "typography": {
    "fontFamily": {
      "primary": {
        "value": "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        "type": "typography"
      }
    },
    "fontSize": {
      "base": { "value": "16px", "type": "typography" },
      "lg": { "value": "18px", "type": "typography" }
    }
  }
}
```

### 2. CLI Examples

```bash
# Basic transformation
npx design-token-manager transform -i tokens.json -o ./src/tokens

# Multiple input files (comma-separated)
npx design-token-manager transform -i "colors.json,spacing.json,typography.json" -o ./src/tokens

# Multiple input files (space-separated)
npx design-token-manager transform -i colors.json spacing.json -o ./src/tokens

# With custom prefix
npx design-token-manager transform -i tokens.json -o ./src/tokens --prefix app

# Watch mode for development
npx design-token-manager transform -i tokens.json -o ./src/tokens --watch

# Skip TypeScript generation
npx design-token-manager transform -i tokens.json -o ./src/tokens --no-typescript

# Skip SCSS generation
npx design-token-manager transform -i tokens.json -o ./src/tokens --no-scss

# Show help
npx design-token-manager --help

# Show version
npx design-token-manager --version
```

### 3. Programmatic API Examples

#### Basic Usage

```typescript
import { TokenTransformer } from 'design-token-manager';

const transformer = new TokenTransformer({
  inputPath: './tokens.json',
  outputDir: './src/tokens',
  prefix: 'app',
  typescript: true,
  scss: true
});

await transformer.transform();
```

#### Multiple Input Files

```typescript
import { TokenTransformer } from 'design-token-manager';

const transformer = new TokenTransformer({
  inputPath: [
    './tokens/colors.json',
    './tokens/spacing.json',
    './tokens/typography.json',
    './tokens/components.json'
  ],
  outputDir: './src/design-system',
  prefix: 'ds'
});

await transformer.transform();
```

#### Watch Mode

```typescript
import { TokenTransformer } from 'design-token-manager';

const transformer = new TokenTransformer({
  inputPath: './tokens.json',
  outputDir: './src/tokens',
  watch: true
});

// This will watch for changes and auto-regenerate
await transformer.startWatching();
```

#### Theme Variants

```typescript
import { TokenTransformer } from 'design-token-manager';

const transformer = new TokenTransformer({
  inputPath: './base-tokens.json',
  outputDir: './src/tokens',
  themes: [
    {
      name: 'dark',
      selector: '[data-theme="dark"]',
      tokens: {
        colors: {
          semantic: {
            background: { value: '#1a1a1a' },
            text: { value: '#ffffff' }
          }
        }
      }
    },
    {
      name: 'high-contrast',
      selector: '[data-theme="high-contrast"]',
      mediaQuery: '@media (prefers-contrast: high)',
      tokens: {
        colors: {
          brand: {
            primary: { value: '#ffff00' },
            secondary: { value: '#00ffff' }
          }
        }
      }
    }
  ]
});

await transformer.transform();
```

#### Using Individual Functions

```typescript
import { generateTypeScriptTokens, generateScssTokens } from 'design-token-manager';
import fs from 'fs';

// Load your tokens
const tokens = JSON.parse(fs.readFileSync('./tokens.json', 'utf8'));

// Generate TypeScript
const tsContent = generateTypeScriptTokens(tokens, [], 'app');
fs.writeFileSync('./tokens.ts', tsContent);

// Generate SCSS
const scssContent = generateScssTokens(tokens, [], 'app');
fs.writeFileSync('./tokens.scss', scssContent);
```

### 4. Token References

Create semantic tokens that reference base tokens:

```json
{
  "colors": {
    "base": {
      "blue": { "value": "#007bff", "type": "color" },
      "green": { "value": "#28a745", "type": "color" },
      "red": { "value": "#dc3545", "type": "color" }
    },
    "semantic": {
      "primary": {
        "value": "{colors.base.blue}",
        "type": "color",
        "description": "References base blue color"
      },
      "success": {
        "value": "{colors.base.green}",
        "type": "color",
        "description": "References base green color"
      },
      "danger": {
        "value": "{colors.base.red}",
        "type": "color",
        "description": "References base red color"
      }
    }
  },
  "spacing": {
    "base": { "value": "8px", "type": "spacing" },
    "scale": {
      "xs": { "value": "4px", "type": "spacing" },
      "sm": { "value": "{spacing.base}", "type": "spacing" },
      "md": { "value": "16px", "type": "spacing" },
      "lg": { "value": "24px", "type": "spacing" }
    }
  },
  "components": {
    "button": {
      "backgroundColor": {
        "value": "{colors.semantic.primary}",
        "type": "color"
      },
      "padding": {
        "value": "{spacing.scale.md}",
        "type": "spacing"
      }
    }
  }
}
```

### 5. Multiple File Organization

Organize your tokens across multiple files:

**colors.json**
```json
{
  "colors": {
    "brand": {
      "primary": { "value": "#007bff", "type": "color" },
      "secondary": { "value": "#6c757d", "type": "color" }
    }
  }
}
```

**spacing.json**
```json
{
  "spacing": {
    "xs": { "value": "4px", "type": "spacing" },
    "sm": { "value": "8px", "type": "spacing" },
    "md": { "value": "16px", "type": "spacing" }
  }
}
```

**components.json**
```json
{
  "components": {
    "button": {
      "backgroundColor": {
        "value": "{colors.brand.primary}",
        "type": "color",
        "description": "References primary color from colors.json"
      },
      "padding": {
        "value": "{spacing.md}",
        "type": "spacing",
        "description": "References medium spacing from spacing.json"
      }
    }
  }
}
```

Then merge them:
```bash
npx design-token-manager transform -i "colors.json,spacing.json,components.json" -o ./tokens
```

## 📤 Generated Output

### TypeScript Output (`tokens.ts`)

```typescript
// Generated design tokens
export interface DesignTokens {
  /** Primary brand color */
  colorsBrandPrimary: string;
  colorsBrandSecondary: string;
  spacingXs: string;
  spacingMd: string;
}

export const tokens: DesignTokens = {
  /** Primary brand color */
  colorsBrandPrimary: '#007bff',
  colorsBrandSecondary: '#6c757d',
  spacingXs: '4px',
  spacingMd: '16px'
};

// CSS Custom Properties (for runtime usage)
export const cssVars = {
  colorsBrandPrimary: 'var(--colors-brand-primary)',
  colorsBrandSecondary: 'var(--colors-brand-secondary)',
  spacingXs: 'var(--spacing-xs)',
  spacingMd: 'var(--spacing-md)'
};

// Token names as constants
export const tokenNames = {
  colorsBrandPrimary: 'colors-brand-primary',
  colorsBrandSecondary: 'colors-brand-secondary',
  spacingXs: 'spacing-xs',
  spacingMd: 'spacing-md'
};
```

### SCSS Output (`tokens.scss`)

```scss
// Generated design tokens

// SCSS Variables (Base Theme)
// Primary brand color
$colors-brand-primary: #007bff;
$colors-brand-secondary: #6c757d;
$spacing-xs: 4px;
$spacing-md: 16px;

// CSS Custom Properties
:root {
  --colors-brand-primary: #007bff;
  --colors-brand-secondary: #6c757d;
  --spacing-xs: 4px;
  --spacing-md: 16px;
}

// Utility Mixins
@mixin colors-brand-primary($property: color) {
  #{$property}: #{$colors-brand-primary};
}

@mixin spacing-md($property: margin) {
  #{$property}: #{$spacing-md};
}

// Token map for programmatic access
$tokens: (
  "colors-brand-primary": #007bff,
  "colors-brand-secondary": #6c757d,
  "spacing-xs": 4px,
  "spacing-md": 16px
);

// Function to get token value
@function token($name) {
  @return map-get($tokens, $name);
}
```

## 🎨 Using Generated Tokens

### In TypeScript/JavaScript

```typescript
import { tokens, cssVars, themes } from './tokens';

// Use static values
const primaryColor = tokens.colorsBrandPrimary; // '#007bff'

// Use CSS custom properties (for runtime theming)
const dynamicColor = cssVars.colorsBrandPrimary; // 'var(--colors-brand-primary)'

// Use theme variants (if generated)
const darkTokens = themes.dark;
```

### In SCSS

```scss
@import './tokens';

.button {
  // Use SCSS variables
  background-color: $colors-brand-primary;
  padding: $spacing-md;
  
  // Use mixins
  @include colors-brand-primary(border-color);
  
  // Use function
  margin: token('spacing-xs');
  
  // Use CSS custom properties
  color: var(--colors-brand-secondary);
}

// Theme-aware styles (if using theme variants)
@include for-theme('dark') {
  .button {
    // Dark theme specific styles
  }
}
```

### In CSS

```css
.button {
  background-color: var(--colors-brand-primary);
  padding: var(--spacing-md);
  color: var(--colors-brand-secondary);
}

/* Theme variants */
[data-theme="dark"] {
  --colors-brand-primary: #1a73e8;
  --colors-brand-secondary: #ffffff;
}
```

### In HTML

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="tokens.css">
</head>
<body>
  <!-- Default theme -->
  <div class="button">Light theme button</div>
  
  <!-- Dark theme -->
  <div data-theme="dark">
    <div class="button">Dark theme button</div>
  </div>
  
  <!-- Theme switcher -->
  <script>
    function setTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }
    
    // setTheme('dark');
    // setTheme('high-contrast');
  </script>
</body>
</html>
```

## 🛠️ Build Scripts Integration

### package.json

```json
{
  "scripts": {
    "tokens": "design-token-manager transform -i tokens.json -o ./src/tokens",
    "tokens:watch": "design-token-manager transform -i tokens.json -o ./src/tokens --watch",
    "build": "npm run tokens && next build",
    "dev": "concurrently \"npm run tokens:watch\" \"next dev\""
  }
}
```

### With Multiple Files

```json
{
  "scripts": {
    "tokens": "design-token-manager transform -i \"tokens/colors.json,tokens/spacing.json,tokens/typography.json\" -o ./src/design-system --prefix ds",
    "tokens:watch": "npm run tokens -- --watch"
  }
}
```

## 📋 API Reference

### TokenTransformer Options

```typescript
interface TransformOptions {
  inputPath: string | string[];    // Input file path(s)
  outputDir: string;               // Output directory
  typescript?: boolean;            // Generate TypeScript (default: true)
  scss?: boolean;                  // Generate SCSS (default: true)
  prefix?: string;                 // Prefix for generated tokens
  watch?: boolean;                 // Enable watch mode (default: false)
  themes?: ThemeVariant[];         // Theme variants
}

interface ThemeVariant {
  name: string;                    // Theme name (e.g., 'dark')
  selector?: string;               // CSS selector (default: [data-theme="name"])
  mediaQuery?: string;             // CSS media query
  tokens: any;                     // Token overrides for this theme
}
```

### CLI Options

```
-i, --input <path>     Input JSON file path(s) (required)
-o, --output <dir>     Output directory (required)
--no-typescript        Skip TypeScript generation
--no-scss             Skip SCSS generation
-p, --prefix <prefix>  Prefix for generated tokens
-w, --watch           Watch for file changes and regenerate
-h, --help            Show help message
-v, --version         Show version
```

## 🤝 Why Design Token Manager?

| Feature | Design Token Manager | style-dictionary | design-tokens |
|---------|-------------|------------------|---------------|
| Dependencies | 0 | 30+ | 50+ |
| Theme Variants | ✅ Built-in | ❌ Manual | ❌ Manual |
| Token References | ✅ Built-in | ✅ Built-in | ❌ |
| Watch Mode | ✅ Built-in | ❌ Manual | ❌ |
| Multiple Inputs | ✅ Built-in | ❌ Manual | ❌ |
| TypeScript Types | ✅ Full support | ❌ Partial | ❌ |
| Bundle Size | 🟢 Tiny | 🟡 Large | 🔴 Huge |

## 📄 License

MIT © [Your Name](https://github.com/yourusername/design-token-manager)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 🐛 Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/yourusername/design-token-manager/issues).

---

Built with ❤️ for design systems that just work. ✨