import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import type { Root } from 'mdast';
import type { DesignTokenDocument } from '@/types';
import { extractSections } from './extractors';

const processor = unified().use(remarkParse).use(remarkGfm);

export function parseDesignSystem(markdown: string): DesignTokenDocument {
  const tree = processor.parse(markdown) as Root;
  const { title, sections } = extractSections(tree);

  return {
    title: title || 'Untitled Design System',
    sections,
  };
}
