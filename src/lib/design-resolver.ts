import type { DesignTokenDocument, TokenSection, TokenMap } from '@/types';

/**
 * Builds a flat lookup map from ALL tokens across every section in the document.
 * Used by component renderers to resolve var(--x) references against
 * the actual values defined in the same design system.
 *
 * Keys are registered in multiple formats for fuzzy matching:
 *   CSS var name:     "color-primary-500"
 *   Prefixed:         "colors.primary-500"
 *   Bare:             "primary-500"
 *   Typography sub:   "headline-lg.fontFamily"
 */
export function buildDesignMap(doc: DesignTokenDocument): TokenMap {
  const map: TokenMap = new Map();

  function walkSection(section: TokenSection) {
    const sectionType = section.type;

    for (const token of section.tokens) {
      const name = token.name;
      const value = token.value;

      // 1. Register the raw name (handles CSS var names like --color-primary-500)
      if (name.startsWith('--')) {
        const stripped = name.slice(2);
        map.set(stripped, value);
        // Also register without common prefixes for fuzzy matching
        const bare = stripped.replace(/^color-/, '').replace(/^spacing-/, '').replace(/^radius-/, '').replace(/^shadow-/, '');
        if (bare !== stripped) map.set(bare, value);
      } else {
        // 2. YAML-style tokens: register with section prefix and bare
        map.set(name, value);

        if (sectionType !== 'unknown') {
          // "colors.primary-container" format
          map.set(`${sectionType}.${name}`, value);

          // CSS var-compatible format: "color-primary-container"
          const singularPrefix = sectionType === 'colors' ? 'color' :
            sectionType === 'shadows' ? 'shadow' :
            sectionType === 'radius' ? 'radius' :
            sectionType === 'spacing' ? 'spacing' :
            sectionType;
          map.set(`${singularPrefix}-${name}`, value);
        }
      }

      // 3. Typography sub-properties (fontFamily, fontWeight, etc.)
      if (token.extra && Object.keys(token.extra).length > 0) {
        for (const [prop, val] of Object.entries(token.extra)) {
          map.set(`${name}.${prop}`, val);
          if (sectionType !== 'unknown') {
            map.set(`${sectionType}.${name}.${prop}`, val);
          }
        }
      }

      // 4. Register usage comment as a hint
      if (token.usage) {
        map.set(`${name}.usage`, token.usage);
      }
    }

    for (const sub of section.subsections) {
      walkSection(sub);
    }
  }

  for (const section of doc.sections) {
    walkSection(section);
  }

  return map;
}

/**
 * Resolve a CSS var() expression against the design map.
 * Handles: var(--foo), var(--foo, fallback), nested var().
 */
export function resolveVar(designMap: TokenMap, varExpr: string): string {
  // Extract var name and optional fallback
  const match = varExpr.match(/var\(\s*--([^,)]+?)(?:\s*,\s*(.+))?\s*\)/);
  if (!match) return varExpr;

  const varName = match[1].trim();
  const fallback = match[2]?.trim();

  // Try exact match
  let resolved = designMap.get(varName);
  if (resolved) return resolved;

  // Try without common prefixes
  const withoutPrefix = varName
    .replace(/^color-/, '')
    .replace(/^spacing-/, '')
    .replace(/^radius-/, '')
    .replace(/^shadow-/, '');
  resolved = designMap.get(withoutPrefix);
  if (resolved) return resolved;

  // Try suffix match (e.g., "primary-500" matches a token registered as "primary-500")
  for (const [key, val] of designMap) {
    if (key.endsWith(`.${varName}`) || key.endsWith(`-${varName}`)) {
      return val;
    }
  }

  // Try the fallback value
  if (fallback) {
    if (fallback.includes('var(')) {
      return resolveVar(designMap, fallback);
    }
    return fallback;
  }

  // Return the original expression unchanged
  return varExpr;
}

/**
 * Look up a design value by trying multiple key patterns.
 * Used by component templates to find the best matching value.
 */
export function lookupDesignValue(designMap: TokenMap, ...candidates: string[]): string | null {
  for (const key of candidates) {
    const val = designMap.get(key);
    if (val) return val;
  }
  return null;
}
