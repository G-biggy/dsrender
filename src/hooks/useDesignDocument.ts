'use client';

import { useMemo, useDeferredValue } from 'react';
import { parseDesignSystem } from '@/lib/parser/parse';
import type { DesignTokenDocument } from '@/types';

export function useDesignDocument(markdown: string): DesignTokenDocument | null {
  const deferredMarkdown = useDeferredValue(markdown);

  const document = useMemo(() => {
    if (!deferredMarkdown.trim()) return null;
    try {
      return parseDesignSystem(deferredMarkdown);
    } catch {
      return null;
    }
  }, [deferredMarkdown]);

  return document;
}
