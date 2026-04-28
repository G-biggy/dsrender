'use client';

import { useState } from 'react';
import type { TokenSection } from '@/types';
import { isColor, isLightColor, isHexColor } from '@/lib/utils';

export function ColorSwatches({ section }: { section: TokenSection }) {
  const allTokens = [
    ...section.tokens,
    ...section.subsections.flatMap((sub) => sub.tokens),
  ];

  const groups: { heading: string; tokens: typeof allTokens }[] = [];

  if (section.tokens.length > 0) {
    groups.push({ heading: '', tokens: section.tokens });
  }
  for (const sub of section.subsections) {
    if (sub.tokens.length > 0) {
      groups.push({ heading: sub.heading, tokens: sub.tokens });
    }
    for (const nested of sub.subsections) {
      if (nested.tokens.length > 0) {
        groups.push({ heading: nested.heading, tokens: nested.tokens });
      }
    }
  }

  if (groups.length === 0 && allTokens.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group, gi) => (
        <div key={gi}>
          {group.heading && (
            <h4 className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              {group.heading}
            </h4>
          )}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
            {group.tokens.map((token, i) => {
              const colorValue = token.value.trim();
              if (!isColor(colorValue)) return null;
              return (
                <ColorCard
                  key={i}
                  name={token.name}
                  value={colorValue}
                  usage={token.usage}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ColorCard({
  name,
  value,
  usage,
}: {
  name: string;
  value: string;
  usage?: string;
}) {
  const [copied, setCopied] = useState(false);
  const needsBorder = isHexColor(value) && isLightColor(value);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <div
      onClick={handleCopy}
      className="cursor-pointer rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-shadow hover:shadow-md"
    >
      <div
        className="h-20 border-b border-gray-200 dark:border-gray-700 relative"
        style={{
          backgroundColor: value,
          borderTop: needsBorder ? '1px solid #E5E7EB' : 'none',
          borderLeft: needsBorder ? '1px solid #E5E7EB' : 'none',
          borderRight: needsBorder ? '1px solid #E5E7EB' : 'none',
        }}
      >
        {copied && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs font-semibold">
            Copied!
          </div>
        )}
      </div>
      <div className="px-2.5 py-2">
        <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 font-mono whitespace-nowrap overflow-hidden text-ellipsis">
          {name}
        </div>
        <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono mt-0.5">
          {value}
        </div>
        {usage && (
          <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 leading-tight">
            {usage}
          </div>
        )}
      </div>
    </div>
  );
}
