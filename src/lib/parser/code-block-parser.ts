import type { TokenEntry } from '@/types';

const CSS_VAR_REGEX = /--([a-zA-Z0-9_-]+)\s*:\s*([^;]+);?\s*(?:\/\*\s*(.+?)\s*\*\/)?/g;
const THEME_SELECTOR_REGEX = /:root\[data-theme=["'](\w+)["']\]/;

interface CodeBlockResult {
  entries: TokenEntry[];
  themeGroups: Map<string, TokenEntry[]>;
}

export function parseCodeBlock(code: string): CodeBlockResult {
  const entries: TokenEntry[] = [];
  const themeGroups = new Map<string, TokenEntry[]>();

  // Split by theme selectors if present
  const themeBlocks = splitByThemeSelectors(code);

  if (themeBlocks.length > 0) {
    for (const block of themeBlocks) {
      const blockEntries = extractCSSVariables(block.code);
      themeGroups.set(block.theme, blockEntries);
      entries.push(...blockEntries);
    }
  } else {
    entries.push(...extractCSSVariables(code));
  }

  return { entries, themeGroups };
}

function extractCSSVariables(code: string): TokenEntry[] {
  const entries: TokenEntry[] = [];
  let match: RegExpExecArray | null;

  // Reset the regex
  const regex = new RegExp(CSS_VAR_REGEX.source, CSS_VAR_REGEX.flags);

  while ((match = regex.exec(code)) !== null) {
    const name = `--${match[1]}`;
    const value = match[2].trim();
    const usage = match[3]?.trim();

    entries.push({
      name,
      value,
      usage,
      extra: {},
    });
  }

  return entries;
}

interface ThemeBlock {
  theme: string;
  code: string;
}

function splitByThemeSelectors(code: string): ThemeBlock[] {
  const blocks: ThemeBlock[] = [];
  const lines = code.split('\n');

  let currentTheme: string | null = null;
  let currentCode: string[] = [];
  let braceDepth = 0;

  for (const line of lines) {
    const themeMatch = line.match(THEME_SELECTOR_REGEX);

    if (themeMatch) {
      // Save previous block if any
      if (currentTheme && currentCode.length > 0) {
        blocks.push({ theme: currentTheme, code: currentCode.join('\n') });
      }
      currentTheme = themeMatch[1];
      currentCode = [];
      braceDepth = 0;
      // Count opening brace on the same line
      if (line.includes('{')) braceDepth++;
    } else if (currentTheme) {
      for (const char of line) {
        if (char === '{') braceDepth++;
        if (char === '}') braceDepth--;
      }
      if (braceDepth <= 0) {
        // Block ended
        blocks.push({ theme: currentTheme, code: currentCode.join('\n') });
        currentTheme = null;
        currentCode = [];
        braceDepth = 0;
      } else {
        currentCode.push(line);
      }
    }
  }

  // Handle unclosed block
  if (currentTheme && currentCode.length > 0) {
    blocks.push({ theme: currentTheme, code: currentCode.join('\n') });
  }

  return blocks;
}
