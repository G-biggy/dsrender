'use client';

import type { TokenSection } from '@/types';

interface ZToken {
  name: string;
  value: number;
  usage?: string;
}

const LAYER_COLORS = [
  { bg: '#E0E7FF', border: '#C7D2FE', text: '#4338CA' },
  { bg: '#C7D2FE', border: '#A5B4FC', text: '#4338CA' },
  { bg: '#A5B4FC', border: '#818CF8', text: '#312E81' },
  { bg: '#818CF8', border: '#6366F1', text: '#FFFFFF' },
  { bg: '#6366F1', border: '#4F46E5', text: '#FFFFFF' },
  { bg: '#4F46E5', border: '#4338CA', text: '#FFFFFF' },
  { bg: '#4338CA', border: '#3730A3', text: '#FFFFFF' },
];

export function ZIndexPreview({ section }: { section: TokenSection }) {
  const allTokens = [
    ...section.tokens,
    ...section.subsections.flatMap((sub) => sub.tokens),
  ];

  const zTokens: ZToken[] = allTokens
    .map((t) => ({
      name: t.name,
      value: parseInt(t.value, 10),
      usage: t.usage,
    }))
    .filter((t) => !isNaN(t.value))
    .sort((a, b) => a.value - b.value);

  if (zTokens.length === 0) return null;

  const layerHeight = 40;
  const layerGap = 36;
  const totalStackHeight = (zTokens.length - 1) * layerGap + layerHeight;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '40px',
        padding: '24px 0',
      }}
    >
      {/* Isometric 3D stack */}
      <div
        style={{
          perspective: '800px',
          perspectiveOrigin: '50% 40%',
          minWidth: '280px',
          height: `${totalStackHeight + 80}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateX(55deg) rotateZ(-45deg)',
            position: 'relative',
            width: '160px',
            height: '160px',
          }}
        >
          {zTokens.map((token, i) => {
            const colorIdx = Math.min(i, LAYER_COLORS.length - 1);
            const color = LAYER_COLORS[colorIdx];
            const yOffset = i * layerGap;

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: '160px',
                  height: '160px',
                  backgroundColor: color.bg,
                  border: `2px solid ${color.border}`,
                  borderRadius: '8px',
                  transform: `translateZ(${yOffset}px)`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backfaceVisibility: 'hidden',
                }}
              >
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: color.text,
                    transform: 'rotateZ(45deg)',
                    textAlign: 'center',
                    lineHeight: '1.2',
                    pointerEvents: 'none',
                  }}
                >
                  {token.name}
                  <br />
                  <span style={{ fontSize: '11px', fontWeight: 500, opacity: 0.7 }}>
                    {token.value}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend — flat list alongside the 3D view */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          paddingTop: '8px',
        }}
      >
        {/* Arrow label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '4px',
          }}
        >
          <svg width="12" height="16" viewBox="0 0 12 16" fill="#6366F1">
            <polygon points="6,0 12,8 8,8 8,16 4,16 4,8 0,8" />
          </svg>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Higher z-index
          </span>
        </div>
        {[...zTokens].reverse().map((token, i) => {
          const origIdx = zTokens.length - 1 - i;
          const colorIdx = Math.min(origIdx, LAYER_COLORS.length - 1);
          const color = LAYER_COLORS[colorIdx];
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  backgroundColor: color.bg,
                  border: `1.5px solid ${color.border}`,
                  borderRadius: '3px',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151', minWidth: '70px' }}>
                {token.name}
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#9CA3AF' }}>
                {token.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
