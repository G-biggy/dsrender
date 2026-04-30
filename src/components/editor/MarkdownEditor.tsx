'use client';

import { useEffect, useRef } from 'react';
import { injectSpecimenLine } from '@/lib/specimen';

// Polyfill deprecated matchMedia methods before CodeMirror loads.
// CodeMirror's DOMObserver uses addListener which was removed in modern browsers.
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  const origMatchMedia = window.matchMedia.bind(window);
  window.matchMedia = function (query: string) {
    const mql = origMatchMedia(query);
    if (mql && !mql.addListener) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mql.addListener = (cb: any) => mql.addEventListener('change', cb);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mql.removeListener = (cb: any) => mql.removeEventListener('change', cb);
    }
    return mql;
  } as typeof window.matchMedia;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  const initCompleteRef = useRef(false);
  const pendingValueRef = useRef<string | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (!containerRef.current) return;

    let destroyed = false;
    initCompleteRef.current = false;

    async function init() {
      const [
        { EditorState },
        { EditorView, keymap, lineNumbers, highlightActiveLine, placeholder },
        { markdown },
        { oneDark },
        { defaultKeymap, history, historyKeymap },
      ] = await Promise.all([
        import('@codemirror/state'),
        import('@codemirror/view'),
        import('@codemirror/lang-markdown'),
        import('@codemirror/theme-one-dark'),
        import('@codemirror/commands'),
      ]);

      if (destroyed || !containerRef.current) return;

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
                if (text) onChangeRef.current(injectSpecimenLine(text));
              };
              reader.readAsText(file);
              return true;
            }
            return false;
          },
          paste(event, view) {
            // Inject specimen line only when pasting into an empty editor.
            // Once the user has content, leave their pastes pristine.
            if (view.state.doc.length > 0) return false;
            const text = event.clipboardData?.getData('text/plain');
            if (!text) return false;
            event.preventDefault();
            const next = injectSpecimenLine(text);
            view.dispatch({
              changes: { from: 0, to: view.state.doc.length, insert: next },
              selection: { anchor: next.length },
            });
            onChangeRef.current(next);
            return true;
          },
        }),
        oneDark,
        darkTheme,
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ];

      const initialDoc = pendingValueRef.current ?? valueRef.current ?? '';
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
  }, []);

  useEffect(() => {
    if (!initCompleteRef.current || !viewRef.current) {
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
      className="h-full overflow-hidden bg-[#282c34]"
    />
  );
}
