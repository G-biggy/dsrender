export type SectionType =
  | 'colors'
  | 'typography'
  | 'spacing'
  | 'shadows'
  | 'radius'
  | 'breakpoints'
  | 'motion'
  | 'components'
  | 'icons'
  | 'effects'
  | 'layout'
  | 'zindex'
  | 'unknown';

export interface DesignTokenDocument {
  title: string;
  sections: TokenSection[];
}

export interface ContentBlock {
  kind: 'paragraph' | 'code' | 'list' | 'blockquote' | 'table' | 'thematicBreak';
  text?: string;        // For paragraph, blockquote
  lang?: string;        // For code blocks
  code?: string;        // For code blocks
  items?: string[];     // For lists
  ordered?: boolean;    // For lists
  headers?: string[];   // For tables
  rows?: string[][];    // For tables
}

export interface TokenSection {
  type: SectionType;
  heading: string;
  level: number;
  tokens: TokenEntry[];
  subsections: TokenSection[];
  rawMarkdown: string;
  content: ContentBlock[]; // All content blocks for rendering non-token sections
}

export interface TokenEntry {
  name: string;
  value: string;
  usage?: string;
  extra: Record<string, string>;
}

export interface ColorToken extends TokenEntry {
  hex: string;
}

export interface TypographyToken extends TokenEntry {
  font?: string;
  weight?: string;
  size?: string;
  lineHeight?: string;
}

export interface SpacingToken extends TokenEntry {
  px: number;
}

export interface ShadowToken extends TokenEntry {
  cssValue: string;
}

export interface RadiusToken extends TokenEntry {
  cssValue: string;
}

export interface BreakpointToken extends TokenEntry {
  px: number;
}
