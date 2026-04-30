'use client';

import { useEffect } from 'react';
import type { TokenSection, TokenEntry } from '@/types';

const SAMPLE_TEXT = 'The quick brown fox jumps over the lazy dog';

const WEIGHT_MAP: Record<string, number> = {
  thin: 100, hairline: 100, extralight: 200, ultralight: 200,
  light: 300, regular: 400, normal: 400, medium: 500,
  semibold: 600, demibold: 600, bold: 700, extrabold: 800,
  ultrabold: 800, black: 900, heavy: 900,
};

function parseWeight(value: string): number {
  const num = parseInt(value);
  if (!isNaN(num)) return num;
  const cleaned = value.replace(/[^a-zA-Z]/g, '').toLowerCase();
  return WEIGHT_MAP[cleaned] ?? 400;
}

interface ParsedTypography {
  role: string;
  font?: string;
  size?: string;
  weight?: string;
  lineHeight?: string;
}

interface FontFamily {
  name: string;
  stack: string;
  role?: string;
}

/**
 * Parse a fenced code block written as `Key: Value` lines, e.g.:
 *
 *     Font:     Manrope
 *     Size:     64px
 *     Weight:   700
 *     Line-H:   1.0
 *     Spacing:  -1.92px
 *     Color:    #ffffff
 */
function parseCodeBlockAsPreset(role: string, code: string, sectionFont?: string): ParsedTypography | null {
  const fields: Record<string, string> = {};
  for (const line of code.split('\n')) {
    const m = line.match(/^\s*([\w\s/.-]+?):\s*(.+?)\s*$/);
    if (m) fields[m[1].trim().toLowerCase()] = m[2].trim();
  }
  const get = (...keys: string[]) => keys.map((k) => fields[k]).find(Boolean);
  const size = get('size', 'font size', 'font-size', 'fontsize');
  if (!size) return null;
  return {
    role,
    font: get('font', 'font family', 'font-family', 'fontfamily', 'family') || sectionFont,
    size,
    weight: get('weight', 'font weight', 'font-weight', 'fontweight'),
    lineHeight: get('line-h', 'line height', 'line-height', 'lineheight'),
  };
}

function parseTypographyEntry(entry: TokenEntry, sectionFont?: string): ParsedTypography {
  const result: ParsedTypography = { role: entry.name };

  if (/^\d/.test(entry.value)) {
    result.size = entry.value;
  }

  const allFields = { ...entry.extra };
  if (entry.value && !/^\d/.test(entry.value)) {
    allFields['value'] = entry.value;
  }

  for (const [key, val] of Object.entries(allFields)) {
    const k = key.toLowerCase();
    if (k === 'font' || k === 'fontfamily' || k === 'font family' || k === 'font-family' || k === 'family') {
      result.font = val;
    } else if (k === 'weight' || k === 'fontweight' || k === 'font weight' || k === 'font-weight') {
      result.weight = val;
    } else if (k === 'size' || k === 'fontsize' || k === 'font size' || k === 'font-size') {
      result.size = val;
    } else if (k === 'lineheight' || k === 'line height' || k === 'line-height') {
      result.lineHeight = val;
    } else if (k.includes('desktop') || k.includes('1280')) {
      result.size = val;
    }
  }

  if (!result.font && sectionFont) {
    result.font = sectionFont;
  }

  return result;
}

/** A font family token has a stack-like value (commas, multiple names) and no size. */
function looksLikeFontStack(value: string): boolean {
  if (/^\d/.test(value)) return false;
  return value.includes(',') || /\bsans-?serif\b|\bserif\b|\bmonospace\b/i.test(value);
}

function tokensToFontFamilies(tokens: TokenEntry[]): FontFamily[] {
  return tokens
    .filter((t) => looksLikeFontStack(t.value) || looksLikeFontStack(t.extra.stack || ''))
    .map((t) => {
      const stack = t.extra.stack || t.value;
      const role = t.extra.role || t.extra.usage || t.usage;
      return { name: t.name, stack, role };
    });
}

function tokensToSpecimens(tokens: TokenEntry[], sectionFont?: string): ParsedTypography[] {
  return tokens
    .map((t) => parseTypographyEntry(t, sectionFont))
    .filter((s) => !!s.size);
}

function classifySubsection(heading: string): 'font-family' | 'scale' | 'presets' | 'other' {
  const h = heading.toLowerCase();
  if (/family|families|fonts?\b|stack/.test(h)) return 'font-family';
  if (/scale|sizes?|tokens?/.test(h)) return 'scale';
  if (/presets?|roles?|styles?|specimens?/.test(h)) return 'presets';
  return 'other';
}

interface CollectedSpecimens {
  fontFamilies: FontFamily[];
  scale: ParsedTypography[];
  presets: ParsedTypography[];
}

function collectAll(section: TokenSection, sectionFont?: string): CollectedSpecimens {
  const result: CollectedSpecimens = { fontFamilies: [], scale: [], presets: [] };

  // Section-level tokens default to "scale"
  for (const spec of tokensToSpecimens(section.tokens, sectionFont)) {
    result.scale.push(spec);
  }

  for (const sub of section.subsections) {
    const kind = classifySubsection(sub.heading);

    if (kind === 'font-family') {
      result.fontFamilies.push(...tokensToFontFamilies(sub.tokens));
      continue;
    }

    if (kind === 'scale') {
      result.scale.push(...tokensToSpecimens(sub.tokens, sectionFont));
      continue;
    }

    if (kind === 'presets') {
      // Subsections of "Presets" are typically named preset blocks (Hero, Body, etc.)
      // each with a Key:Value code block.
      for (const presetSub of sub.subsections) {
        const codeBlock = presetSub.content.find((b) => b.kind === 'code' && b.code);
        if (codeBlock?.code) {
          const preset = parseCodeBlockAsPreset(presetSub.heading, codeBlock.code, sectionFont);
          if (preset) result.presets.push(preset);
        }
        // Also support tokens-as-presets if someone uses a table inside
        result.presets.push(...tokensToSpecimens(presetSub.tokens, sectionFont));
      }
      // And a code block directly under "Presets" with a single preset
      const directCode = sub.content.find((b) => b.kind === 'code' && b.code);
      if (directCode?.code) {
        const preset = parseCodeBlockAsPreset(sub.heading, directCode.code, sectionFont);
        if (preset) result.presets.push(preset);
      }
      result.presets.push(...tokensToSpecimens(sub.tokens, sectionFont));
      continue;
    }

    // Fallback: treat unclassified subsections as scale-ish
    result.scale.push(...tokensToSpecimens(sub.tokens, sectionFont));
    // Also walk one level deeper for code-block presets
    for (const inner of sub.subsections) {
      const codeBlock = inner.content.find((b) => b.kind === 'code' && b.code);
      if (codeBlock?.code) {
        const preset = parseCodeBlockAsPreset(inner.heading, codeBlock.code, sectionFont);
        if (preset) result.presets.push(preset);
      }
    }
  }

  return result;
}

function extractSectionFont(section: TokenSection): string | undefined {
  const fontMatch = section.rawMarkdown?.match(/\*\*Font family:\*\*\s*(.+)/i)
    || section.rawMarkdown?.match(/Font family:\s*(.+)/i);
  if (fontMatch) return fontMatch[1].trim();
  return undefined;
}

const SYSTEM_FONTS = ['helvetica', 'arial', 'system-ui', 'sans-serif', 'serif', 'monospace', 'inherit', 'menlo', 'georgia', 'courier', 'times'];

function loadGoogleFont(fontName: string) {
  if (typeof document === 'undefined') return;
  if (SYSTEM_FONTS.some((f) => fontName.toLowerCase().includes(f))) return;
  const encoded = fontName.replace(/\s+/g, '+');
  const id = `gfont-${encoded}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}

function firstFontName(stack: string | undefined): string | undefined {
  if (!stack) return undefined;
  return stack.split(',')[0].replace(/['"`]/g, '').trim();
}

function useGoogleFonts(fontNames: (string | undefined)[]) {
  const key = fontNames.filter(Boolean).join('|');
  useEffect(() => {
    for (const name of fontNames) {
      const first = firstFontName(name);
      if (first) loadGoogleFont(first);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

const SUB_HEADING_STYLE: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#6B7280',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '14px',
};

function SpecimenItem({ spec }: { spec: ParsedTypography }) {
  return (
    <div style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: '20px' }}>
      <div
        style={{
          fontFamily: spec.font ? `"${firstFontName(spec.font)}", ${spec.font}, sans-serif` : 'inherit',
          fontSize: spec.size,
          fontWeight: spec.weight ? parseWeight(spec.weight) : 400,
          lineHeight: spec.lineHeight || 1.3,
          color: '#1F2937',
          marginBottom: '8px',
          overflowWrap: 'break-word',
        }}
      >
        {SAMPLE_TEXT}
      </div>
      <div
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          fontSize: '12px',
          color: '#9CA3AF',
          fontFamily: 'monospace',
        }}
      >
        <span style={{ color: '#6B7280', fontWeight: 600 }}>{spec.role}</span>
        {spec.font && <span>{firstFontName(spec.font)}</span>}
        {spec.size && <span>{spec.size}</span>}
        {spec.weight && <span>w{spec.weight}</span>}
        {spec.lineHeight && <span>/{spec.lineHeight}</span>}
      </div>
    </div>
  );
}

function FontFamilyCard({ family }: { family: FontFamily }) {
  const first = firstFontName(family.stack);
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '20px 24px',
        flex: '1 1 240px',
        minWidth: '240px',
        maxWidth: '420px',
      }}
    >
      <div
        style={{
          fontFamily: first ? `"${first}", ${family.stack}, sans-serif` : 'inherit',
          fontSize: '32px',
          lineHeight: 1.1,
          color: '#1F2937',
          marginBottom: '10px',
        }}
      >
        {first || 'Aa'}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
        {family.name}
      </div>
      <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#9CA3AF', marginBottom: family.role ? '8px' : 0, wordBreak: 'break-word' }}>
        {family.stack}
      </div>
      {family.role && (
        <div style={{ fontSize: '11px', color: '#6B7280', lineHeight: 1.4 }}>
          {family.role}
        </div>
      )}
    </div>
  );
}

export function TypographySpecimen({ section }: { section: TokenSection }) {
  const sectionFont = extractSectionFont(section);
  const { fontFamilies, scale, presets } = collectAll(section, sectionFont);

  const allFonts = [
    sectionFont,
    ...fontFamilies.map((f) => f.stack),
    ...scale.map((s) => s.font),
    ...presets.map((p) => p.font),
  ];
  useGoogleFonts(allFonts);

  if (fontFamilies.length === 0 && scale.length === 0 && presets.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {fontFamilies.length > 0 && (
        <div>
          <div style={SUB_HEADING_STYLE}>Font Families</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {fontFamilies.map((family, i) => (
              <FontFamilyCard key={i} family={family} />
            ))}
          </div>
        </div>
      )}

      {scale.length > 0 && (
        <div>
          <div style={SUB_HEADING_STYLE}>Scale</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {scale.map((spec, i) => (
              <SpecimenItem key={i} spec={spec} />
            ))}
          </div>
        </div>
      )}

      {presets.length > 0 && (
        <div>
          <div style={SUB_HEADING_STYLE}>Presets</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {presets.map((spec, i) => (
              <SpecimenItem key={i} spec={spec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
