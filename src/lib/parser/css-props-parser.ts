/**
 * Parses CSS property blocks (not variable declarations) into style objects.
 * E.g.: "background: white;\npadding: 12px 24px;\nborder-radius: 16px;"
 */

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
 * Convert CSS property names to React camelCase style keys
 */
export function cssPropsToReactStyle(styles: Record<string, string>): React.CSSProperties {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(styles)) {
    // Convert kebab-case to camelCase
    const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

    // Resolve var() references to placeholder values
    let resolvedValue = value;
    if (value.includes('var(')) {
      resolvedValue = resolveVarPlaceholder(key, value);
    }

    result[camelKey] = resolvedValue;
  }
  return result as React.CSSProperties;
}

function resolveVarPlaceholder(prop: string, value: string): string {
  // Try to extract a meaningful fallback from the var name
  const varMatch = value.match(/var\(--([^)]+)\)/);
  if (!varMatch) return value;

  const varName = varMatch[1].toLowerCase();

  // Color-related vars
  if (prop === 'background' || prop === 'background-color' || prop === 'color' || prop === 'border-color') {
    // Check numbered grays (most specific first to avoid gray-50 matching gray-500)
    if (/gray-900\b/.test(varName)) return '#111827';
    if (/gray-800\b/.test(varName)) return '#1F2937';
    if (/gray-700\b/.test(varName)) return '#374151';
    if (/gray-600\b/.test(varName)) return '#4B5563';
    if (/gray-500\b/.test(varName)) return '#6B7280';
    if (/gray-400\b/.test(varName)) return '#9CA3AF';
    if (/gray-300\b/.test(varName)) return '#D1D5DB';
    if (/gray-200\b/.test(varName)) return '#E5E7EB';
    if (/gray-100\b/.test(varName)) return '#F3F4F6';
    if (/gray-50\b/.test(varName)) return '#F9FAFB';
    // Brand colors (check numbered variants first)
    if (/primary-700\b/.test(varName)) return '#C2410C';
    if (/primary-600\b/.test(varName)) return '#EA580C';
    if (/primary-500\b/.test(varName)) return '#F97316';
    if (/primary-100\b/.test(varName)) return '#FFEDD5';
    if (/primary-50\b/.test(varName)) return '#FFF7ED';
    if (varName.includes('primary')) return '#F97316';
    // Semantic colors
    if (varName.includes('error') || varName.includes('red')) return '#EF4444';
    if (varName.includes('success') || varName.includes('green')) return '#22C55E';
    if (varName.includes('warning') || varName.includes('yellow')) return '#F59E0B';
    if (varName.includes('info') || varName.includes('blue')) return '#3B82F6';
    if (varName.includes('accent')) return '#9810FA';
    return '#6B7280';
  }

  // Shadow vars
  if (prop === 'box-shadow') {
    if (varName.includes('sm')) return '0 1px 2px rgba(0,0,0,0.05)';
    if (varName.includes('md')) return '0 4px 6px rgba(0,0,0,0.1)';
    if (varName.includes('lg')) return '0 10px 15px rgba(0,0,0,0.1)';
    if (varName.includes('xl')) return '0 20px 25px rgba(0,0,0,0.15)';
  }

  return value;
}
