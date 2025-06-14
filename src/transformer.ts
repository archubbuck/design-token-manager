import fs from 'fs';
import path from 'path';
import { generateTypeScriptTokens } from './transformers/typescript';
import { generateScssTokens } from './transformers/scss';
import { resolveTokenReferences, mergeTokens, processThemeVariants } from './utils';
import { TransformOptions } from './types';

export class TokenTransformer {
  private options: TransformOptions;
  private watchedFiles: string[] = [];

  constructor(options: TransformOptions) {
    this.options = {
      typescript: true,
      scss: true,
      prefix: '',
      watch: false,
      ...options
    };
  }

  private getInputPaths(): string[] {
    return Array.isArray(this.options.inputPath) 
      ? this.options.inputPath 
      : [this.options.inputPath];
  }

  private loadTokenFiles(): any {
    const inputPaths = this.getInputPaths();
    const tokenSets: any[] = [];

    console.log(`📂 Loading ${inputPaths.length} token file(s)...`);

    for (const filePath of inputPaths) {
      try {
        console.log(`  📄 Reading: ${filePath}`);
        const inputData = fs.readFileSync(filePath, 'utf8');
        const tokens = JSON.parse(inputData);
        tokenSets.push(tokens);
      } catch (error) {
        console.error(`❌ Error reading ${filePath}:`, error);
        throw error;
      }
    }

    // Merge all token sets
    const merged = mergeTokens(tokenSets);
    console.log('🔗 Merged all token files');
    
    return merged;
  }

  async transform(): Promise<void> {
    try {
      console.log('🔄 Processing tokens...');
      
      // Load and merge multiple token files
      const rawTokens = this.loadTokenFiles();
      
      // Process theme variants if provided
      const { base, variants } = processThemeVariants(rawTokens, this.options.themes || []);

      // Ensure output directory exists
      if (!fs.existsSync(this.options.outputDir)) {
        fs.mkdirSync(this.options.outputDir, { recursive: true });
      }

      // Generate TypeScript file
      if (this.options.typescript) {
        const tsContent = generateTypeScriptTokens(base, variants, this.options.prefix);
        const tsPath = path.join(this.options.outputDir, 'tokens.ts');
        fs.writeFileSync(tsPath, tsContent);
        console.log(`✅ Generated TypeScript tokens: ${tsPath}`);
      }

      // Generate SCSS file
      if (this.options.scss) {
        const scssContent = generateScssTokens(base, variants, this.options.prefix);
        const scssPath = path.join(this.options.outputDir, 'tokens.scss');
        fs.writeFileSync(scssPath, scssContent);
        console.log(`✅ Generated SCSS tokens: ${scssPath}`);
      }

      if (variants.length > 0) {
        console.log(`🎨 Generated ${variants.length} theme variant(s): ${variants.map(v => v.name).join(', ')}`);
      }

      console.log('🎉 Token transformation complete!');
    } catch (error) {
      console.error('❌ Error transforming tokens:', error);
      if (!this.options.watch) {
        throw error;
      }
    }
  }

  async startWatching(): Promise<void> {
    if (!this.options.watch) {
      return this.transform();
    }

    const inputPaths = this.getInputPaths();
    console.log(`👀 Watching for changes in ${inputPaths.length} file(s):`);
    inputPaths.forEach(path => console.log(`   📁 ${path}`));
    
    // Initial transform
    await this.transform();

    // Set up file watchers for all input files
    for (const filePath of inputPaths) {
      fs.watchFile(filePath, { interval: 100 }, async (curr, prev) => {
        if (curr.mtime !== prev.mtime) {
          console.log(`\n📝 File changed: ${filePath}`);
          console.log('🔄 Regenerating tokens...');
          await this.transform();
        }
      });
      
      // Keep track of watched files for cleanup
      this.watchedFiles.push(filePath);
    }

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n👋 Stopping watch mode...');
      this.stopWatching();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      this.stopWatching();
      process.exit(0);
    });

    // Keep the process alive
    console.log('✨ Watch mode active! Press Ctrl+C to stop.\n');
  }

  stopWatching(): void {
    for (const filePath of this.watchedFiles) {
      fs.unwatchFile(filePath);
    }
    this.watchedFiles = [];
  }
}