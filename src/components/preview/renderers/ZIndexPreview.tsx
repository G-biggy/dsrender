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

  const layerGap = 36;
  const layerHeight = 40;
  const totalStackHeight = (zTokens.length - 1) * layerGap + layerHeight;

  return (
    <div className="flex items-start gap-10 py-6">
      {/* Isometric 3D stack */}
      <div
        className="min-w-[280px] flex items-center justify-center"
        style={{
          perspective: '800px',
          perspectiveOrigin: '50% 40%',
          height: `${totalStackHeight + 80}px`,
        }}
      >
        <div
          className="relative"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateX(55deg) rotateZ(-45deg)',
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
                className="absolute w-[160px] h-[160px] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.12)] flex items-center justify-center backface-hidden"
                style={{
                  backgroundColor: color.bg,
                  border: `2px solid ${color.border}`,
                  transform: `translateZ(${yOffset}px)`,
                }}
              >
                <span
                  className="text-[13px] font-bold text-center leading-tight pointer-events-none"
                  style={{
                    color: color.text,
                    transform: 'rotateZ(45deg)',
                  }}
                >
                  {token.name}
                  <br />
                  <span className="text-[11px] font-medium opacity-70">
                    {token.value}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1.5 pt-2">
        <div className="flex items-center gap-1.5 mb-1">
          <svg width="12" height="16" viewBox="0 0 12 16" fill="#6366F1">
            <polygon points="6,0 12,8 8,8 8,16 4,16 4,8 0,8" />
          </svg>
          <span className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wide">
            Higher z-index
          </span>
        </div>
        {[...zTokens].reverse().map((token, i) => {
          const origIdx = zTokens.length - 1 - i;
          const colorIdx = Math.min(origIdx, LAYER_COLORS.length - 1);
          const color = LAYER_COLORS[colorIdx];
          return (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3.5 h-3.5 rounded-[3px] shrink-0"
                style={{
                  backgroundColor: color.bg,
                  border: `1.5px solid ${color.border}`,
                }}
              />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[70px]">
                {token.name}
              </span>
              <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
                {token.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
