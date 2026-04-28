'use client';

import type { TokenSection } from '@/types';

export function GenericTable({ section }: { section: TokenSection }) {
  const allTokens = [
    ...section.tokens,
    ...section.subsections.flatMap((sub) => sub.tokens),
  ];

  if (allTokens.length === 0) return null;

  const extraKeys = new Set<string>();
  for (const token of allTokens) {
    for (const key of Object.keys(token.extra)) {
      extraKeys.add(key);
    }
  }
  const extraHeaders = Array.from(extraKeys);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th className="text-left px-3 py-2 border-b-2 border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Name</th>
            <th className="text-left px-3 py-2 border-b-2 border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Value</th>
            {extraHeaders.map((h) => (
              <th key={h} className="text-left px-3 py-2 border-b-2 border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {h}
              </th>
            ))}
            {allTokens.some((t) => t.usage) && <th className="text-left px-3 py-2 border-b-2 border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Usage</th>}
          </tr>
        </thead>
        <tbody>
          {allTokens.map((token, i) => (
            <tr key={i}>
              <td className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100">
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono">
                  {token.name}
                </code>
              </td>
              <td className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 font-mono">{token.value}</td>
              {extraHeaders.map((h) => (
                <td key={h} className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100">
                  {token.extra[h] || ''}
                </td>
              ))}
              {allTokens.some((t) => t.usage) && (
                <td className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400">{token.usage || ''}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
