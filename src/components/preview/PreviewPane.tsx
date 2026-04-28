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
      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
        Start typing to see your design system
      </div>
    );
  }

  return (
    <div
      id="preview-pane"
      className="p-8 overflow-y-auto h-full bg-gray-50 dark:bg-gray-950"
    >
      {/* Document title */}
      <h1 className="text-[28px] font-bold text-gray-900 dark:text-gray-100 mb-8 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
        {document.title}
      </h1>

      {/* Sections */}
      <div className="flex flex-col gap-10">
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

  if (!hasTokens && !hasContent && !hasSubsections) return null;

  return (
    <div>
      {/* Section heading */}
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
        {section.type !== 'unknown' && (
          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
            {section.type}
          </span>
        )}
        {section.heading}
      </h2>

      {section.type === 'components' && (hasContent || hasSubsections) && (
        <ComponentPreview section={section} />
      )}

      {section.type === 'icons' && (hasContent || hasSubsections || hasTokens) && (
        <IconSizes section={section} />
      )}

      {TokenRenderer && hasTokens && section.type !== 'components' && section.type !== 'icons' && (
        <div className={hasContent ? 'mb-5' : ''}>
          <TokenRenderer section={section} />
        </div>
      )}

      {hasContent && (!hasTokens || section.type === 'unknown') && section.type !== 'components' && section.type !== 'icons' && (
        <ContentRenderer blocks={section.content} />
      )}

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

  if (TokenRenderer && parentType === subsection.type) return null;

  if (!hasTokens && !hasContent && !hasNestedSubs) return null;

  return (
    <div className="mt-5">
      <h3 className="text-base font-semibold text-gray-600 dark:text-gray-400 mb-3">
        {subsection.heading}
      </h3>

      {TokenRenderer && hasTokens && (
        <div className={hasContent ? 'mb-3' : ''}>
          <TokenRenderer section={subsection} />
        </div>
      )}

      {hasContent && !hasTokens && (
        <ContentRenderer blocks={subsection.content} />
      )}

      {hasNestedSubs && subsection.subsections.map((nested, i) => (
        <SubsectionBlock key={i} subsection={nested} parentType={subsection.type} />
      ))}
    </div>
  );
}
