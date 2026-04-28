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
    <div className="flex flex-wrap gap-3 items-end">
      {items.map((item, i) => {
        const px = item.px ?? 0;
        const displaySize = Math.min(Math.max(px, 4), 120);

        return (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className="bg-orange-500 opacity-80 min-w-1 min-h-1"
              style={{
                width: `${displaySize}px`,
                height: `${displaySize}px`,
                borderRadius: Math.min(4, displaySize / 4),
              }}
            />
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 font-mono text-center">
              {px}
            </div>
            <div
              className="text-[10px] text-gray-400 dark:text-gray-500 text-center overflow-hidden text-ellipsis whitespace-nowrap"
              style={{ maxWidth: `${Math.max(displaySize, 40)}px` }}
            >
              {item.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
