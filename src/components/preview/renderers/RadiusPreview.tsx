'use client';

import type { TokenSection } from '@/types';

export function RadiusPreview({ section }: { section: TokenSection }) {
  const allTokens = [
    ...section.tokens,
    ...section.subsections.flatMap((sub) => sub.tokens),
  ];

  if (allTokens.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-5 items-end">
      {allTokens.map((token, i) => {
        const radiusValue = token.value.trim();
        return (
          <div key={i} className="flex flex-col items-center gap-2">
            <div
              className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 border-2 border-indigo-400 dark:border-indigo-500"
              style={{ borderRadius: radiusValue }}
            />
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center">
              {token.name}
            </div>
            <div className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
              {radiusValue}
            </div>
          </div>
        );
      })}
    </div>
  );
}
