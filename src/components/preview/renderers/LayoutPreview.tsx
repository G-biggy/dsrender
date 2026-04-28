'use client';

import type { TokenSection } from '@/types';
import { parsePxValue } from '@/lib/utils';

export function LayoutPreview({ section }: { section: TokenSection }) {
  const allTokens = [
    ...section.tokens,
    ...section.subsections.flatMap((sub) => sub.tokens),
  ];

  if (allTokens.length === 0) return null;

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
    <div className="flex flex-col gap-4">
      {dimensionTokens.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {dimensionTokens.map((token, i) => {
            const widthPct = Math.max((token.px! / maxPx) * 100, 6);
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-[120px] shrink-0 text-right">
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {token.name}
                  </div>
                </div>
                <div className="flex-1 h-7 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden relative">
                  <div
                    className="h-full bg-indigo-400 rounded-md flex items-center justify-end pr-2 min-w-[50px]"
                    style={{ width: `${widthPct}%` }}
                  >
                    <span className="text-[11px] font-semibold font-mono text-white">
                      {token.value}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {otherTokens.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {otherTokens.map((token, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 min-w-[160px]"
            >
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {token.name}
              </div>
              <div className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                {token.value}
              </div>
              {token.usage && (
                <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
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
