'use client';

import type { TokenSection } from '@/types';

function parseGlowToken(token: { name: string; value: string; usage?: string; extra: Record<string, string> }) {
  // Blur might be in extra['blur'] or in the value column (when table is State|Blur|Opacity)
  const blurFromExtra = token.extra['blur'];
  const blurFromValue = /^\d/.test(token.value) ? token.value : undefined;
  const blur = parseFloat(blurFromExtra || blurFromValue || '0') || 0;

  const opacity = parseFloat(token.extra['opacity'] || '1');
  return { name: token.name, blur, opacity, usage: token.usage };
}

export function EffectsPreview({ section }: { section: TokenSection }) {
  const allTokens = [
    ...section.tokens,
    ...section.subsections.flatMap((sub) => sub.tokens),
  ];

  if (allTokens.length === 0) return null;

  // Check if tokens have blur/opacity data (glow pattern)
  const hasGlowData = allTokens.some(
    (t) => t.extra['blur'] || t.extra['opacity'] || /^\d+(\.\d+)?\s*px/.test(t.value)
  );

  if (!hasGlowData) {
    // Fallback: render as generic effect cards
    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {allTokens.map((token, i) => (
          <div
            key={i}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              padding: '16px',
              minWidth: '160px',
              flex: '1 1 160px',
              maxWidth: '260px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              {token.name}
            </div>
            <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#6B7280', marginTop: '4px' }}>
              {token.value}
            </div>
            {token.usage && (
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                {token.usage}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  const glowTokens = allTokens.map(parseGlowToken);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '24px',
        alignItems: 'flex-end',
      }}
    >
      {glowTokens.map((glow, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            minWidth: '120px',
          }}
        >
          {/* Glow circle */}
          <div
            style={{
              position: 'relative',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Outer glow */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                backgroundColor: '#818CF8',
                opacity: glow.opacity,
                filter: `blur(${glow.blur}px)`,
              }}
            />
            {/* Inner dot */}
            <div
              style={{
                position: 'relative',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#6366F1',
                boxShadow: '0 0 0 2px rgba(255,255,255,0.8)',
              }}
            />
          </div>
          {/* Labels */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              {glow.name}
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#9CA3AF' }}>
              blur: {glow.blur}px
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#9CA3AF' }}>
              opacity: {glow.opacity}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
