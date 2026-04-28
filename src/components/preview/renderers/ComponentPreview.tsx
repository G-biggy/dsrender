'use client';

import { useState } from 'react';
import type { TokenSection, ContentBlock } from '@/types';
import {
  parseCSSPropsFromCode,
  detectComponentKind,
  cssPropsToReactStyle,
  type CSSPropsBlock,
  type ComponentKind,
} from '@/lib/parser/css-props-parser';

function cleanLabel(raw: string): string {
  return raw
    .replace(/^#+\s*/, '')
    .replace(/^\d+(\.\d+)*\s*/, '')
    .replace(/\(.*\)/, '')
    .trim();
}

function Showcase({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex items-center justify-center min-h-[60px]">
        {children}
      </div>
      <div className="text-[11px] text-gray-400 dark:text-gray-500 pl-1">
        {cleanLabel(label)}
      </div>
    </div>
  );
}

export function ComponentPreview({ section }: { section: TokenSection }) {
  const allSubs = [
    ...(section.content.length > 0
      ? [{ heading: section.heading, content: section.content, subsections: [] as TokenSection[] }]
      : []),
    ...section.subsections.map((s) => ({
      heading: s.heading,
      content: s.content,
      subsections: s.subsections,
    })),
  ];

  return (
    <div className="flex flex-col gap-8">
      {allSubs.map((sub, i) => (
        <ComponentGroup key={i} heading={sub.heading} content={sub.content} subsections={sub.subsections} />
      ))}
    </div>
  );
}

function ComponentGroup({
  heading,
  content,
  subsections,
}: {
  heading: string;
  content: ContentBlock[];
  subsections: TokenSection[];
}) {
  const kind = detectComponentKind(heading);
  const codeBlocks = content.filter((c) => c.kind === 'code' && c.code);
  const nestedGroups = subsections.map((sub) => ({
    heading: sub.heading,
    kind: detectComponentKind(sub.heading),
    codeBlocks: sub.content.filter((c) => c.kind === 'code' && c.code),
    nested: sub.subsections,
  }));

  if (codeBlocks.length > 0 && kind !== 'unknown') {
    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
          {cleanLabel(heading)}
        </h3>
        <div className="flex flex-wrap gap-4 items-start">
          {codeBlocks.map((block, j) => {
            const propsBlocks = parseCSSPropsFromCode(block.code!);
            return <ComponentRender key={j} kind={kind} blocks={propsBlocks} label={heading} />;
          })}
        </div>
      </div>
    );
  }

  if (nestedGroups.length > 0) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wide">
          {cleanLabel(heading)}
        </h3>
        <div className="flex flex-col gap-6">
          {nestedGroups.map((ng, k) => {
            const effectiveKind = ng.kind !== 'unknown' ? ng.kind : kind;

            if (ng.nested.length > 0) {
              return (
                <div key={k}>
                  <div className="text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {cleanLabel(ng.heading)}
                  </div>
                  <div className="flex flex-wrap gap-4 items-start">
                    {ng.nested.map((deep, d) => {
                      const deepKind = detectComponentKind(deep.heading) !== 'unknown' ? detectComponentKind(deep.heading) : effectiveKind;
                      const deepCode = deep.content.filter((c) => c.kind === 'code' && c.code);
                      return deepCode.map((block, b) => {
                        const propsBlocks = parseCSSPropsFromCode(block.code!);
                        return <ComponentRender key={`${d}-${b}`} kind={deepKind} blocks={propsBlocks} label={deep.heading} />;
                      });
                    })}
                  </div>
                </div>
              );
            }

            if (ng.codeBlocks.length === 0) return null;

            return (
              <div key={k}>
                <div className="text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {cleanLabel(ng.heading)}
                </div>
                <div className="flex flex-wrap gap-4 items-start">
                  {ng.codeBlocks.map((block, b) => {
                    const propsBlocks = parseCSSPropsFromCode(block.code!);
                    return <ComponentRender key={b} kind={effectiveKind} blocks={propsBlocks} label={ng.heading} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

function ComponentRender({ kind, blocks, label }: { kind: ComponentKind; blocks: CSSPropsBlock[]; label: string }) {
  const defaultBlock = blocks.find((b) => b.label.toLowerCase() === 'default') || blocks[0];
  if (!defaultBlock) return null;

  const hoverBlock = blocks.find((b) => /hover/i.test(b.label));
  const baseStyle = cssPropsToReactStyle(defaultBlock.styles);
  const hoverStyle = hoverBlock ? cssPropsToReactStyle(hoverBlock.styles) : null;

  switch (kind) {
    case 'button':
      return <ButtonPreview baseStyle={baseStyle} hoverStyle={hoverStyle} label={label} states={blocks} />;
    case 'input':
      return <InputPreview baseStyle={baseStyle} label={label} states={blocks} />;
    case 'card':
      return <CardPreview blocks={blocks} label={label} />;
    case 'tab':
      return <TabPreview states={blocks} label={label} />;
    case 'toggle':
      return <TogglePreview states={blocks} label={label} />;
    default:
      return <GenericPreview baseStyle={baseStyle} label={label} states={blocks} />;
  }
}

function ButtonPreview({
  baseStyle,
  hoverStyle,
  label,
  states,
}: {
  baseStyle: React.CSSProperties;
  hoverStyle: React.CSSProperties | null;
  label: string;
  states: CSSPropsBlock[];
}) {
  const [hovered, setHovered] = useState(false);
  const style = hovered && hoverStyle ? { ...baseStyle, ...hoverStyle } : baseStyle;
  const buttonText = cleanLabel(label).replace(/button/i, '').trim() || 'Button';

  return (
    <Showcase label={label}>
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...style,
          border: style.border || 'none',
          cursor: 'pointer',
          fontSize: style.fontSize || '16px',
          fontWeight: style.fontWeight || 500,
          fontFamily: 'inherit',
          transition: 'all 0.15s ease',
        }}
      >
        {buttonText}
      </button>
    </Showcase>
  );
}

function InputPreview({
  baseStyle,
  label,
  states,
}: {
  baseStyle: React.CSSProperties;
  label: string;
  states: CSSPropsBlock[];
}) {
  return (
    <Showcase label={label}>
      <input
        type="text"
        placeholder="Placeholder text..."
        readOnly
        style={{
          ...baseStyle,
          outline: 'none',
          fontFamily: 'inherit',
          width: '300px',
          boxSizing: 'border-box',
        }}
      />
    </Showcase>
  );
}

function CardPreview({ blocks, label }: { blocks: CSSPropsBlock[]; label: string }) {
  return (
    <div className="flex flex-wrap gap-4">
      {blocks.map((block, i) => {
        const style = cssPropsToReactStyle(block.styles);
        return (
          <Showcase key={i} label={`${cleanLabel(label)} — ${block.label}`}>
            <div
              style={{
                ...style,
                width: '200px',
                minHeight: '100px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: style.padding || '20px',
                border: style.border || '1px solid #E5E7EB',
              }}
            >
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Card Title</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Description text</div>
            </div>
          </Showcase>
        );
      })}
    </div>
  );
}

function TabPreview({ states, label }: { states: CSSPropsBlock[]; label: string }) {
  const containerBlock = states.find((b) => /container/i.test(b.label));
  const inactiveBlock = states.find((b) => /inactive/i.test(b.label));
  const activeBlock = states.find((b) => /active/i.test(b.label));

  const containerStyle = containerBlock ? cssPropsToReactStyle(containerBlock.styles) : { background: '#F3F4F6', borderRadius: '12px', padding: '4px' };
  const inactiveStyle = inactiveBlock
    ? cssPropsToReactStyle(inactiveBlock.styles)
    : { padding: '8px 16px', borderRadius: '8px', color: '#6B7280' };
  const activeStyle = activeBlock
    ? cssPropsToReactStyle(activeBlock.styles)
    : { padding: '8px 16px', borderRadius: '8px', background: 'white', color: '#1F2937', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };

  if (!inactiveStyle.color || inactiveStyle.color === 'transparent') {
    inactiveStyle.color = '#6B7280';
  }

  return (
    <Showcase label={label}>
      <div style={{ ...containerStyle, display: 'flex', gap: '2px' }}>
        <div style={{ ...activeStyle, cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>Active Tab</div>
        <div style={{ ...inactiveStyle, cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>Tab Two</div>
        <div style={{ ...inactiveStyle, cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>Tab Three</div>
      </div>
    </Showcase>
  );
}

function TogglePreview({ states, label }: { states: CSSPropsBlock[]; label: string }) {
  const containerBlock = states.find((b) => /container/i.test(b.label));
  const inactiveBlock = states.find((b) => /inactive/i.test(b.label));
  const activeBlock = states.find((b) => /active/i.test(b.label));

  const containerStyle = containerBlock ? cssPropsToReactStyle(containerBlock.styles) : { background: '#F3F4F6', borderRadius: '8px', padding: '4px' };
  const inactiveStyle = inactiveBlock
    ? cssPropsToReactStyle(inactiveBlock.styles)
    : { padding: '6px 12px', borderRadius: '6px', color: '#6B7280', fontSize: '14px' };
  const activeStyle = activeBlock
    ? cssPropsToReactStyle(activeBlock.styles)
    : { padding: '6px 12px', borderRadius: '6px', background: '#F97316', color: 'white', fontSize: '14px' };

  if (!inactiveStyle.color || inactiveStyle.color === 'transparent') {
    inactiveStyle.color = '#6B7280';
  }

  return (
    <Showcase label={label}>
      <div style={{ ...containerStyle, display: 'inline-flex', gap: '2px' }}>
        <div style={{ ...activeStyle, cursor: 'pointer', fontWeight: 500 }}>Original</div>
        <div style={{ ...inactiveStyle, cursor: 'pointer', fontWeight: 500 }}>Metric</div>
        <div style={{ ...inactiveStyle, cursor: 'pointer', fontWeight: 500 }}>Imperial</div>
      </div>
    </Showcase>
  );
}

function GenericPreview({
  baseStyle,
  label,
  states,
}: {
  baseStyle: React.CSSProperties;
  label: string;
  states: CSSPropsBlock[];
}) {
  const text = cleanLabel(label) || 'Component';

  return (
    <Showcase label={label}>
      <div
        style={{
          ...baseStyle,
          minWidth: '80px',
          minHeight: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          border: baseStyle.border || '1px solid #E5E7EB',
        }}
      >
        {text}
      </div>
    </Showcase>
  );
}
