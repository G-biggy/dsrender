'use client';

import { icons, type LucideIcon } from 'lucide-react';
import type { TokenSection, ContentBlock } from '@/types';
import { parsePxValue } from '@/lib/utils';

function getLucideIcon(name: string): LucideIcon | null {
  if (name in icons) return icons[name as keyof typeof icons];

  const pascal = name
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
  if (pascal in icons) return icons[pascal as keyof typeof icons];

  const lower = name.toLowerCase().replace(/[-_\s]/g, '');
  const match = Object.keys(icons).find(
    (k) => k.toLowerCase().replace(/[-_\s]/g, '') === lower
  );
  if (match) return icons[match as keyof typeof icons];

  return null;
}

export function IconSizes({ section }: { section: TokenSection }) {
  const allTokens = [
    ...section.tokens,
    ...section.subsections.flatMap((sub) => sub.tokens),
  ];

  const sizeTokens = allTokens
    .map((t) => ({
      name: t.name,
      value: t.value,
      usage: t.usage,
      px: parsePxValue(t.value),
    }))
    .filter((t) => t.px !== null && t.px > 0)
    .sort((a, b) => (a.px ?? 0) - (b.px ?? 0));

  const allContent = [
    ...section.content,
    ...section.subsections.flatMap((sub) => sub.content),
  ];

  const iconTables: ContentBlock[] = [];
  const otherContent: ContentBlock[] = [];

  for (const block of allContent) {
    if (block.kind === 'code') continue;
    if (
      block.kind === 'table' &&
      block.headers?.some((h) => /icon|name/i.test(h))
    ) {
      iconTables.push(block);
    } else {
      otherContent.push(block);
    }
  }

  return (
    <div className="flex flex-col gap-7">
      {sizeTokens.length > 0 && (
        <div>
          <div className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Sizes</div>
          <div className="flex flex-wrap gap-6 items-end">
            {sizeTokens.map((token, i) => {
              const px = token.px ?? 16;
              const Icon = getLucideIcon('Image');
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div
                    className="flex items-center justify-center text-gray-500 dark:text-gray-400"
                    style={{ width: `${px}px`, height: `${px}px` }}
                  >
                    {Icon ? <Icon size={px} strokeWidth={1.5} /> : (
                      <div className="rounded bg-gray-200 dark:bg-gray-700" style={{ width: px, height: px }} />
                    )}
                  </div>
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">{px}px</div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500">{token.usage || token.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {iconTables.map((table, i) => (
        <div key={i}>
          <IconTable block={table} />
        </div>
      ))}

      {otherContent.length > 0 && (
        <div className="flex flex-col gap-3">
          {otherContent.map((block, i) => {
            if (block.kind === 'paragraph') {
              return <p key={i} className="text-sm text-gray-700 dark:text-gray-300 m-0">{block.text}</p>;
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}

function IconTable({ block }: { block: ContentBlock }) {
  if (!block.headers || !block.rows) return null;

  const iconColIdx = block.headers.findIndex((h) => /icon.*name|name/i.test(h));
  const purposeColIdx = block.headers.findIndex((h) => /purpose|usage|description/i.test(h));

  return (
    <div>
      <div className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Library</div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
        {block.rows.map((row, i) => {
          const iconName = row[iconColIdx !== -1 ? iconColIdx : 1] || '';
          const purpose = row[purposeColIdx !== -1 ? purposeColIdx : 0] || '';
          const Icon = getLucideIcon(iconName.trim());

          return (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 p-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
            >
              <div className="text-gray-700 dark:text-gray-300">
                {Icon ? (
                  <Icon size={24} strokeWidth={1.5} />
                ) : (
                  <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] text-gray-400 dark:text-gray-500">
                    ?
                  </div>
                )}
              </div>
              <div className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-center">
                {purpose}
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono text-center">
                {iconName}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
