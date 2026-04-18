'use client';

import type { ContentBlock } from '@/types';

export function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  if (blocks.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
        <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#374151', margin: 0 }}>
          {block.text}
        </p>
      );

    case 'code':
      return (
        <pre
          style={{
            backgroundColor: '#1F2937',
            color: '#E5E7EB',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: '"SF Mono", "Fira Code", Menlo, monospace',
            overflow: 'auto',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {block.lang && (
            <span
              style={{
                display: 'block',
                color: '#9CA3AF',
                fontSize: '11px',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {block.lang}
            </span>
          )}
          <code>{block.code}</code>
        </pre>
      );

    case 'list':
      if (block.ordered) {
        return (
          <ol
            style={{
              margin: 0,
              paddingLeft: '24px',
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#374151',
            }}
          >
            {block.items?.map((item, i) => (
              <li key={i} style={{ marginBottom: '4px' }}>
                {item}
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul
          style={{
            margin: 0,
            paddingLeft: '24px',
            fontSize: '14px',
            lineHeight: 1.6,
            color: '#374151',
          }}
        >
          {block.items?.map((item, i) => (
            <li key={i} style={{ marginBottom: '4px' }}>
              {item}
            </li>
          ))}
        </ul>
      );

    case 'blockquote':
      return (
        <blockquote
          style={{
            margin: 0,
            paddingLeft: '16px',
            borderLeft: '3px solid #E5E7EB',
            color: '#6B7280',
            fontSize: '14px',
            fontStyle: 'italic',
            lineHeight: 1.6,
          }}
        >
          {block.text}
        </blockquote>
      );

    case 'table':
      return (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
            }}
          >
            {block.headers && (
              <thead>
                <tr>
                  {block.headers.map((h, i) => (
                    <th
                      key={i}
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderBottom: '2px solid #E5E7EB',
                        fontWeight: 600,
                        color: '#374151',
                        whiteSpace: 'nowrap',
                      }}
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
                      style={{
                        padding: '8px 12px',
                        borderBottom: '1px solid #F3F4F6',
                        color: '#1F2937',
                      }}
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
      return <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '8px 0' }} />;

    default:
      return null;
  }
}
