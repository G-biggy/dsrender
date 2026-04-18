'use client';

import type { TokenSection } from '@/types';

export function GenericTable({ section }: { section: TokenSection }) {
  const allTokens = [
    ...section.tokens,
    ...section.subsections.flatMap((sub) => sub.tokens),
  ];

  if (allTokens.length === 0) return null;

  // Collect all unique extra keys for headers
  const extraKeys = new Set<string>();
  for (const token of allTokens) {
    for (const key of Object.keys(token.extra)) {
      extraKeys.add(key);
    }
  }
  const extraHeaders = Array.from(extraKeys);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Value</th>
            {extraHeaders.map((h) => (
              <th key={h} style={thStyle}>
                {h}
              </th>
            ))}
            {allTokens.some((t) => t.usage) && <th style={thStyle}>Usage</th>}
          </tr>
        </thead>
        <tbody>
          {allTokens.map((token, i) => (
            <tr key={i}>
              <td style={tdStyle}>
                <code
                  style={{
                    fontSize: '12px',
                    backgroundColor: '#F3F4F6',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                  }}
                >
                  {token.name}
                </code>
              </td>
              <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{token.value}</td>
              {extraHeaders.map((h) => (
                <td key={h} style={tdStyle}>
                  {token.extra[h] || ''}
                </td>
              ))}
              {allTokens.some((t) => t.usage) && (
                <td style={{ ...tdStyle, color: '#6B7280' }}>{token.usage || ''}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: '2px solid #E5E7EB',
  fontWeight: 600,
  color: '#374151',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid #F3F4F6',
  color: '#1F2937',
};
