'use client';

import type { TokenSection } from '@/types';
import { parsePxValue } from '@/lib/utils';
import { DEFAULT_ACCENT } from '@/lib/render-defaults';

export function LayoutPreview({ section, specimenColor }: { section: TokenSection; specimenColor?: string }) {
  const accent = specimenColor ?? DEFAULT_ACCENT;
  const allTokens = [
    ...section.tokens,
    ...section.subsections.flatMap((sub) => sub.tokens),
  ];

  if (allTokens.length === 0) return null;

  // Separate dimension tokens (have px values) from non-dimension tokens
  const dimensionTokens = allTokens
    .map((t) => ({
      name: t.name,
      value: t.value,
      usage: t.usage,
      px: parsePxValue(t.value),
    }))
    .filter((t) => t.px !== null && t.px > 0);

  const otherTokens = allTokens.filter((t) => {
    const px = parsePxValue(t.value);
    return px === null || px <= 0;
  });

  const maxPx = dimensionTokens.length > 0
    ? Math.max(...dimensionTokens.map((t) => t.px!))
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Dimension tokens as horizontal bars */}
      {dimensionTokens.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {dimensionTokens.map((token, i) => {
            const widthPct = Math.max((token.px! / maxPx) * 100, 6);
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                {/* Label */}
                <div
                  style={{
                    width: '120px',
                    flexShrink: 0,
                    textAlign: 'right',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                    {token.name}
                  </div>
                </div>
                {/* Bar */}
                <div
                  style={{
                    flex: 1,
                    height: '28px',
                    backgroundColor: '#F3F4F6',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: `${widthPct}%`,
                      height: '100%',
                      backgroundColor: accent,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: '8px',
                      minWidth: '50px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        fontFamily: 'monospace',
                        color: '#FFFFFF',
                      }}
                    >
                      {token.value}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Non-dimension tokens as info cards */}
      {otherTokens.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {otherTokens.map((token, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '12px 16px',
                minWidth: '160px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                {token.name}
              </div>
              <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#6B7280', marginTop: '2px' }}>
                {token.value}
              </div>
              {token.usage && (
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                  {token.usage}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
