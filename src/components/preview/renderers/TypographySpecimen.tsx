'use client';

import { useEffect, useState } from 'react';
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
    if (k === 'font' || k === 'font family' || k === 'family') {
      result.font = val;
    } else if (k === 'weight' || k === 'font weight') {
      result.weight = val;
    } else if (k === 'size' || k === 'font size') {
      result.size = val;
    } else if (k === 'line height' || k === 'line-height' || k === 'lineheight') {
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

function extractSectionFont(section: TokenSection): string | undefined {
  const fontMatch = section.rawMarkdown?.match(/\*\*Font family:\*\*\s*(.+)/i)
    || section.rawMarkdown?.match(/Font family:\s*(.+)/i);
  if (fontMatch) return fontMatch[1].trim();
  return undefined;
}

function useGoogleFont(fontName: string | undefined) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!fontName) return;

    const systemFonts = ['helvetica', 'arial', 'system-ui', 'sans-serif', 'serif', 'monospace'];
    if (systemFonts.some((f) => fontName.toLowerCase().includes(f))) {
      setLoaded(true);
      return;
    }

    const encoded = fontName.replace(/\s+/g, '+');
    const id = `gfont-${encoded}`;

    if (document.getElementById(id)) {
      setLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
    link.onload = () => setLoaded(true);
    document.head.appendChild(link);
  }, [fontName]);

  return loaded;
}

export function TypographySpecimen({ section }: { section: TokenSection }) {
  const sectionFont = extractSectionFont(section);
  useGoogleFont(sectionFont);

  const allTokens = [
    ...section.tokens,
    ...section.subsections.flatMap((sub) => sub.tokens),
  ];

  const specimens = allTokens
    .map((t) => parseTypographyEntry(t, sectionFont))
    .filter((t) => t.size);

  if (specimens.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {specimens.map((spec, i) => (
        <div key={i} className="border-b border-gray-100 dark:border-gray-800 pb-5">
          <div
            className="text-gray-900 dark:text-gray-100 mb-2 break-words"
            style={{
              fontFamily: spec.font ? `"${spec.font}", sans-serif` : 'inherit',
              fontSize: spec.size,
              fontWeight: spec.weight ? parseWeight(spec.weight) : 400,
              lineHeight: spec.lineHeight || 1.3,
            }}
          >
            {SAMPLE_TEXT}
          </div>
          <div className="flex gap-4 flex-wrap text-xs text-gray-400 dark:text-gray-500 font-mono">
            <span className="text-gray-500 dark:text-gray-400 font-semibold">{spec.role}</span>
            {spec.font && <span>{spec.font}</span>}
            {spec.size && <span>{spec.size}</span>}
            {spec.weight && <span>w{spec.weight}</span>}
            {spec.lineHeight && <span>/{spec.lineHeight}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
