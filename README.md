# dsrender — Design System Render

**Live at: [dsrender.ghayyath.com](https://dsrender.ghayyath.com)**

A live visual viewer for design system markdown files. Paste a `DESIGN.md` and instantly see your tokens rendered as color swatches, type specimens, spacing scales, shadow cards, motion previews, components, and more.

dsrender is split-pane: editor on the left, live render on the right. Edit and see updates instantly. Drag a `.md` file onto the editor to load it. Load one of the bundled samples from the toolbar to see the rendering in action.

## How dsrender works

dsrender renders **only what's in your markdown** — it doesn't invent values, fall back to brand guesses, or pull anything from a live design API. If your file describes a color, it shows that color. If it doesn't, the specimen renders in dsrender's neutral default (indigo `#6366F1`) so the shape is still visible.

That default lives in the auto-injected `## dsrender spec` section at the top of your file:

```markdown
## dsrender spec

specimen: #6366F1

Edit the hex above to recolor decorative previews — spacing tiles, z-index layers, glow halos, breakpoint marks — wherever your design system doesn't specify a color.

---
```

Edit the hex to anything (e.g. `#22c55e` for green, `#ec4899` for pink) and every decorative specimen retints in real time. The section is hidden from the rendered output — it's metadata for dsrender, not part of your design system.

Some token kinds may be misrepresented or skipped if dsrender doesn't yet have a renderer for them — chips, tags, complex tables, and unusual layouts are common gaps. If you hit one, hit the **Request a renderer** button in the toolbar and send a copy of the failing section. New renderers ship as the gaps surface.

## What it renders

- **Colors** — swatches with hex, name, usage
- **Typography** — live specimens with custom Google Fonts loaded automatically
- **Spacing** — scaled tiles
- **Border radius** — shape previews
- **Shadows** — shadow cards
- **Motion** — easing curves, duration bars, animated dots
- **Effects** — glow visualizations
- **Layout** — container ranges
- **Z-index** — isometric 3D layer stack
- **Breakpoints** — ruler view
- **Components** — buttons, inputs, cards, tabs, toggles, badges (rendered from your CSS code blocks or, for prose-only sections, from token templates)
- **Icons** — size and grid previews
- **Tables and prose** — fallback rendering for unrecognized sections

dsrender works with both YAML frontmatter (Google Labs `design.md` spec, M3 naming) and standard markdown with CSS code blocks (Tailwind naming). It picks tokens out of either format.

## Privacy

dsrender runs entirely in your browser. Your markdown content is stored only in `localStorage`. Nothing is sent to a server. The "Request a renderer" flow opens an email or GitHub issue — only what you choose to paste in there leaves your machine.

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4 (chrome only), CodeMirror 6 (editor), Lucide icons (chrome only — toolbar, modal).

## Contributing

PRs welcome — especially new renderers or fixes for token types that don't render correctly. If a token kind you care about doesn't render, [open an issue](https://github.com/G-biggy/dsrender/issues/new) with the failing section pasted in.

## Credits

Built by [Ghayyath Huzayen](https://ghayyath.com) with significant collaboration from Claude (Anthropic) — pairing on architecture, parser work, and the renderer set.

Bundled sample design systems follow the [design.md](https://github.com/google-labs-code/design.md) specification by Google Labs. The [Atmospheric Glass](public/samples/google-atmospheric-glass-DESIGN.md) sample uses the YAML frontmatter format from that spec; the others use markdown with CSS code blocks.

## License

MIT — see [LICENSE](LICENSE).
