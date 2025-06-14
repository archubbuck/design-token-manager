#!/usr/bin/env node

// Simple CLI argument parser (no external deps!)
function parseArgs(args: string[]) {
  const parsed: Record<string, any> = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];
      
      // Handle boolean flags
      if (key.startsWith('no-')) {
        parsed[key.slice(3)] = false;
      } else if (!nextArg || nextArg.startsWith('-')) {
        parsed[key] = true;
      } else {
        parsed[key] = nextArg;
        i++; // Skip next arg as it's the value
      }
    } else if (arg.startsWith('-') && arg.length === 2) {
      const key = arg.slice(1);
      const nextArg = args[i + 1];
      
      if (nextArg && !nextArg.startsWith('-')) {
        parsed[key] = nextArg;
        i++; // Skip next arg as it's the value
      } else {
        parsed[key] = true;
      }
    }
  }
  
  return parsed;
}

function parseInputPaths(inputArg: string): string[] {
  // Support comma-separated paths or glob-like patterns
  if (inputArg.includes(',')) {
    return inputArg.split(',').map(path => path.trim());
  }
  
  // Support space-separated paths in quotes
  if (inputArg.includes(' ')) {
    return inputArg.split(' ').map(path => path.trim());
  }
  
  return [inputArg];
}

function showHelp() {
  console.log(`
Token Forge 🔥 - Transform JSON design tokens into TypeScript and SCSS

Usage:
  token-forge transform [options]

Options:
  -i, --input <path>     Input JSON file path(s) (required)
                         • Single file: tokens.json
                         • Multiple files: "colors.json,spacing.json"
                         • Multiple files: colors.json spacing.json
  -o, --output <dir>     Output directory (required)
  --no-typescript        Skip TypeScript generation
  --no-scss             Skip SCSS generation
  -p, --prefix <prefix>  Prefix for generated tokens
  -w, --watch           Watch for file changes and regenerate
  -h, --help            Show this help message
  -v, --version         Show version

Examples:
  # Single file
  token-forge transform -i tokens.json -o ./src/tokens
  
  # Multiple files (comma-separated)
  token-forge transform -i "colors.json,spacing.json,typography.json" -o ./src/tokens
  
  # Multiple files with watch mode
  token-forge transform -i colors.json spacing.json -o ./src/tokens --watch
  
  # With prefix and multiple files
  token-forge transform -i "base.json,theme.json" -o ./dist --prefix app
`);
}

function showVersion() {
  console.log('Token Forge v1.0.0');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    showHelp();
    return;
  }
  
  if (args.includes('-v') || args.includes('--version')) {
    showVersion();
    return;
  }
  
  if (args[0] !== 'transform') {
    console.error('❌ Unknown command. Use "transform" to transform tokens.');
    showHelp();
    process.exit(1);
  }
  
  const options = parseArgs(args.slice(1));
  
  // Map short flags to long ones
  if (options.i) options.input = options.i;
  if (options.o) options.output = options.o;
  if (options.p) options.prefix = options.p;
  if (options.w) options.watch = options.w;
  
  if (!options.input) {
    console.error('❌ Input file(s) required. Use -i or --input');
    process.exit(1);
  }
  
  if (!options.output) {
    console.error('❌ Output directory is required. Use -o or --output');
    process.exit(1);
  }
  
  // Parse input paths (support multiple files)
  const inputPaths = parseInputPaths(options.input);
  
  const { TokenTransformer } = await import('./transformer');
  
  const transformer = new TokenTransformer({
    inputPath: inputPaths.length === 1 ? inputPaths[0] : inputPaths,
    outputDir: options.output,
    typescript: options.typescript !== false,
    scss: options.scss !== false,
    prefix: options.prefix || '',
    watch: options.watch === true
  });

  try {
    if (options.watch) {
      await transformer.startWatching();
    } else {
      await transformer.transform();
    }
  } catch (error) {
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}