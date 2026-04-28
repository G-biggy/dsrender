'use client';

import type { ContentBlock } from '@/types';

export function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  if (blocks.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, i) => (
        <ContentBlockView key={i} block={block} />
      ))}
    </div>
  );
}

function ContentBlockView({ block }: { block: ContentBlock }) {
  switch (block.kind) {
    case 'paragraph':
      return (
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 m-0">
          {block.text}
        </p>
      );

    case 'code':
      return (
        <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg text-xs font-mono overflow-auto m-0 leading-normal">
          {block.lang && (
            <span className="block text-gray-400 text-[11px] mb-2 uppercase tracking-wide">
              {block.lang}
            </span>
          )}
          <code>{block.code}</code>
        </pre>
      );

    case 'list':
      if (block.ordered) {
        return (
          <ol className="m-0 pl-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {block.items?.map((item, i) => (
              <li key={i} className="mb-1">{item}</li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="m-0 pl-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {block.items?.map((item, i) => (
            <li key={i} className="mb-1">{item}</li>
          ))}
        </ul>
      );

    case 'blockquote':
      return (
        <blockquote className="m-0 pl-4 border-l-[3px] border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm italic leading-relaxed">
          {block.text}
        </blockquote>
      );

    case 'table':
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            {block.headers && (
              <thead>
                <tr>
                  {block.headers.map((h, i) => (
                    <th
                      key={i}
                      className="text-left px-3 py-2 border-b-2 border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {block.rows?.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'thematicBreak':
      return <hr className="border-none border-t border-gray-200 dark:border-gray-700 my-2" />;

    default:
      return null;
  }
}
