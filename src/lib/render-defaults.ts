/**
 * Single decorative color used by every renderer that needs to draw a shape,
 * tile, marker, or fill where the user's MD didn't specify a color.
 *
 * Wherever you'd be tempted to pick "a nice color" — use these instead.
 * The footer note in PreviewPane tells the user what this is and how to override.
 */
export const DEFAULT_ACCENT = '#6366F1';

export const DEFAULT_ACCENT_TINTS = {
  /** Lightest fill — tile/specimen backgrounds */
  faint: '#EEF2FF',
  /** Soft fill — secondary surfaces */
  soft: '#E0E7FF',
  /** Mid fill — borders, secondary marks */
  mid: '#A5B4FC',
  /** Edge — primary borders, dividers */
  edge: '#818CF8',
  /** Solid — primary fills, dots */
  solid: '#6366F1',
  /** Deep — high-contrast text on tints */
  deep: '#4338CA',
} as const;

/**
 * Opacity-stepped scale for layered visualizations (z-index stack, etc).
 * Index 0 = lightest, last = densest.
 */
export function accentOpacityScale(steps: number): string[] {
  if (steps <= 1) return [`${DEFAULT_ACCENT}FF`];
  const minOpacity = 0.18;
  const maxOpacity = 1.0;
  const out: string[] = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const op = minOpacity + (maxOpacity - minOpacity) * t;
    const hex = Math.round(op * 255).toString(16).padStart(2, '0');
    out.push(`${DEFAULT_ACCENT}${hex}`);
  }
  return out;
}

/**
 * Returns `hex` with an alpha applied as 8-digit hex (#RRGGBBAA).
 * If `hex` isn't a valid 3- or 6-digit hex, falls back to DEFAULT_ACCENT.
 */
export function tintAt(hex: string, alpha: number): string {
  const base = hex.startsWith('#') && (hex.length === 7 || hex.length === 4) ? hex : DEFAULT_ACCENT;
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, '0');
  return `${base}${a}`;
}
