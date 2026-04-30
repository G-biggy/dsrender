'use client';

import type { TokenSection } from '@/types';
import { parsePxValue } from '@/lib/utils';
import { DEFAULT_ACCENT } from '@/lib/render-defaults';

export function BreakpointRuler({ section, specimenColor }: { section: TokenSection; specimenColor?: string }) {
  const accent = specimenColor ?? DEFAULT_ACCENT;
  const allTokens = [
    ...section.tokens,
    ...section.subsections.flatMap((sub) => sub.tokens),
  ];

  const breakpoints = allTokens
    .map((t) => ({
      name: t.name,
      value: t.value,
      usage: t.usage,
      px: parsePxValue(t.value),
    }))
    .filter((t) => t.px !== null && t.px > 0)
    .sort((a, b) => (a.px ?? 0) - (b.px ?? 0));

  if (breakpoints.length === 0) return null;

  const maxPx = Math.max(...breakpoints.map((b) => b.px ?? 0));

  return (
    <div style={{ padding: '16px 0' }}>
      {/* Ruler bar */}
      <div
        style={{
          position: 'relative',
          height: '40px',
          backgroundColor: '#F3F4F6',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {breakpoints.map((bp, i) => {
          const pct = ((bp.px ?? 0) / maxPx) * 100;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${pct}%`,
                top: 0,
                bottom: 0,
                width: '2px',
                backgroundColor: accent,
              }}
            />
          );
        })}
      </div>

      {/* Labels */}
      <div
        style={{
          position: 'relative',
          height: '50px',
          marginTop: '4px',
        }}
      >
        {breakpoints.map((bp, i) => {
          const pct = ((bp.px ?? 0) / maxPx) * 100;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${pct}%`,
                transform: 'translateX(-50%)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                {bp.name}
              </div>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#9CA3AF' }}>
                {bp.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
