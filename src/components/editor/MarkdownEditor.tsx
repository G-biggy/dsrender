'use client';

import { useEffect, useRef } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  isDark?: boolean;
}

export function MarkdownEditor({ value, onChange, isDark = false }: MarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<unknown>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    if (!containerRef.current) return;

    // Polyfill deprecated MediaQueryList.addListener (used by CodeMirror)
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let view: any = null;

    async function init() {
      const [
        { EditorState },
        { EditorView, keymap, lineNumbers, highlightActiveLine },
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

      if (!containerRef.current) return;

      const extensions = [
        lineNumbers(),
        highlightActiveLine(),
        history(),
        markdown(),
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
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '13px',
          },
          '.cm-scroller': {
            fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, monospace',
            overflow: 'auto',
          },
          '.cm-content': {
            padding: '16px 0',
            color: '#1F2937',
          },
          '.cm-gutters': {
            borderRight: 'none',
            color: '#9CA3AF',
            backgroundColor: '#FAFAFA',
          },
          '.cm-activeLineGutter': {
            backgroundColor: '#F3F4F6',
          },
          '.cm-activeLine': {
            backgroundColor: '#F8FAFC',
          },
        }),
        ...(isDark ? [oneDark] : []),
      ];

      const state = EditorState.create({
        doc: valueRef.current,
        extensions,
      });

      view = new EditorView({
        state,
        parent: containerRef.current,
      });

      viewRef.current = view;
    }

    init();

    return () => {
      if (view) view.destroy();
      viewRef.current = null;
    };
  }, [isDark]);

  // Sync external value changes (e.g., reset)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const view = viewRef.current as any;
    if (!view) return;
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
      style={{
        height: '100%',
        overflow: 'hidden',
        backgroundColor: isDark ? '#282c34' : '#FFFFFF',
      }}
    />
  );
}
