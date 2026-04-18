'use client';

import { useCallback } from 'react';
import { Toolbar } from '@/components/layout/Toolbar';
import { SplitPane } from '@/components/layout/SplitPane';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';
import { PreviewPane } from '@/components/preview/PreviewPane';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDesignDocument } from '@/hooks/useDesignDocument';
import { DEFAULT_CONTENT } from '@/lib/default-content';

export default function App() {
  const [markdown, setMarkdown] = useLocalStorage('dsrender-content', DEFAULT_CONTENT);
  const document = useDesignDocument(markdown);

  const handleReset = useCallback(() => {
    setMarkdown(DEFAULT_CONTENT);
  }, [setMarkdown]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Toolbar onReset={handleReset} />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <SplitPane
          left={<MarkdownEditor value={markdown} onChange={setMarkdown} />}
          right={<PreviewPane document={document} />}
        />
      </div>
    </div>
  );
}
