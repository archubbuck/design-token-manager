export interface DesignToken {
  value: string | number;
  type?: 'color' | 'spacing' | 'typography' | 'shadow' | 'border' | 'size';
  description?: string;
  category?: string;
}

export interface TokenGroup {
  [key: string]: DesignToken | TokenGroup;
}

export interface ThemeVariant {
  name: string;
  selector?: string;
  mediaQuery?: string;
  tokens: any;
}

export interface TransformOptions {
  inputPath: string | string[];
  outputDir: string;
  typescript?: boolean;
  scss?: boolean;
  prefix?: string;
  watch?: boolean;
  themes?: ThemeVariant[];
}