import { DEFAULT_ACCENT } from './render-defaults';

/**
 * The specimen color is dsrender's user-overridable accent for decorative
 * previews — spacing tiles, z-index layers, glow halos, breakpoint marks —
 * the bits that don't have a color in the user's design system.
 *
 * Users override it by editing the hex inside the auto-injected section:
 *
 *   ## dsrender spec
 *
 *   specimen: #6366F1
 *
 *   Edit the hex above to recolor decorative previews ...
 *
 *   ---
 *
 * The section is hidden from the rendered preview (parser filters it out)
 * but visible and editable in the markdown editor.
 *
 * The block is auto-injected on sample load, drag-drop, and paste-into-empty
 * so users see the syntax immediately.
 */

const SPECIMEN_RE = /specimen:\s*(#[0-9a-f]{3,8})\b/gi;
const SPECIMEN_HEADING_RE = /^\s{0,3}#{1,6}\s+dsrender\s+spec\b/im;

function buildSpecimenBlock(color: string): string {
  return [
    '## dsrender spec',
    '',
    `specimen: ${color}`,
    '',
    'Edit the hex above to recolor decorative previews — spacing tiles, z-index layers, glow halos, breakpoint marks — wherever your design system doesn\'t specify a color. This section is hidden from the rendered output.',
    '',
    '---',
    '',
    '',
  ].join('\n');
}

/** Finds the last `specimen: #COLOR` in the markdown so user edits win over stale leftovers. */
export function extractSpecimenColor(markdown: string): string | null {
  const matches = [...markdown.matchAll(SPECIMEN_RE)];
  if (matches.length === 0) return null;
  return matches[matches.length - 1][1];
}

/** True if the markdown contains either a specimen line or a dsrender spec heading. */
export function hasSpecimenLine(markdown: string): boolean {
  return SPECIMEN_RE.test(markdown) || SPECIMEN_HEADING_RE.test(markdown);
}

/**
 * Prepend the specimen section to `markdown` if it doesn't already contain one.
 * Returns the (possibly modified) markdown unchanged otherwise.
 */
export function injectSpecimenLine(markdown: string, color: string = DEFAULT_ACCENT): string {
  if (hasSpecimenLine(markdown)) return markdown;
  return buildSpecimenBlock(color) + markdown;
}

/** Used by the section detector to skip the dsrender spec section during render. */
export function isDsrenderSpecHeading(heading: string): boolean {
  return /^\s*dsrender\s+spec\s*$/i.test(heading);
}

/**
 * Remove the `## dsrender spec` section (heading + body) from raw markdown so
 * the parser doesn't try to render it. The section ends at:
 *   - a horizontal rule (`---` on its own line), OR
 *   - the next heading of any level
 * whichever comes first.
 *
 * Anything before the section is preserved (e.g., YAML frontmatter at the
 * very top still works if the spec section sits after it).
 */
export function stripDsrenderSpec(markdown: string): string {
  const lines = markdown.split('\n');
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (SPECIMEN_HEADING_RE.test(lines[i])) {
      startIdx = i;
      break;
    }
  }
  if (startIdx === -1) return markdown;

  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s{0,3}---\s*$/.test(line)) {
      endIdx = i + 1; // consume the rule too
      break;
    }
    if (/^\s{0,3}#{1,6}\s+/.test(line)) {
      endIdx = i;
      break;
    }
  }

  // Drop one trailing blank line if there is one, so the doc looks clean
  if (endIdx < lines.length && lines[endIdx]?.trim() === '') endIdx += 1;

  const before = lines.slice(0, startIdx).join('\n');
  const after = lines.slice(endIdx).join('\n');
  if (before && after) return `${before}\n${after}`;
  return before + after;
}
