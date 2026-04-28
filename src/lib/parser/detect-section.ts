import type { SectionType } from '@/types';

const HEADING_PATTERNS: Record<SectionType, RegExp[]> = {
  colors: [/colou?rs?/i, /palette/i, /brand.*colou?r/i, /accent/i, /semantic.*colou?r/i, /background.*colou?r/i],
  typography: [/typography/i, /type\s*scale/i, /fonts?/i, /text\s*styles?/i],
  spacing: [/spacing/i, /space/i, /padding/i, /gap/i, /margins?/i],
  shadows: [/shadows?/i, /elevation/i, /depth/i],
  radius: [/radius/i, /radii/i, /corner/i, /rounding/i, /border.*radius/i, /shapes?$/i, /rounded/i],
  breakpoints: [/breakpoints?/i, /responsive/i, /screen\s*sizes?/i, /media\s*quer/i],
  motion: [/motion/i, /animation/i, /timing/i, /easing/i, /transition/i],
  effects: [/effects?/i, /glow/i, /blur/i, /backdrop/i, /filter/i],
  layout: [/^layout$/i, /layout\s*&/i, /grid/i, /container/i],
  zindex: [/z-?\s*index/i, /z-?\s*order/i, /stacking/i, /layer\s*order/i],
  components: [/components?$/i, /component\s*(example|styling|spec)/i],
  icons: [/icons?$/i, /icon\s*sizes?/i, /iconography/i],
  unknown: [],
};

const COLUMN_PATTERNS: Record<string, SectionType> = {};

export function detectSectionByHeading(heading: string): SectionType {
  const cleaned = heading
    .replace(/^\d+\.\d*\s*/, '') // strip numbered prefixes like "2.1"
    .trim();

  for (const [type, patterns] of Object.entries(HEADING_PATTERNS)) {
    if (type === 'unknown') continue;
    for (const pattern of patterns) {
      if (pattern.test(cleaned)) {
        return type as SectionType;
      }
    }
  }
  return 'unknown';
}

export function detectSectionByColumns(headers: string[]): SectionType | null {
  const h = headers.map((c) => c.toLowerCase().trim());

  // Colors: has hex/color/value column + token/name column
  if (
    h.some((c) => /^(hex|colou?r|value)$/.test(c)) &&
    h.some((c) => /^(token|name|variable)$/.test(c))
  ) {
    return 'colors';
  }

  // Typography: has size or font or weight column
  if (h.some((c) => /size|font|weight/.test(c)) && h.some((c) => /role|element|style/i.test(c))) {
    return 'typography';
  }

  // Spacing: has value column + token with spacing-like names
  if (h.some((c) => /^(token|name)$/.test(c)) && h.some((c) => /^(value|desktop|mobile)$/.test(c))) {
    // Could be spacing or breakpoints — check if it's under a spacing heading
    return null; // Let heading detection take priority
  }

  return null;
}

export function detectSectionByVariablePrefix(varName: string): SectionType | null {
  const name = varName.toLowerCase();
  if (/^(color|bg|text|border-color|accent)/.test(name)) return 'colors';
  if (/^(font|text-|type)/.test(name)) return 'typography';
  if (/^(space|gap|padding|margin)/.test(name)) return 'spacing';
  if (/^(shadow|elevation)/.test(name)) return 'shadows';
  if (/^(radius|rounded|corner)/.test(name)) return 'radius';
  return null;
}
