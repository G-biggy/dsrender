'use client';

import { useMemo } from 'react';
import type { DesignTokenDocument, TokenSection, TokenMap } from '@/types';
import { buildDesignMap } from '@/lib/design-resolver';
import { DEFAULT_ACCENT } from '@/lib/render-defaults';
import { ColorSwatches } from './renderers/ColorSwatches';
import { TypographySpecimen } from './renderers/TypographySpecimen';
import { SpacingScale } from './renderers/SpacingScale';
import { ShadowCards } from './renderers/ShadowCards';
import { RadiusPreview } from './renderers/RadiusPreview';
import { BreakpointRuler } from './renderers/BreakpointRuler';
import { ContentRenderer } from './renderers/ContentRenderer';
import { ComponentPreview } from './renderers/ComponentPreview';
import { IconSizes } from './renderers/IconSizes';
import { MotionPreview } from './renderers/MotionPreview';
import { EffectsPreview } from './renderers/EffectsPreview';
import { LayoutPreview } from './renderers/LayoutPreview';
import { ZIndexPreview } from './renderers/ZIndexPreview';

type RendererProps = { section: TokenSection; designMap?: TokenMap; specimenColor?: string };

const TOKEN_RENDERERS: Record<string, React.ComponentType<RendererProps>> = {
  colors: ColorSwatches,
  typography: TypographySpecimen,
  spacing: SpacingScale,
  shadows: ShadowCards,
  radius: RadiusPreview,
  breakpoints: BreakpointRuler,
  components: ComponentPreview,
  icons: IconSizes,
  motion: MotionPreview,
  effects: EffectsPreview,
  layout: LayoutPreview,
  zindex: ZIndexPreview,
};

export function PreviewPane({ document }: { document: DesignTokenDocument | null }) {
  const designMap = useMemo<TokenMap>(
    () => (document ? buildDesignMap(document) : new Map()),
    [document],
  );

  if (!document) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          backgroundColor: '#FAFAFA',
          color: '#9CA3AF',
          fontSize: '14px',
        }}
      >
        Start typing to see your design system
      </div>
    );
  }

  return (
    <div
      id="preview-pane"
      style={{
        padding: '32px',
        overflowY: 'auto',
        height: '100%',
        backgroundColor: '#FAFAFA',
      }}
    >
      <h1
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#111827',
          marginBottom: '32px',
          paddingBottom: '16px',
          borderBottom: '2px solid #E5E7EB',
        }}
      >
        {document.title}
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {document.sections.map((section, i) => (
          <SectionBlock
            key={i}
            section={section}
            designMap={designMap}
            specimenColor={document.specimenColor}
          />
        ))}
      </div>

      <DefaultColorNote effective={document.specimenColor ?? DEFAULT_ACCENT} />
    </div>
  );
}

function DefaultColorNote({ effective }: { effective: string }) {
  return (
    <div
      style={{
        marginTop: '64px',
        paddingTop: '20px',
        borderTop: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        fontSize: '11px',
        color: '#9CA3AF',
        lineHeight: 1.5,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: effective,
          flexShrink: 0,
          marginTop: '2px',
        }}
      />
      <span>
        Specimens without a color in your markdown — spacing tiles, z-index layers, glow halos, breakpoint marks — render in <code style={{ fontFamily: 'monospace', color: '#6B7280' }}>{effective}</code>. Edit the hex inside the <code style={{ fontFamily: 'monospace', color: '#6B7280' }}>## dsrender spec</code> section in your markdown to change it.
      </span>
    </div>
  );
}

function SectionBlock({ section, designMap, specimenColor }: { section: TokenSection; designMap: TokenMap; specimenColor?: string }) {
  const TokenRenderer = TOKEN_RENDERERS[section.type];
  const hasTokens =
    section.tokens.length > 0 ||
    section.subsections.some((s) => s.tokens.length > 0);
  const hasContent = section.content.length > 0;
  const hasSubsections = section.subsections.length > 0;

  if (!hasTokens && !hasContent && !hasSubsections) return null;

  return (
    <div>
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#374151',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {section.type !== 'unknown' && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              backgroundColor: '#F3F4F6',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            {section.type}
          </span>
        )}
        {section.heading}
      </h2>

      {section.type === 'components' && (hasContent || hasSubsections) && (
        <ComponentPreview section={section} designMap={designMap} />
      )}

      {section.type === 'icons' && (hasContent || hasSubsections || hasTokens) && (
        <IconSizes section={section} />
      )}

      {TokenRenderer && hasTokens && section.type !== 'components' && section.type !== 'icons' && (
        <div style={{ marginBottom: hasContent ? '20px' : 0 }}>
          <TokenRenderer section={section} designMap={designMap} specimenColor={specimenColor} />
        </div>
      )}

      {hasContent && (!hasTokens || section.type === 'unknown') && section.type !== 'components' && section.type !== 'icons' && (
        <ContentRenderer blocks={section.content} />
      )}

      {section.type !== 'components' && section.type !== 'icons' && section.type !== 'typography' && hasSubsections && section.subsections.map((sub, i) => (
        <SubsectionBlock key={i} subsection={sub} parentType={section.type} designMap={designMap} specimenColor={specimenColor} />
      ))}
    </div>
  );
}

function SubsectionBlock({ subsection, parentType, designMap, specimenColor }: { subsection: TokenSection; parentType: string; designMap: TokenMap; specimenColor?: string }) {
  const TokenRenderer = TOKEN_RENDERERS[subsection.type];
  const hasTokens = subsection.tokens.length > 0;
  const hasContent = subsection.content.length > 0;
  const hasNestedSubs = subsection.subsections.length > 0;

  if (TokenRenderer && parentType === subsection.type) return null;

  if (!hasTokens && !hasContent && !hasNestedSubs) return null;

  return (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#4B5563', marginBottom: '12px' }}>
        {subsection.heading}
      </h3>

      {TokenRenderer && hasTokens && (
        <div style={{ marginBottom: hasContent ? '12px' : 0 }}>
          <TokenRenderer section={subsection} designMap={designMap} specimenColor={specimenColor} />
        </div>
      )}

      {hasContent && !hasTokens && (
        <ContentRenderer blocks={subsection.content} />
      )}

      {hasNestedSubs && subsection.subsections.map((nested, i) => (
        <SubsectionBlock key={i} subsection={nested} parentType={subsection.type} designMap={designMap} specimenColor={specimenColor} />
      ))}
    </div>
  );
}
