'use client';

import type { TokenSection } from '@/types';
import { parsePxValue } from '@/lib/utils';

export function SpacingScale({ section }: { section: TokenSection }) {
  const allTokens = [
    ...section.tokens,
    ...section.subsections.flatMap((sub) => sub.tokens),
  ];

  const items = allTokens
    .map((t) => ({
      name: t.name,
      value: t.value,
      usage: t.usage,
      px: parsePxValue(t.value),
    }))
    .filter((t) => t.px !== null && t.px > 0)
    .sort((a, b) => (a.px ?? 0) - (b.px ?? 0));

  if (items.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'flex-end',
      }}
    >
      {items.map((item, i) => {
        const px = item.px ?? 0;
        // Clamp visual size between 4px and 120px for display
        const displaySize = Math.min(Math.max(px, 4), 120);

        return (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {/* Actual-sized block */}
            <div
              style={{
                width: `${displaySize}px`,
                height: `${displaySize}px`,
                backgroundColor: '#F97316',
                borderRadius: Math.min(4, displaySize / 4),
                opacity: 0.8,
                minWidth: '4px',
                minHeight: '4px',
              }}
            />
            {/* Value label */}
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#374151',
                fontFamily: 'monospace',
                textAlign: 'center',
              }}
            >
              {px}
            </div>
            {/* Token name */}
            <div
              style={{
                fontSize: '10px',
                color: '#9CA3AF',
                textAlign: 'center',
                maxWidth: `${Math.max(displaySize, 40)}px`,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
