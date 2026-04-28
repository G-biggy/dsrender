'use client';

import type { TokenSection } from '@/types';
import { parsePxValue } from '@/lib/utils';

export function BreakpointRuler({ section }: { section: TokenSection }) {
  const allTokens = [
    ...section.tokens,
    ...section.subsections.flatMap((sub) => sub.tokens),
  ];

  const breakpoints = allTokens
    .map((t) => ({
      name: t.name,
      value: t.value,
      usage: t.usage,
      px: parsePxValue(t.value),
    }))
    .filter((t) => t.px !== null && t.px > 0)
    .sort((a, b) => (a.px ?? 0) - (b.px ?? 0));

  if (breakpoints.length === 0) return null;

  const maxPx = Math.max(...breakpoints.map((b) => b.px ?? 0));
  const colors = ['#818CF8', '#34D399', '#FBBF24', '#F87171', '#A78BFA'];

  return (
    <div className="py-4">
      {/* Ruler bar */}
      <div className="relative h-10 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        {breakpoints.map((bp, i) => {
          const pct = ((bp.px ?? 0) / maxPx) * 100;
          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-0.5"
              style={{
                left: `${pct}%`,
                backgroundColor: colors[i % colors.length],
              }}
            />
          );
        })}
      </div>

      {/* Labels */}
      <div className="relative h-[50px] mt-1">
        {breakpoints.map((bp, i) => {
          const pct = ((bp.px ?? 0) / maxPx) * 100;
          return (
            <div
              key={i}
              className="absolute -translate-x-1/2 text-center"
              style={{ left: `${pct}%` }}
            >
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {bp.name}
              </div>
              <div className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
                {bp.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
