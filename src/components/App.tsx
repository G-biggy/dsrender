'use client';

import { useState, useCallback } from 'react';
import { Toolbar } from '@/components/layout/Toolbar';
import { SplitPane } from '@/components/layout/SplitPane';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';
import { PreviewPane } from '@/components/preview/PreviewPane';
import { WelcomeModal } from '@/components/ui/WelcomeModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDesignDocument } from '@/hooks/useDesignDocument';
import { fetchSample } from '@/lib/samples';
import { injectSpecimenLine } from '@/lib/specimen';

function readWelcomeDismissed(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem('dsrender-welcome-dismissed') === 'true';
  } catch {
    return true;
  }
}

export default function App() {
  const [markdown, setMarkdown] = useLocalStorage('dsrender-content', '');
  const document = useDesignDocument(markdown);

  const [showWelcome, setShowWelcome] = useState(() => !readWelcomeDismissed());

  const handleDismissWelcome = useCallback(() => {
    setShowWelcome(false);
    try { localStorage.setItem('dsrender-welcome-dismissed', 'true'); } catch {}
  }, []);

  const handleShowWelcome = useCallback(() => {
    setShowWelcome(true);
  }, []);

  const handleReset = useCallback(() => {
    setMarkdown('');
  }, [setMarkdown]);

  const handleLoadSample = useCallback(async (file: string) => {
    try {
      const content = await fetchSample(file);
      setMarkdown(injectSpecimenLine(content));
    } catch {
      // Failed to load sample
    }
  }, [setMarkdown]);

  return (
    <div className="flex flex-col h-screen">
      <Toolbar
        onReset={handleReset}
        onLoadSample={handleLoadSample}
        onShowWelcome={handleShowWelcome}
      />
      <div className="flex-1 overflow-hidden">
        <SplitPane
          left={<MarkdownEditor value={markdown} onChange={setMarkdown} />}
          right={<PreviewPane document={document} />}
        />
      </div>
      <WelcomeModal isOpen={showWelcome} onClose={handleDismissWelcome} />
    </div>
  );
}
