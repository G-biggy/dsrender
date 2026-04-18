import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stripBackticks(s: string): string {
  return s.replace(/^`+|`+$/g, '').trim();
}

export function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value.trim());
}

export function isRgbaColor(value: string): boolean {
  return /^rgba?\s*\(/.test(value.trim());
}

export function isColor(value: string): boolean {
  return isHexColor(value) || isRgbaColor(value);
}

export function normalizeHex(value: string): string {
  const v = value.trim();
  if (!isHexColor(v)) return v;
  if (v.length === 4) {
    return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  }
  return v;
}

export function parsePxValue(value: string): number | null {
  const trimmed = value.trim();
  const pxMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*px$/i);
  if (pxMatch) return parseFloat(pxMatch[1]);

  const remMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*rem$/i);
  if (remMatch) return parseFloat(remMatch[1]) * 16;

  const numMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)$/);
  if (numMatch) return parseFloat(numMatch[1]);

  return null;
}

export function luminance(hex: string): number {
  const h = normalizeHex(hex).replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function isLightColor(hex: string): boolean {
  return luminance(hex) > 0.7;
}
