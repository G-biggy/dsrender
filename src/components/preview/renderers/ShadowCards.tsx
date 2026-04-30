'use client';

import type { TokenSection } from '@/types';

export function ShadowCards({ section }: { section: TokenSection }) {
  const allTokens = [
    ...section.tokens,
    ...section.subsections.flatMap((sub) => sub.tokens),
  ];

  if (allTokens.length === 0) return null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '24px',
        padding: '16px 0',
      }}
    >
      {allTokens.map((token, i) => {
        const shadowValue = token.value.trim();
        return (
          <div
            key={i}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: shadowValue,
              minHeight: '100px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              gap: '4px',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#1F2937',
              }}
            >
              {token.name}
            </div>
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#9CA3AF',
                wordBreak: 'break-all',
              }}
            >
              {shadowValue}
            </div>
          </div>
        );
      })}
    </div>
  );
}
