'use client';

import { useState, useCallback, useEffect } from 'react';
import { Toolbar } from '@/components/layout/Toolbar';
import { SplitPane } from '@/components/layout/SplitPane';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';
import { PreviewPane } from '@/components/preview/PreviewPane';
import { WelcomeModal } from '@/components/ui/WelcomeModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDesignDocument } from '@/hooks/useDesignDocument';
import { useTheme } from '@/context/ThemeContext';
import { fetchSample } from '@/lib/samples';
import { downloadPreviewHTML } from '@/lib/export-html';

export default function App() {
  const [markdown, setMarkdown] = useLocalStorage('dsrender-content', '');
  const document = useDesignDocument(markdown);
  const { theme, toggleTheme } = useTheme();

  // Welcome modal — read localStorage directly to avoid hydration flash
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('dsrender-welcome-dismissed');
      if (!dismissed || dismissed !== 'true') {
        setShowWelcome(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

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
      setMarkdown(content);
    } catch {
      // Failed to load sample
    }
  }, [setMarkdown]);

  return (
    <div className="flex flex-col h-screen">
      <Toolbar
        onReset={handleReset}
        onLoadSample={handleLoadSample}
        onDownloadHTML={downloadPreviewHTML}
        onShowWelcome={handleShowWelcome}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <div className="flex-1 overflow-hidden">
        <SplitPane
          left={<MarkdownEditor value={markdown} onChange={setMarkdown} isDark={theme === 'dark'} />}
          right={<PreviewPane document={document} />}
        />
      </div>
      <WelcomeModal isOpen={showWelcome} onClose={handleDismissWelcome} />
    </div>
  );
}
