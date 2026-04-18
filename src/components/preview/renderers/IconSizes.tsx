'use client';

import { icons, type LucideIcon } from 'lucide-react';
import type { TokenSection, ContentBlock } from '@/types';
import { parsePxValue } from '@/lib/utils';

/** Look up a Lucide icon by name (case-insensitive, handles common aliases) */
function getLucideIcon(name: string): LucideIcon | null {
  // Direct match
  if (name in icons) return icons[name as keyof typeof icons];

  // Try PascalCase conversion: "arrow-left" → "ArrowLeft"
  const pascal = name
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
  if (pascal in icons) return icons[pascal as keyof typeof icons];

  // Case-insensitive search
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

  // Split content into icon tables (render with icons) vs other content
  const iconTables: ContentBlock[] = [];
  const otherContent: ContentBlock[] = [];

  for (const block of allContent) {
    if (block.kind === 'code') continue; // Already parsed as tokens
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Icon size visualization */}
      {sizeTokens.length > 0 && (
        <div>
          <div style={subheadingStyle}>Sizes</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-end' }}>
            {sizeTokens.map((token, i) => {
              const px = token.px ?? 16;
              const Icon = getLucideIcon('Image');
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: `${px}px`,
                      height: `${px}px`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6B7280',
                    }}
                  >
                    {Icon ? <Icon size={px} strokeWidth={1.5} /> : (
                      <div style={{ width: px, height: px, borderRadius: 4, backgroundColor: '#E5E7EB' }} />
                    )}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>{px}px</div>
                  <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{token.usage || token.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Icon tables — render actual icons next to names */}
      {iconTables.map((table, i) => (
        <div key={i}>
          <IconTable block={table} />
        </div>
      ))}

      {/* Other content (paragraphs, etc.) */}
      {otherContent.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {otherContent.map((block, i) => {
            if (block.kind === 'paragraph') {
              return <p key={i} style={{ fontSize: '14px', color: '#374151', margin: 0 }}>{block.text}</p>;
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

  // Find which column has the icon name
  const iconColIdx = block.headers.findIndex((h) => /icon.*name|name/i.test(h));
  const purposeColIdx = block.headers.findIndex((h) => /purpose|usage|description/i.test(h));

  return (
    <div>
      <div style={subheadingStyle}>Library</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '12px',
        }}
      >
        {block.rows.map((row, i) => {
          const iconName = row[iconColIdx !== -1 ? iconColIdx : 1] || '';
          const purpose = row[purposeColIdx !== -1 ? purposeColIdx : 0] || '';
          const Icon = getLucideIcon(iconName.trim());

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '16px 8px',
                borderRadius: '8px',
                border: '1px solid #F3F4F6',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div style={{ color: '#374151' }}>
                {Icon ? (
                  <Icon size={24} strokeWidth={1.5} />
                ) : (
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      backgroundColor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      color: '#9CA3AF',
                    }}
                  >
                    ?
                  </div>
                )}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 500, color: '#374151', textAlign: 'center' }}>
                {purpose}
              </div>
              <div style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'monospace', textAlign: 'center' }}>
                {iconName}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const subheadingStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#6B7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '16px',
};
