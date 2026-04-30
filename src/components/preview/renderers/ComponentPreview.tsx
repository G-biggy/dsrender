'use client';

import { useState } from 'react';
import type { TokenSection, ContentBlock, TokenMap } from '@/types';
import {
  parseCSSPropsFromCode,
  detectComponentKind,
  cssPropsToReactStyle,
  isJSXCodeBlock,
  type CSSPropsBlock,
  type ComponentKind,
} from '@/lib/parser/css-props-parser';
import { generateTemplateStyles } from '@/lib/component-templates';

/** Check if a code block looks like CSS properties (not JSX, JS, bash, etc.) */
function isCSSPropsBlock(block: ContentBlock): boolean {
  // Skip by language tag
  const lang = block.lang?.toLowerCase() || '';
  if (['jsx', 'tsx', 'javascript', 'js', 'typescript', 'ts', 'bash', 'sh', 'shell', 'html'].includes(lang)) {
    return false;
  }
  // Skip by content analysis
  if (block.code && isJSXCodeBlock(block.code)) {
    return false;
  }
  return true;
}

/**
 * Expand CSS border shorthand into longhand properties to avoid
 * React warnings about mixing shorthand/longhand on re-render.
 */
function expandBorderShorthand(style: React.CSSProperties): React.CSSProperties {
  const result = { ...style };
  if (result.border !== undefined) {
    const border = result.border as string;
    delete result.border;
    const keywords = ['none', 'inherit', 'initial', 'unset', '0', '0px'];
    if (keywords.includes(border)) {
      result.borderWidth = '0px';
      result.borderStyle = 'none';
      result.borderColor = 'transparent';
    } else {
      // Parse "1px solid #color" (3-part)
      const parts3 = String(border).match(/^(\S+)\s+(solid|dashed|dotted|double|groove|ridge|inset|outset)\s+(.+)$/i);
      if (parts3) {
        result.borderWidth = parts3[1];
        result.borderStyle = parts3[2] as React.CSSProperties['borderStyle'];
        result.borderColor = parts3[3];
      } else {
        // Parse "1px solid" (2-part, no color)
        const parts2 = String(border).match(/^(\S+)\s+(solid|dashed|dotted|double|groove|ridge|inset|outset)$/i);
        if (parts2) {
          result.borderWidth = parts2[1];
          result.borderStyle = parts2[2] as React.CSSProperties['borderStyle'];
          result.borderColor = 'currentColor';
        } else {
          // Single value — could be width or style
          result.borderWidth = border;
          result.borderStyle = 'solid';
          result.borderColor = 'currentColor';
        }
      }
    }
  }
  return result;
}

function cleanLabel(raw: string): string {
  return raw
    .replace(/^#+\s*/, '')
    .replace(/^\d+(\.\d+)*\s*/, '')
    .replace(/\(.*\)/, '')
    .trim();
}

function Showcase({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div
        style={{
          backgroundColor: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60px',
        }}
      >
        {children}
      </div>
      <div style={{ fontSize: '11px', color: '#9CA3AF', paddingLeft: '4px' }}>
        {cleanLabel(label)}
      </div>
    </div>
  );
}

const HEADING_STYLE: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#6B7280',
  marginBottom: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const SUBHEADING_STYLE: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 500,
  color: '#374151',
  marginBottom: '12px',
};

const ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '16px',
  alignItems: 'flex-start',
};

const COLUMN_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

export function ComponentPreview({ section, designMap }: { section: TokenSection; designMap?: TokenMap }) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {allSubs.map((sub, i) => (
        <ComponentGroup key={i} heading={sub.heading} content={sub.content} subsections={sub.subsections} designMap={designMap} />
      ))}
    </div>
  );
}

function ComponentGroup({
  heading,
  content,
  subsections,
  designMap,
}: {
  heading: string;
  content: ContentBlock[];
  subsections: TokenSection[];
  designMap?: TokenMap;
}) {
  const kind = detectComponentKind(heading);

  // Filter out non-CSS code blocks (JSX, JS, bash, etc.)
  const codeBlocks = content.filter(
    (c) => c.kind === 'code' && c.code && isCSSPropsBlock(c),
  );

  const nestedGroups = subsections.map((sub) => ({
    heading: sub.heading,
    kind: detectComponentKind(sub.heading),
    codeBlocks: sub.content.filter(
      (c) => c.kind === 'code' && c.code && isCSSPropsBlock(c),
    ),
    proseBlocks: sub.content.filter((c) => c.kind !== 'code'),
    nested: sub.subsections,
  }));

  // Case 1: This group has CSS code blocks
  if (codeBlocks.length > 0 && kind !== 'unknown') {
    return (
      <div>
        <h3 style={HEADING_STYLE}>{cleanLabel(heading)}</h3>
        <div style={ROW_STYLE}>
          {codeBlocks.map((block, j) => {
            const propsBlocks = parseCSSPropsFromCode(block.code!);
            return <ComponentRender key={j} kind={kind} blocks={propsBlocks} label={heading} designMap={designMap} />;
          })}
        </div>
      </div>
    );
  }

  // Case 2: Nested subsections
  if (nestedGroups.length > 0) {
    return (
      <div>
        <h3 style={{ ...HEADING_STYLE, marginBottom: '16px' }}>{cleanLabel(heading)}</h3>
        <div style={COLUMN_STYLE}>
          {nestedGroups.map((ng, k) => {
            const effectiveKind = ng.kind !== 'unknown' ? ng.kind : kind;

            // Deeply nested subsections
            if (ng.nested.length > 0) {
              return (
                <div key={k}>
                  <div style={SUBHEADING_STYLE}>{cleanLabel(ng.heading)}</div>
                  <div style={ROW_STYLE}>
                    {ng.nested.map((deep, d) => {
                      const deepKind = detectComponentKind(deep.heading) !== 'unknown' ? detectComponentKind(deep.heading) : effectiveKind;
                      const deepCode = deep.content.filter(
                        (c) => c.kind === 'code' && c.code && isCSSPropsBlock(c),
                      );

                      // Has CSS code blocks → render from code
                      if (deepCode.length > 0) {
                        return deepCode.map((block, b) => {
                          const propsBlocks = parseCSSPropsFromCode(block.code!);
                          return <ComponentRender key={`${d}-${b}`} kind={deepKind} blocks={propsBlocks} label={deep.heading} designMap={designMap} />;
                        });
                      }

                      // No code blocks → try template
                      if (deepKind !== 'unknown' && designMap) {
                        return <TemplateRender key={d} kind={deepKind} label={deep.heading} designMap={designMap} />;
                      }

                      return null;
                    })}
                  </div>
                </div>
              );
            }

            // Has CSS code blocks → render from code
            if (ng.codeBlocks.length > 0) {
              return (
                <div key={k}>
                  <div style={SUBHEADING_STYLE}>{cleanLabel(ng.heading)}</div>
                  <div style={ROW_STYLE}>
                    {ng.codeBlocks.map((block, b) => {
                      const propsBlocks = parseCSSPropsFromCode(block.code!);
                      return <ComponentRender key={b} kind={effectiveKind} blocks={propsBlocks} label={ng.heading} designMap={designMap} />;
                    })}
                  </div>
                </div>
              );
            }

            // No code blocks → try template for known component kinds
            if (effectiveKind !== 'unknown' && designMap) {
              return (
                <div key={k}>
                  <div style={SUBHEADING_STYLE}>{cleanLabel(ng.heading)}</div>
                  <div style={ROW_STYLE}>
                    <TemplateRender kind={effectiveKind} label={ng.heading} designMap={designMap} />
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    );
  }

  // Case 3: No code blocks, no nested subsections, but known kind → template
  if (kind !== 'unknown' && designMap) {
    return (
      <div>
        <h3 style={HEADING_STYLE}>{cleanLabel(heading)}</h3>
        <div style={ROW_STYLE}>
          <TemplateRender kind={kind} label={heading} designMap={designMap} />
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Renders a component from parsed CSS code blocks (existing behavior, now with design map resolution)
 */
function ComponentRender({ kind, blocks, label, designMap }: { kind: ComponentKind; blocks: CSSPropsBlock[]; label: string; designMap?: TokenMap }) {
  const defaultBlock = blocks.find((b) => b.label.toLowerCase() === 'default') || blocks[0];
  if (!defaultBlock) return null;

  const hoverBlock = blocks.find((b) => /hover/i.test(b.label));
  const baseStyle = cssPropsToReactStyle(defaultBlock.styles, designMap);
  const hoverStyle = hoverBlock ? cssPropsToReactStyle(hoverBlock.styles, designMap) : null;

  switch (kind) {
    case 'button':
      return <ButtonPreview baseStyle={baseStyle} hoverStyle={hoverStyle} label={label} states={blocks} designMap={designMap} />;
    case 'input':
      return <InputPreview baseStyle={baseStyle} label={label} states={blocks} designMap={designMap} />;
    case 'card':
      return <CardPreview blocks={blocks} label={label} designMap={designMap} />;
    case 'tab':
      return <TabPreview states={blocks} label={label} designMap={designMap} />;
    case 'toggle':
      return <TogglePreview states={blocks} label={label} designMap={designMap} />;
    default:
      return <GenericPreview baseStyle={baseStyle} label={label} />;
  }
}

/**
 * Renders a component from template styles (new — for prose-only component sections)
 */
function TemplateRender({ kind, label, designMap }: { kind: ComponentKind; label: string; designMap: TokenMap }) {
  const template = generateTemplateStyles(kind, designMap);
  if (!template) return null;

  switch (kind) {
    case 'button':
      return <ButtonPreview baseStyle={template.default} hoverStyle={template.hover || null} label={label} states={[]} />;
    case 'input':
      return <InputPreview baseStyle={template.default} label={label} states={[]} />;
    case 'card':
      return (
        <Showcase label={label}>
          <div style={{ ...template.default, width: '200px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'inherit' }}>Card Title</div>
            <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.6 }}>Description text</div>
          </div>
        </Showcase>
      );
    case 'tab':
      if (template.hover && template.disabled) {
        return (
          <Showcase label={label}>
            <div style={{ ...template.default }}>
              <div style={{ ...template.hover, cursor: 'pointer' }}>Active Tab</div>
              <div style={{ ...template.disabled }}>Tab Two</div>
              <div style={{ ...template.disabled }}>Tab Three</div>
            </div>
          </Showcase>
        );
      }
      return null;
    case 'toggle':
      if (template.hover && template.disabled) {
        return (
          <Showcase label={label}>
            <div style={{ ...template.default }}>
              <div style={{ ...template.hover, cursor: 'pointer' }}>Original</div>
              <div style={{ ...template.disabled }}>Metric</div>
              <div style={{ ...template.disabled }}>Imperial</div>
            </div>
          </Showcase>
        );
      }
      return null;
    case 'badge':
      return (
        <Showcase label={label}>
          <div style={template.default}>Badge</div>
        </Showcase>
      );
    default:
      return (
        <Showcase label={label}>
          <div style={{ ...template.default, minWidth: '80px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {cleanLabel(label) || 'Component'}
          </div>
        </Showcase>
      );
  }
}

function ButtonPreview({
  baseStyle,
  hoverStyle,
  label,
}: {
  baseStyle: React.CSSProperties;
  hoverStyle: React.CSSProperties | null;
  label: string;
  states?: CSSPropsBlock[];
  designMap?: TokenMap;
}) {
  const [hovered, setHovered] = useState(false);
  const merged = hovered && hoverStyle ? { ...baseStyle, ...hoverStyle } : baseStyle;
  const buttonText = cleanLabel(label).replace(/button/i, '').trim() || 'Button';

  // Expand border shorthand to avoid React shorthand/longhand conflict
  const expanded = expandBorderShorthand(merged);
  const style: React.CSSProperties = {
    ...expanded,
    borderWidth: expanded.borderWidth || '0px',
    borderStyle: expanded.borderStyle || 'none',
    borderColor: expanded.borderColor || 'transparent',
    cursor: 'pointer',
    fontSize: expanded.fontSize || '16px',
    fontWeight: expanded.fontWeight || 500,
    fontFamily: expanded.fontFamily || 'inherit',
    transition: 'all 0.15s ease',
  };

  return (
    <Showcase label={label}>
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={style}
      >
        {buttonText}
      </button>
    </Showcase>
  );
}

function InputPreview({
  baseStyle,
  label,
}: {
  baseStyle: React.CSSProperties;
  label: string;
  states?: CSSPropsBlock[];
  designMap?: TokenMap;
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
          fontFamily: baseStyle.fontFamily || 'inherit',
          width: baseStyle.width || '300px',
          boxSizing: 'border-box',
        }}
      />
    </Showcase>
  );
}

function CardPreview({ blocks, label, designMap }: { blocks: CSSPropsBlock[]; label: string; designMap?: TokenMap }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
      {blocks.map((block, i) => {
        const raw = cssPropsToReactStyle(block.styles, designMap);
        const expanded = expandBorderShorthand(raw);
        const style: React.CSSProperties = {
          ...expanded,
          width: '200px',
          minHeight: '100px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: expanded.padding || '20px',
        };
        if (!expanded.borderWidth && !expanded.borderColor) {
          style.borderWidth = '1px';
          style.borderStyle = 'solid';
          style.borderColor = '#E5E7EB';
        }
        return (
          <Showcase key={i} label={`${cleanLabel(label)} — ${block.label}`}>
            <div style={style}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Card Title</div>
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Description text</div>
            </div>
          </Showcase>
        );
      })}
    </div>
  );
}

function TabPreview({ states, label, designMap }: { states: CSSPropsBlock[]; label: string; designMap?: TokenMap }) {
  const containerBlock = states.find((b) => /container/i.test(b.label));
  const inactiveBlock = states.find((b) => /inactive/i.test(b.label));
  const activeBlock = states.find((b) => /active/i.test(b.label));

  const containerStyle = containerBlock ? cssPropsToReactStyle(containerBlock.styles, designMap) : { background: '#F3F4F6', borderRadius: '12px', padding: '4px' };
  const inactiveStyle = inactiveBlock
    ? cssPropsToReactStyle(inactiveBlock.styles, designMap)
    : { padding: '8px 16px', borderRadius: '8px', color: '#6B7280' };
  const activeStyle = activeBlock
    ? cssPropsToReactStyle(activeBlock.styles, designMap)
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

function TogglePreview({ states, label, designMap }: { states: CSSPropsBlock[]; label: string; designMap?: TokenMap }) {
  const containerBlock = states.find((b) => /container/i.test(b.label));
  const inactiveBlock = states.find((b) => /inactive/i.test(b.label));
  const activeBlock = states.find((b) => /active/i.test(b.label));

  const containerStyle = containerBlock ? cssPropsToReactStyle(containerBlock.styles, designMap) : { background: '#F3F4F6', borderRadius: '8px', padding: '4px' };
  const inactiveStyle = inactiveBlock
    ? cssPropsToReactStyle(inactiveBlock.styles, designMap)
    : { padding: '6px 12px', borderRadius: '6px', color: '#6B7280', fontSize: '14px' };
  const activeStyle = activeBlock
    ? cssPropsToReactStyle(activeBlock.styles, designMap)
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
}: {
  baseStyle: React.CSSProperties;
  label: string;
}) {
  const text = cleanLabel(label) || 'Component';
  const expanded = expandBorderShorthand(baseStyle);
  const style: React.CSSProperties = {
    ...expanded,
    minWidth: '80px',
    minHeight: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
  };
  if (!expanded.borderWidth && !expanded.borderColor) {
    style.borderWidth = '1px';
    style.borderStyle = 'solid';
    style.borderColor = '#E5E7EB';
  }

  return (
    <Showcase label={label}>
      <div style={style}>
        {text}
      </div>
    </Showcase>
  );
}
