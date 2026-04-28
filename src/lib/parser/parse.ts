import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import type { Root } from 'mdast';
import type { DesignTokenDocument, TokenSection, TokenEntry, SectionType } from '@/types';
import { extractSections } from './extractors';

const processor = unified().use(remarkParse).use(remarkGfm);

export function parseDesignSystem(markdown: string): DesignTokenDocument {
  // Check for YAML frontmatter
  const yamlResult = tryParseYAMLFrontmatter(markdown);
  if (yamlResult) {
    return yamlResult;
  }

  const tree = processor.parse(markdown) as Root;
  const { title, sections } = extractSections(tree);

  return {
    title: title || 'Untitled Design System',
    sections,
  };
}

/**
 * Parse YAML-style frontmatter design systems (e.g., Google design.md spec).
 * Format:
 * ---
 * name: Theme Name
 * colors:
 *   token-name: "#hex"
 * typography:
 *   role:
 *     fontFamily: Inter
 *     fontSize: 32px
 * ---
 */
function tryParseYAMLFrontmatter(markdown: string): DesignTokenDocument | null {
  const trimmed = markdown.trim();
  if (!trimmed.startsWith('---')) return null;

  const endIdx = trimmed.indexOf('---', 3);
  if (endIdx === -1) return null;

  const yamlBlock = trimmed.slice(3, endIdx).trim();
  const parsed = parseSimpleYAML(yamlBlock);
  if (!parsed || typeof parsed !== 'object') return null;

  const title = (parsed as Record<string, unknown>)['name'] as string || 'Untitled Design System';
  const sections: TokenSection[] = [];

  const sectionTypeMap: Record<string, SectionType> = {
    colors: 'colors',
    typography: 'typography',
    spacing: 'spacing',
    shadows: 'shadows',
    radius: 'radius',
    rounded: 'radius',
    shapes: 'radius',
    breakpoints: 'breakpoints',
    motion: 'motion',
    effects: 'effects',
    layout: 'layout',
    zindex: 'zindex',
    elevation: 'shadows',
    components: 'components',
  };

  // Collect all flat tokens for reference resolution
  const allTokenValues: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof value !== 'object' || value === null) continue;
    for (const [tokenName, tokenVal] of Object.entries(value as Record<string, unknown>)) {
      if (typeof tokenVal === 'string') {
        allTokenValues[`${key}.${tokenName}`] = tokenVal;
      }
    }
  }

  function resolveTokenRef(val: string): string {
    if (!val.startsWith('{') || !val.endsWith('}')) return val;
    const path = val.slice(1, -1);
    return allTokenValues[path] || val;
  }

  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (key === 'name' || key === 'version' || key === 'description' || typeof value !== 'object' || value === null) continue;

    const type = sectionTypeMap[key] || 'unknown';

    // Handle components specially — generate CSS code blocks for each component
    if (type === 'components') {
      const componentMap = new Map<string, { variant: string; styles: Record<string, string> }[]>();

      for (const [compName, compVal] of Object.entries(value as Record<string, unknown>)) {
        if (typeof compVal !== 'object' || compVal === null) continue;

        // Parse base name and variant (e.g., "button-primary-hover" -> base "button-primary", variant "hover")
        const knownVariants = ['hover', 'active', 'pressed', 'disabled', 'focus', 'selected'];
        let baseName = compName;
        let variant = 'Default';
        for (const v of knownVariants) {
          if (compName.endsWith(`-${v}`)) {
            baseName = compName.slice(0, -(v.length + 1));
            variant = v.charAt(0).toUpperCase() + v.slice(1);
            break;
          }
        }

        if (!componentMap.has(baseName)) componentMap.set(baseName, []);

        // Convert YAML props to CSS props, resolving token references
        const styles: Record<string, string> = {};
        const propMap: Record<string, string> = {
          backgroundColor: 'background',
          textColor: 'color',
          rounded: 'border-radius',
          padding: 'padding',
          height: 'height',
          width: 'width',
          size: 'width',
        };

        for (const [prop, val] of Object.entries(compVal as Record<string, string>)) {
          const cssProp = propMap[prop] || prop;
          const resolved = resolveTokenRef(String(val));
          styles[cssProp] = resolved;
        }

        componentMap.get(baseName)!.push({ variant, styles });
      }

      // Build subsections with code content blocks
      const subsections: TokenSection[] = [];
      for (const [compName, variants] of componentMap) {
        const codeLines: string[] = [];
        for (const { variant, styles } of variants) {
          codeLines.push(`/* ${variant} */`);
          for (const [prop, val] of Object.entries(styles)) {
            codeLines.push(`${prop}: ${val};`);
          }
          codeLines.push('');
        }

        subsections.push({
          type: 'components',
          heading: compName,
          level: 3,
          tokens: [],
          subsections: [],
          rawMarkdown: '',
          content: [{
            kind: 'code',
            lang: 'css',
            code: codeLines.join('\n'),
          }],
        });
      }

      sections.push({
        type: 'components',
        heading: key.charAt(0).toUpperCase() + key.slice(1),
        level: 2,
        tokens: [],
        subsections,
        rawMarkdown: '',
        content: [],
      });
      continue;
    }

    const tokens: TokenEntry[] = [];

    for (const [tokenName, tokenVal] of Object.entries(value as Record<string, unknown>)) {
      if (typeof tokenVal === 'string') {
        tokens.push({ name: tokenName, value: resolveTokenRef(tokenVal), extra: {} });
      } else if (typeof tokenVal === 'object' && tokenVal !== null) {
        const obj = tokenVal as Record<string, string>;
        const mainValue = obj['fontSize'] || obj['value'] || Object.values(obj)[0] || '';
        const extra: Record<string, string> = {};
        for (const [k, v] of Object.entries(obj)) {
          if (k !== 'fontSize' && k !== 'value') {
            extra[k] = String(v);
          }
        }
        tokens.push({ name: tokenName, value: String(mainValue), extra });
      }
    }

    if (tokens.length > 0) {
      sections.push({
        type,
        heading: key.charAt(0).toUpperCase() + key.slice(1),
        level: 2,
        tokens,
        subsections: [],
        rawMarkdown: '',
        content: [],
      });
    }
  }

  if (sections.length === 0) return null;

  // Parse any markdown content after the frontmatter
  const afterFrontmatter = trimmed.slice(endIdx + 3).trim();
  if (afterFrontmatter) {
    const tree = processor.parse(afterFrontmatter) as Root;
    const { sections: mdSections } = extractSections(tree);
    sections.push(...mdSections);
  }

  return { title, sections };
}

/**
 * Simple YAML parser for flat and one-level-nested key: value pairs.
 * Does not handle full YAML spec — just what design system files need.
 */
function parseSimpleYAML(yaml: string): Record<string, unknown> | null {
  const result: Record<string, unknown> = {};
  const lines = yaml.split('\n');
  let currentKey: string | null = null;
  let currentObj: Record<string, unknown> | null = null;
  let currentNestedKey: string | null = null;
  let currentNestedObj: Record<string, unknown> | null = null;

  for (const line of lines) {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const indent = line.search(/\S/);

    if (indent === 0) {
      // Top-level key
      if (currentNestedKey && currentNestedObj && currentObj && currentKey) {
        (currentObj as Record<string, unknown>)[currentNestedKey] = currentNestedObj;
        currentNestedKey = null;
        currentNestedObj = null;
      }
      if (currentKey && currentObj) {
        result[currentKey] = currentObj;
      }
      const match = line.match(/^([^:]+):\s*(.*)/);
      if (!match) continue;
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, '');
      if (val) {
        result[key] = val;
        currentKey = null;
        currentObj = null;
      } else {
        currentKey = key;
        currentObj = {};
      }
      currentNestedKey = null;
      currentNestedObj = null;
    } else if (indent >= 4 && currentNestedKey) {
      // Third level (e.g., fontFamily: Inter under display-lg)
      const match = line.trim().match(/^([^:]+):\s*(.*)/);
      if (match && currentNestedObj) {
        currentNestedObj[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
      }
    } else if (indent >= 2 && currentKey && currentObj) {
      // Second level
      // First save any pending nested object
      if (currentNestedKey && currentNestedObj) {
        currentObj[currentNestedKey] = currentNestedObj;
        currentNestedKey = null;
        currentNestedObj = null;
      }
      const match = line.trim().match(/^([^:]+):\s*(.*)/);
      if (!match) continue;
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, '');
      if (val) {
        currentObj[key] = val;
      } else {
        // Nested object starts
        currentNestedKey = key;
        currentNestedObj = {};
      }
    }
  }

  // Flush remaining
  if (currentNestedKey && currentNestedObj && currentObj) {
    currentObj[currentNestedKey] = currentNestedObj;
  }
  if (currentKey && currentObj) {
    result[currentKey] = currentObj;
  }

  return Object.keys(result).length > 0 ? result : null;
}
