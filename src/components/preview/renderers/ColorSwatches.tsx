'use client';

import { useState } from 'react';
import type { TokenSection } from '@/types';
import { isColor, isLightColor, isHexColor } from '@/lib/utils';

export function ColorSwatches({ section }: { section: TokenSection }) {
  const allTokens = [
    ...section.tokens,
    ...section.subsections.flatMap((sub) => sub.tokens),
  ];

  // Group by subsection
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {groups.map((group, gi) => (
        <div key={gi}>
          {group.heading && (
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '12px',
              }}
            >
              {group.heading}
            </h4>
          )}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '12px',
            }}
          >
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
      style={{
        cursor: 'pointer',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #E5E7EB',
        background: '#FFFFFF',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          height: '80px',
          backgroundColor: value,
          borderTop: needsBorder ? '1px solid #E5E7EB' : 'none',
          borderLeft: needsBorder ? '1px solid #E5E7EB' : 'none',
          borderRight: needsBorder ? '1px solid #E5E7EB' : 'none',
          borderBottom: '1px solid #E5E7EB',
          position: 'relative',
        }}
      >
        {copied && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            Copied!
          </div>
        )}
      </div>
      <div style={{ padding: '8px 10px' }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#1F2937',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: '11px',
            color: '#6B7280',
            fontFamily: 'monospace',
            marginTop: '2px',
          }}
        >
          {value}
        </div>
        {usage && (
          <div
            style={{
              fontSize: '11px',
              color: '#9CA3AF',
              marginTop: '4px',
              lineHeight: 1.3,
            }}
          >
            {usage}
          </div>
        )}
      </div>
    </div>
  );
}
