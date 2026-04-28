'use client';

import { useEffect, useRef } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  isDark?: boolean;
}

export function MarkdownEditor({ value, onChange, isDark = false }: MarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const initCompleteRef = useRef(false);
  const pendingValueRef = useRef<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (typeof window !== 'undefined' && window.matchMedia) {
      const mql = window.matchMedia('(max-width: 0px)');
      if (!mql.addListener) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (MediaQueryList.prototype as any).addListener = function (cb: any) {
          this.addEventListener('change', cb);
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (MediaQueryList.prototype as any).removeListener = function (cb: any) {
          this.removeEventListener('change', cb);
        };
      }
    }

    let destroyed = false;
    initCompleteRef.current = false;

    async function init() {
      const [
        { EditorState },
        { EditorView, keymap, lineNumbers, highlightActiveLine, placeholder },
        { markdown },
        { oneDark },
        { defaultKeymap, history, historyKeymap },
        { syntaxHighlighting, HighlightStyle },
        { tags },
      ] = await Promise.all([
        import('@codemirror/state'),
        import('@codemirror/view'),
        import('@codemirror/lang-markdown'),
        import('@codemirror/theme-one-dark'),
        import('@codemirror/commands'),
        import('@codemirror/language'),
        import('@lezer/highlight'),
      ]);

      if (destroyed || !containerRef.current) return;

      const lightTheme = EditorView.theme({
        '&': { height: '100%', fontSize: '13px' },
        '.cm-scroller': {
          fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, monospace',
          overflow: 'auto',
        },
        '.cm-content': { padding: '16px 0', color: '#1F2937' },
        '.cm-gutters': { borderRight: 'none', color: '#9CA3AF', backgroundColor: '#FAFAFA' },
        '.cm-activeLineGutter': { backgroundColor: '#F3F4F6' },
        '.cm-activeLine': { backgroundColor: '#F8FAFC' },
        '.cm-placeholder': { color: '#9CA3AF' },
      });

      const darkTheme = EditorView.theme({
        '&': { height: '100%', fontSize: '13px' },
        '.cm-scroller': {
          fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, monospace',
          overflow: 'auto',
        },
        '.cm-content': { padding: '16px 0', color: '#E5E7EB' },
        '.cm-gutters': { borderRight: 'none', color: '#6B7280', backgroundColor: '#111827' },
        '.cm-activeLineGutter': { backgroundColor: '#1F2937' },
        '.cm-activeLine': { backgroundColor: '#1A2332' },
        '.cm-placeholder': { color: '#6B7280' },
      });

      const extensions = [
        lineNumbers(),
        highlightActiveLine(),
        history(),
        markdown(),
        placeholder('Paste or drag & drop your DESIGN.md here...'),
        EditorView.domEventHandlers({
          drop(event) {
            const file = event.dataTransfer?.files[0];
            if (file && (file.name.endsWith('.md') || file.type === 'text/markdown' || file.type === 'text/plain')) {
              event.preventDefault();
              const reader = new FileReader();
              reader.onload = (ev) => {
                const text = ev.target?.result as string;
                if (text) onChangeRef.current(text);
              };
              reader.readAsText(file);
              return true;
            }
            return false;
          },
        }),
        ...(isDark
          ? [oneDark, darkTheme]
          : [
              syntaxHighlighting(HighlightStyle.define([
                { tag: tags.heading, color: '#111827', fontWeight: '700' },
                { tag: tags.heading1, color: '#111827', fontWeight: '700', fontSize: '1.2em' },
                { tag: tags.heading2, color: '#1F2937', fontWeight: '700' },
                { tag: tags.heading3, color: '#374151', fontWeight: '600' },
                { tag: tags.strong, color: '#1F2937', fontWeight: '700' },
                { tag: tags.emphasis, color: '#1F2937', fontStyle: 'italic' },
                { tag: tags.link, color: '#2563EB', textDecoration: 'underline' },
                { tag: tags.url, color: '#2563EB' },
                { tag: tags.monospace, color: '#D97706', backgroundColor: '#FEF3C7', borderRadius: '3px' },
                { tag: tags.comment, color: '#6B7280' },
                { tag: tags.meta, color: '#6B7280' },
                { tag: tags.processingInstruction, color: '#9CA3AF' },
                { tag: tags.content, color: '#1F2937' },
                { tag: tags.string, color: '#059669' },
                { tag: tags.keyword, color: '#7C3AED' },
                { tag: tags.definition(tags.variableName), color: '#2563EB' },
              ])),
              lightTheme,
            ]),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ];

      // Use pending value if one arrived during init, otherwise empty
      const initialDoc = pendingValueRef.current ?? '';
      pendingValueRef.current = null;

      const state = EditorState.create({
        doc: initialDoc,
        extensions,
      });

      const newView = new EditorView({
        state,
        parent: containerRef.current,
      });

      viewRef.current = newView;
      initCompleteRef.current = true;
    }

    init();

    return () => {
      destroyed = true;
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
      initCompleteRef.current = false;
    };
  }, [isDark]);

  // Sync external value changes
  useEffect(() => {
    if (!initCompleteRef.current || !viewRef.current) {
      // Editor not ready — store for when init completes
      pendingValueRef.current = value;
      return;
    }

    const view = viewRef.current;
    const currentValue = view.state.doc.toString();
    if (value !== currentValue) {
      view.dispatch({
        changes: { from: 0, to: currentValue.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-hidden bg-white dark:bg-[#282c34]"
    />
  );
}
