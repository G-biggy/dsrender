'use client';

import type { TokenSection } from '@/types';
import { DEFAULT_ACCENT, tintAt } from '@/lib/render-defaults';

export function RadiusPreview({ section, specimenColor }: { section: TokenSection; specimenColor?: string }) {
  const accent = specimenColor ?? DEFAULT_ACCENT;
  const fill = tintAt(accent, 0.18);
  const allTokens = [
    ...section.tokens,
    ...section.subsections.flatMap((sub) => sub.tokens),
  ];

  if (allTokens.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        alignItems: 'flex-end',
      }}
    >
      {allTokens.map((token, i) => {
        const radiusValue = token.value.trim();
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: fill,
                border: `2px solid ${accent}`,
                borderRadius: radiusValue,
              }}
            />
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#374151',
                textAlign: 'center',
              }}
            >
              {token.name}
            </div>
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#9CA3AF',
              }}
            >
              {radiusValue}
            </div>
          </div>
        );
      })}
    </div>
  );
}
