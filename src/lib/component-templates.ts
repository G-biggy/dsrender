import type { TokenMap } from '@/types';
import type { ComponentKind } from './parser/css-props-parser';
import { lookupDesignValue } from './design-resolver';

interface TemplateStyles {
  default: React.CSSProperties;
  hover?: React.CSSProperties;
  disabled?: React.CSSProperties;
}

/**
 * Slot definition: a CSS property and an ordered list of token keys to try.
 * First match wins.
 */
// Shared radius lookups in priority order
const RADIUS_SM: string[] = ['radius-sm', 'rounded.sm', 'sm', 'radius-md'];
const RADIUS_MD: string[] = ['radius-md', 'rounded.md', 'rounded.DEFAULT', 'DEFAULT', 'radius-lg'];
const RADIUS_LG: string[] = ['radius-lg', 'rounded.lg', 'radius-xl', 'rounded.DEFAULT', 'DEFAULT'];

// Shared font lookups
const FONT_BODY: string[] = ['body-md.fontFamily', 'body.fontFamily', 'typography.body-md.fontFamily'];

/**
 * Generate styles for a component kind using the design system's actual tokens.
 * Returns null if fewer than 2 meaningful slots resolve (not enough data to render).
 */
export function generateTemplateStyles(
  kind: ComponentKind,
  designMap: TokenMap,
): TemplateStyles | null {
  if (designMap.size === 0) return null;

  switch (kind) {
    case 'button':
      return generateButton(designMap);
    case 'card':
      return generateCard(designMap);
    case 'input':
      return generateInput(designMap);
    case 'tab':
      return generateTab(designMap);
    case 'toggle':
      return generateToggle(designMap);
    case 'badge':
      return generateBadge(designMap);
    default:
      return null;
  }
}

function generateButton(dm: TokenMap): TemplateStyles | null {
  const bg = lookupDesignValue(dm,
    'primary-container', 'color-primary-500', 'primary-500', 'primary',
    'color-primary', 'brand', 'accent-500', 'accent',
  );
  const fg = lookupDesignValue(dm,
    'on-primary-container', 'on-primary', 'color-primary-foreground',
  );
  const radius = lookupDesignValue(dm, ...RADIUS_MD);
  const font = lookupDesignValue(dm, ...FONT_BODY);
  const hoverBg = lookupDesignValue(dm,
    'primary-fixed-dim', 'color-primary-600', 'primary-600',
    'color-primary-700', 'primary-700',
  );

  if (!bg) return null;

  const defaultStyle: React.CSSProperties = {
    background: bg,
    color: fg || (isLight(bg) ? '#1a1a1a' : '#ffffff'),
    padding: '10px 24px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 0.15s ease',
  };
  if (radius) defaultStyle.borderRadius = radius;
  if (font) defaultStyle.fontFamily = font;

  return {
    default: defaultStyle,
    hover: hoverBg ? { background: hoverBg } : undefined,
  };
}

function generateCard(dm: TokenMap): TemplateStyles | null {
  const bg = lookupDesignValue(dm,
    'surface-container', 'surface-container-low', 'color-bg-secondary',
    'color-gray-50', 'gray-50', 'surface',
  );
  const border = lookupDesignValue(dm,
    'outline-variant', 'outline', 'color-gray-200', 'gray-200',
  );
  const radius = lookupDesignValue(dm, ...RADIUS_LG);
  const shadow = lookupDesignValue(dm,
    'shadow-sm', 'shadow-md', 'elevation-1',
  );
  const textColor = lookupDesignValue(dm,
    'on-surface', 'color-gray-800', 'gray-800', 'on-background',
  );
  // Need at least a background or border to render meaningfully
  if (!bg && !border) return null;

  const style: React.CSSProperties = {
    padding: '20px',
    minHeight: '100px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  };
  if (bg) style.background = bg;
  if (border) style.border = `1px solid ${border}`;
  if (radius) style.borderRadius = radius;
  if (shadow) style.boxShadow = shadow;

  if (textColor) style.color = textColor;

  return {
    default: style,
    hover: shadow ? { boxShadow: lookupDesignValue(dm, 'shadow-md', 'shadow-lg') || undefined } : undefined,
  };
}

function generateInput(dm: TokenMap): TemplateStyles | null {
  const bg = lookupDesignValue(dm,
    'surface-container-lowest', 'surface-container-low',
    'color-bg-secondary', 'surface',
  );
  const border = lookupDesignValue(dm,
    'outline', 'outline-variant', 'color-gray-200', 'gray-200',
  );
  const radius = lookupDesignValue(dm, ...RADIUS_MD);
  const textColor = lookupDesignValue(dm,
    'on-surface', 'color-gray-800', 'gray-800',
  );
  const focusBorder = lookupDesignValue(dm,
    'primary', 'primary-container', 'surface-tint',
    'color-primary-500', 'primary-500',
  );
  const font = lookupDesignValue(dm, ...FONT_BODY);

  if (!bg && !border) return null;

  const style: React.CSSProperties = {
    padding: '10px 14px',
    fontSize: '14px',
    outline: 'none',
    width: '280px',
    boxSizing: 'border-box',
  };
  if (bg) style.background = bg;
  if (border) style.border = `1px solid ${border}`;
  if (radius) style.borderRadius = radius;
  if (textColor) style.color = textColor;
  if (font) style.fontFamily = font;

  return {
    default: style,
    hover: focusBorder ? { borderColor: focusBorder } : undefined,
  };
}

function generateTab(dm: TokenMap): TemplateStyles | null {
  const containerBg = lookupDesignValue(dm,
    'surface-container-high', 'surface-container', 'color-gray-100', 'gray-100',
  );
  const activeBg = lookupDesignValue(dm,
    'surface-container-lowest', 'surface', 'color-bg-secondary',
  );
  const activeText = lookupDesignValue(dm,
    'on-surface', 'color-gray-800', 'gray-800',
  );
  const inactiveText = lookupDesignValue(dm,
    'on-surface-variant', 'color-gray-500', 'gray-500',
  );
  const radius = lookupDesignValue(dm, ...RADIUS_MD);

  if (!containerBg) return null;

  return {
    default: {
      background: containerBg,
      borderRadius: radius || '8px',
      padding: '4px',
      display: 'flex',
      gap: '2px',
    },
    // Active tab style stored as hover (reused by renderer)
    hover: {
      background: activeBg || '#ffffff',
      color: activeText || '#1F2937',
      padding: '8px 16px',
      borderRadius: radius ? `calc(${radius} - 2px)` : '6px',
      fontWeight: 500,
      fontSize: '14px',
      boxShadow: lookupDesignValue(dm, 'shadow-sm') || '0 1px 2px rgba(0,0,0,0.05)',
    },
    disabled: {
      // Inactive tab
      color: inactiveText || '#6B7280',
      padding: '8px 16px',
      borderRadius: radius ? `calc(${radius} - 2px)` : '6px',
      fontWeight: 500,
      fontSize: '14px',
      cursor: 'pointer',
    },
  };
}

function generateToggle(dm: TokenMap): TemplateStyles | null {
  const containerBg = lookupDesignValue(dm,
    'surface-container-high', 'surface-container', 'color-gray-100', 'gray-100',
  );
  const activeBg = lookupDesignValue(dm,
    'primary-container', 'color-primary-500', 'primary-500', 'primary',
  );
  const activeText = lookupDesignValue(dm,
    'on-primary-container', 'on-primary',
  );
  const inactiveText = lookupDesignValue(dm,
    'on-surface-variant', 'color-gray-500', 'gray-500',
  );
  const radius = lookupDesignValue(dm, ...RADIUS_SM);

  if (!containerBg && !activeBg) return null;

  return {
    default: {
      background: containerBg || '#F3F4F6',
      borderRadius: radius || '8px',
      padding: '4px',
      display: 'inline-flex',
      gap: '2px',
    },
    hover: {
      // Active option
      background: activeBg || '#F97316',
      color: activeText || (activeBg && isLight(activeBg) ? '#1a1a1a' : '#ffffff'),
      padding: '6px 12px',
      borderRadius: radius ? `calc(${radius} - 2px)` : '6px',
      fontWeight: 500,
      fontSize: '14px',
    },
    disabled: {
      // Inactive option
      color: inactiveText || '#6B7280',
      padding: '6px 12px',
      borderRadius: radius ? `calc(${radius} - 2px)` : '6px',
      fontWeight: 500,
      fontSize: '14px',
      cursor: 'pointer',
    },
  };
}

function generateBadge(dm: TokenMap): TemplateStyles | null {
  const bg = lookupDesignValue(dm,
    'secondary-container', 'color-gray-100', 'gray-100',
    'surface-container-high',
  );
  const fg = lookupDesignValue(dm,
    'on-secondary-container', 'color-gray-700', 'gray-700',
    'on-surface',
  );
  const radius = lookupDesignValue(dm, ...RADIUS_SM);

  if (!bg) return null;

  return {
    default: {
      background: bg,
      color: fg || '#374151',
      padding: '4px 10px',
      fontSize: '12px',
      fontWeight: 500,
      borderRadius: radius || '4px',
      display: 'inline-flex',
      alignItems: 'center',
    },
  };
}

/** Quick luminance check to pick text color. Handles hex, rgb(), named colors. */
function isLight(color: string): boolean {
  // Try hex
  let hex = color.replace('#', '');
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150;
  }
  // Try rgb(r, g, b)
  const rgbMatch = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150;
  }
  // Named colors that are clearly light
  const lightNames = ['white', 'snow', 'ivory', 'lightyellow', 'lightest', 'linen'];
  if (lightNames.some(n => color.toLowerCase().includes(n))) return true;
  // Default: assume dark
  return false;
}
