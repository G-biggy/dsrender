/**
 * Parses CSS property blocks (not variable declarations) into style objects.
 * E.g.: "background: white;\npadding: 12px 24px;\nborder-radius: 16px;"
 */

import type { TokenMap } from '@/types';
import { resolveVar } from '@/lib/design-resolver';

const CSS_PROP_REGEX = /^\s*([\w-]+)\s*:\s*(.+?)\s*;?\s*$/;

export interface CSSPropsBlock {
  label: string; // e.g. "Default", "Hover", "Active", "Disabled"
  styles: Record<string, string>;
}

export function parseCSSPropsFromCode(code: string): CSSPropsBlock[] {
  const lines = code.split('\n');
  const blocks: CSSPropsBlock[] = [];
  let currentLabel = 'Default';
  let currentStyles: Record<string, string> = {};

  for (const line of lines) {
    const trimmed = line.trim();

    // Comment labels like /* Default */ or /* Hover */
    const commentMatch = trimmed.match(/^\/\*\s*(.+?)\s*\*\/$/);
    if (commentMatch) {
      // Save previous block if it has styles
      if (Object.keys(currentStyles).length > 0) {
        blocks.push({ label: currentLabel, styles: { ...currentStyles } });
      }
      currentLabel = commentMatch[1];
      currentStyles = {};
      continue;
    }

    // Skip empty lines, var() references, and @keyframes
    if (!trimmed || trimmed.startsWith('@') || trimmed === '{' || trimmed === '}') continue;

    // Parse property: value
    const propMatch = trimmed.match(CSS_PROP_REGEX);
    if (propMatch) {
      const prop = propMatch[1];
      const value = propMatch[2].replace(/;$/, '').trim();

      // Skip var() references — we can't resolve them
      // But keep the property, just use a placeholder color
      currentStyles[prop] = value;
    }
  }

  // Save last block
  if (Object.keys(currentStyles).length > 0) {
    blocks.push({ label: currentLabel, styles: { ...currentStyles } });
  }

  return blocks;
}

/**
 * Detect what kind of component a heading describes
 */
export type ComponentKind = 'button' | 'input' | 'card' | 'tab' | 'toggle' | 'badge' | 'unknown';

export function detectComponentKind(heading: string): ComponentKind {
  const h = heading.toLowerCase();
  if (/button|btn|cta/i.test(h)) return 'button';
  if (/input|field|text\s*area|form/i.test(h)) return 'input';
  if (/card/i.test(h)) return 'card';
  if (/tab/i.test(h)) return 'tab';
  if (/toggle|switch|selector/i.test(h)) return 'toggle';
  if (/badge|tag|pill|chip/i.test(h)) return 'badge';
  return 'unknown';
}

/**
 * Convert CSS property names to React camelCase style keys.
 * When a designMap is provided, var() references are resolved against
 * the actual tokens defined in the document.
 */
export function cssPropsToReactStyle(styles: Record<string, string>, designMap?: TokenMap): React.CSSProperties {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(styles)) {
    // Convert kebab-case to camelCase
    const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

    let resolvedValue = value;
    if (value.includes('var(') && designMap && designMap.size > 0) {
      // Resolve var() references, handling nested var(--a, var(--b)) by iterating
      // from innermost outward until no var() remains
      let prev = '';
      while (resolvedValue.includes('var(') && resolvedValue !== prev) {
        prev = resolvedValue;
        // Match innermost var() first (no nested parens inside)
        resolvedValue = resolvedValue.replace(/var\(--[^()]+\)/g, (match) => resolveVar(designMap, match));
      }
    }

    result[camelKey] = resolvedValue;
  }
  return result as React.CSSProperties;
}

/**
 * Detect whether a code block is JSX/TSX rather than CSS properties.
 * JSX blocks should not be parsed as component CSS specs.
 */
export function isJSXCodeBlock(code: string): boolean {
  // Strip comments before checking
  const withoutComments = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
  const lines = withoutComments.split('\n').map(l => l.trim()).filter(Boolean);

  let jsxSignals = 0;
  for (const line of lines) {
    if (/className[={]/.test(line)) jsxSignals += 2;
    if (/^<\w/.test(line) || /\/>$/.test(line)) jsxSignals++;
    if (/^import\s/.test(line) || /^export\s/.test(line)) jsxSignals += 2;
    if (/\{\.\.\./.test(line)) jsxSignals++; // spread props
  }

  return jsxSignals >= 2;
}
