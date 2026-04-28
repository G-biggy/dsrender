'use client';

import type { TokenSection } from '@/types';

export function ShadowCards({ section }: { section: TokenSection }) {
  const allTokens = [
    ...section.tokens,
    ...section.subsections.flatMap((sub) => sub.tokens),
  ];

  if (allTokens.length === 0) return null;

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6 py-4">
      {allTokens.map((token, i) => {
        const shadowValue = token.value.trim();
        return (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 min-h-[100px] flex flex-col justify-end gap-1"
            style={{ boxShadow: shadowValue }}
          >
            <div className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">
              {token.name}
            </div>
            <div className="text-[11px] font-mono text-gray-400 dark:text-gray-500 break-all">
              {shadowValue}
            </div>
          </div>
        );
      })}
    </div>
  );
}
