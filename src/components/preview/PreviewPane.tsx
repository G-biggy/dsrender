'use client';

import type { DesignTokenDocument, TokenSection } from '@/types';
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

const TOKEN_RENDERERS: Record<string, React.ComponentType<{ section: TokenSection }>> = {
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
  if (!document) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
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
      style={{
        padding: '32px',
        overflowY: 'auto',
        height: '100%',
        backgroundColor: '#FAFAFA',
      }}
    >
      {/* Document title */}
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

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {document.sections.map((section, i) => (
          <SectionBlock key={i} section={section} />
        ))}
      </div>
    </div>
  );
}

function SectionBlock({ section }: { section: TokenSection }) {
  const TokenRenderer = TOKEN_RENDERERS[section.type];
  const hasTokens =
    section.tokens.length > 0 ||
    section.subsections.some((s) => s.tokens.length > 0);
  const hasContent = section.content.length > 0;
  const hasSubsections = section.subsections.length > 0;

  // Skip completely empty sections
  if (!hasTokens && !hasContent && !hasSubsections) return null;

  return (
    <div>
      {/* Section heading */}
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

      {/* Components renderer — works off content/subsections, not tokens */}
      {section.type === 'components' && (hasContent || hasSubsections) && (
        <ComponentPreview section={section} />
      )}

      {/* Icons renderer — combines size tokens + content tables */}
      {section.type === 'icons' && (hasContent || hasSubsections || hasTokens) && (
        <IconSizes section={section} />
      )}

      {/* Token renderer for other recognized types */}
      {TokenRenderer && hasTokens && section.type !== 'components' && section.type !== 'icons' && (
        <div style={{ marginBottom: hasContent ? '20px' : 0 }}>
          <TokenRenderer section={section} />
        </div>
      )}

      {/* Content blocks for non-token content or unknown sections */}
      {(!TokenRenderer || section.type === 'unknown') && hasContent && (
        <ContentRenderer blocks={section.content} />
      )}

      {/* Render subsections that have their own content but no tokens */}
      {section.type !== 'components' && section.type !== 'icons' && hasSubsections && section.subsections.map((sub, i) => (
        <SubsectionBlock key={i} subsection={sub} parentType={section.type} />
      ))}
    </div>
  );
}

function SubsectionBlock({ subsection, parentType }: { subsection: TokenSection; parentType: string }) {
  const TokenRenderer = TOKEN_RENDERERS[subsection.type];
  const hasTokens = subsection.tokens.length > 0;
  const hasContent = subsection.content.length > 0;
  const hasNestedSubs = subsection.subsections.length > 0;

  // If parent already rendered these tokens via its renderer, skip
  if (TokenRenderer && parentType === subsection.type) return null;

  if (!hasTokens && !hasContent && !hasNestedSubs) return null;

  return (
    <div style={{ marginTop: '20px' }}>
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#4B5563',
          marginBottom: '12px',
        }}
      >
        {subsection.heading}
      </h3>

      {TokenRenderer && hasTokens && (
        <div style={{ marginBottom: hasContent ? '12px' : 0 }}>
          <TokenRenderer section={subsection} />
        </div>
      )}

      {(!TokenRenderer) && hasContent && (
        <ContentRenderer blocks={subsection.content} />
      )}

      {hasNestedSubs && subsection.subsections.map((nested, i) => (
        <SubsectionBlock key={i} subsection={nested} parentType={subsection.type} />
      ))}
    </div>
  );
}
