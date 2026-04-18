import type { Root, Heading, Table, Code, Content, List, ListItem, Paragraph, BlockContent } from 'mdast';
import type { TokenSection, SectionType, TokenEntry } from '@/types';
import { detectSectionByHeading, detectSectionByColumns, detectSectionByVariablePrefix } from './detect-section';
import { parseTable } from './table-parser';
import { parseCodeBlock } from './code-block-parser';

interface HeadingContext {
  text: string;
  level: number;
  type: SectionType;
}

function getHeadingText(heading: Heading): string {
  let text = '';
  for (const child of heading.children) {
    if (child.type === 'text') {
      text += child.value;
    } else if (child.type === 'inlineCode') {
      text += child.value;
    } else if ('children' in child) {
      for (const grandchild of (child as { children: Array<{ type: string; value?: string }> }).children) {
        if ('value' in grandchild) {
          text += grandchild.value;
        }
      }
    }
  }
  return text.trim();
}

export function extractSections(tree: Root): { title: string; sections: TokenSection[] } {
  let title = '';
  const sections: TokenSection[] = [];
  const sectionStack: { section: TokenSection; level: number }[] = [];
  let currentContext: HeadingContext | null = null;

  // Collect all content nodes between headings into groups
  const groups = groupByHeading(tree.children as Content[]);

  for (const group of groups) {
    if (group.heading) {
      const headingText = getHeadingText(group.heading);
      const level = group.heading.depth;

      // H1 is the document title
      if (level === 1 && !title) {
        title = headingText;
        continue;
      }

      // Detect section type from heading
      let type = detectSectionByHeading(headingText);

      // If unknown, inherit from parent context
      if (type === 'unknown' && currentContext && level > currentContext.level) {
        type = currentContext.type;
      }

      const section: TokenSection = {
        type,
        heading: headingText,
        level,
        tokens: [],
        subsections: [],
        rawMarkdown: '',
        content: [],
      };

      // Process content under this heading
      processContent(group.content, section, type);

      // Refine type based on content if still unknown
      if (section.type === 'unknown' && section.tokens.length > 0) {
        const refinedType = inferTypeFromTokens(section.tokens);
        if (refinedType) section.type = refinedType;
      }

      // Place into hierarchy
      // Pop stack to find parent at lower level
      while (sectionStack.length > 0 && sectionStack[sectionStack.length - 1].level >= level) {
        sectionStack.pop();
      }

      if (sectionStack.length > 0) {
        // This is a subsection
        sectionStack[sectionStack.length - 1].section.subsections.push(section);
      } else {
        // Top-level section
        sections.push(section);
      }

      sectionStack.push({ section, level });

      // Update context for children
      if (type !== 'unknown') {
        currentContext = { text: headingText, level, type };
      } else if (currentContext && level <= currentContext.level) {
        currentContext = null;
      }
    }
  }

  return { title, sections };
}

interface HeadingGroup {
  heading: Heading | null;
  content: Content[];
}

function groupByHeading(nodes: Content[]): HeadingGroup[] {
  const groups: HeadingGroup[] = [];
  let currentGroup: HeadingGroup = { heading: null, content: [] };

  for (const node of nodes) {
    if (node.type === 'heading') {
      // Start a new group
      if (currentGroup.heading || currentGroup.content.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = { heading: node as Heading, content: [] };
    } else {
      currentGroup.content.push(node);
    }
  }

  if (currentGroup.heading || currentGroup.content.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

function inlineToText(node: Content): string {
  if ('value' in node) return (node as { value: string }).value;
  if ('children' in node) {
    return ((node as { children: Content[] }).children).map(inlineToText).join('');
  }
  return '';
}

function processContent(nodes: Content[], section: TokenSection, contextType: SectionType): void {
  for (const node of nodes) {
    if (node.type === 'table') {
      const { headers, entries } = parseTable(node as Table);

      // Try to refine section type from column headers
      if (section.type === 'unknown') {
        const columnType = detectSectionByColumns(headers);
        if (columnType) section.type = columnType;
      }

      section.tokens.push(...entries);

      // Also store as content block for fallback rendering
      const tableNode = node as Table;
      const rows = tableNode.children.slice(1).map((row) =>
        ((row as { children: Array<{ children: Content[] }> }).children).map((cell) =>
          cell.children.map(inlineToText).join('')
        )
      );
      section.content.push({
        kind: 'table',
        headers,
        rows,
      });
    } else if (node.type === 'code') {
      const codeNode = node as Code;
      const lang = (codeNode.lang || '').toLowerCase();

      // Parse CSS code blocks for variables
      if (lang === 'css' || lang === '' || !lang) {
        const { entries } = parseCodeBlock(codeNode.value);
        if (entries.length > 0) {
          if (section.type === 'unknown' && entries.length > 0) {
            const varType = detectSectionByVariablePrefix(entries[0].name.replace(/^--/, ''));
            if (varType) section.type = varType;
          }
          section.tokens.push(...entries);
        }
      }

      // Always store code blocks as content
      section.content.push({
        kind: 'code',
        lang: codeNode.lang || undefined,
        code: codeNode.value,
      });
    } else if (node.type === 'paragraph') {
      const text = (node as Paragraph).children.map(inlineToText).join('');
      section.content.push({ kind: 'paragraph', text });
    } else if (node.type === 'list') {
      const listNode = node as List;
      const items = listNode.children.map((item: ListItem) => {
        return (item.children as BlockContent[]).map((child) => {
          if ('children' in child) {
            return (child as Paragraph).children.map(inlineToText).join('');
          }
          return inlineToText(child as unknown as Content);
        }).join('\n');
      });
      section.content.push({
        kind: 'list',
        items,
        ordered: listNode.ordered ?? false,
      });
    } else if (node.type === 'blockquote') {
      const text = ((node as { children: Content[] }).children)
        .map((child) => {
          if ('children' in child) {
            return ((child as { children: Content[] }).children).map(inlineToText).join('');
          }
          return inlineToText(child);
        })
        .join('\n');
      section.content.push({ kind: 'blockquote', text });
    } else if (node.type === 'thematicBreak') {
      section.content.push({ kind: 'thematicBreak' });
    }
  }
}

function inferTypeFromTokens(tokens: TokenEntry[]): SectionType | null {
  // Check if most values look like colors
  const colorCount = tokens.filter(
    (t) => /^#[0-9a-fA-F]+$/.test(t.value.trim()) || /^rgba?\s*\(/.test(t.value.trim())
  ).length;
  if (colorCount > tokens.length * 0.5) return 'colors';

  // Check if values look like sizes
  const sizeCount = tokens.filter(
    (t) => /^\d+(\.\d+)?\s*(px|rem|em)$/.test(t.value.trim())
  ).length;
  if (sizeCount > tokens.length * 0.5) return 'spacing';

  // Check variable name prefixes
  if (tokens.length > 0) {
    return detectSectionByVariablePrefix(tokens[0].name.replace(/^--/, ''));
  }

  return null;
}
