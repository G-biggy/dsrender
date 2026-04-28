'use client';

import type { TokenSection } from '@/types';

function parseGlowToken(token: { name: string; value: string; usage?: string; extra: Record<string, string> }) {
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

  const hasGlowData = allTokens.some(
    (t) => t.extra['blur'] || t.extra['opacity'] || /^\d+(\.\d+)?\s*px/.test(t.value)
  );

  if (!hasGlowData) {
    return (
      <div className="flex flex-wrap gap-4">
        {allTokens.map((token, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-[10px] p-4 min-w-[160px] flex-[1_1_160px] max-w-[260px]"
          >
            <div className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">
              {token.name}
            </div>
            <div className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-1">
              {token.value}
            </div>
            {token.usage && (
              <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
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
    <div className="flex flex-wrap gap-6 items-end">
      {glowTokens.map((glow, i) => (
        <div key={i} className="flex flex-col items-center gap-2.5 min-w-[120px]">
          {/* Glow circle */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Outer glow */}
            <div
              className="absolute inset-0 rounded-full bg-indigo-400"
              style={{ opacity: glow.opacity, filter: `blur(${glow.blur}px)` }}
            />
            {/* Inner dot */}
            <div className="relative w-6 h-6 rounded-full bg-indigo-500 shadow-[0_0_0_2px_rgba(255,255,255,0.8)]" />
          </div>
          {/* Labels */}
          <div className="text-center">
            <div className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">
              {glow.name}
            </div>
            <div className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
              blur: {glow.blur}px
            </div>
            <div className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
              opacity: {glow.opacity}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
