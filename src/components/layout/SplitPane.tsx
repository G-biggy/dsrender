'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

function readInitialSplitRatio(): number {
  if (typeof window === 'undefined') return 0.45;
  try {
    const saved = localStorage.getItem('dsrender-split');
    if (saved) {
      const n = parseFloat(saved);
      if (!isNaN(n)) return n;
    }
  } catch {
    // ignore
  }
  return 0.45;
}

function readInitialIsMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

export function SplitPane({ left, right }: SplitPaneProps) {
  const [splitRatio, setSplitRatio] = useState(readInitialSplitRatio);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(readInitialIsMobile);

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      const clamped = Math.min(Math.max(ratio, 0.2), 0.8);
      setSplitRatio(clamped);
      localStorage.setItem('dsrender-split', clamped.toString());
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex border-b border-gray-700 bg-gray-900">
          {(['editor', 'preview'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-2.5 text-[13px] font-semibold border-none bg-transparent cursor-pointer capitalize',
                activeTab === tab
                  ? 'text-gray-100 border-b-2 border-b-gray-100'
                  : 'text-gray-500 border-b-2 border-b-transparent'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-hidden">
          <div className={cn('h-full', activeTab === 'editor' ? 'block' : 'hidden')}>
            {left}
          </div>
          <div className={cn('h-full overflow-auto', activeTab === 'preview' ? 'block' : 'hidden')}>
            {right}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-hidden"
      style={{
        display: 'grid',
        gridTemplateColumns: `${splitRatio * 100}% 4px ${(1 - splitRatio) * 100 - 0.4}%`,
        userSelect: isDragging ? 'none' : 'auto',
      }}
    >
      {/* Left pane */}
      <div className="overflow-hidden min-w-0">{left}</div>

      <div
        onMouseDown={handleMouseDown}
        className={cn(
          'cursor-col-resize z-10 transition-colors',
          isDragging ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'
        )}
      />

      {/* Right pane */}
      <div className="overflow-hidden min-w-0">{right}</div>
    </div>
  );
}
