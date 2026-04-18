'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export function SplitPane({ left, right }: SplitPaneProps) {
  const [splitRatio, setSplitRatio] = useState(0.45);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydration-safe: read localStorage only after mount
  useEffect(() => {
    const saved = localStorage.getItem('dsrender-split');
    if (saved) setSplitRatio(parseFloat(saved));
    setMounted(true);
  }, []);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Tab bar */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
          }}
        >
          {(['editor', 'preview'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: activeTab === tab ? '#111827' : '#9CA3AF',
                borderBottom: activeTab === tab ? '2px solid #111827' : '2px solid transparent',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ display: activeTab === 'editor' ? 'block' : 'none', height: '100%' }}>
            {left}
          </div>
          <div style={{ display: activeTab === 'preview' ? 'block' : 'none', height: '100%', overflow: 'auto' }}>
            {right}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        display: 'grid',
        gridTemplateColumns: `${splitRatio * 100}% 4px ${(1 - splitRatio) * 100 - 0.4}%`,
        height: '100%',
        overflow: 'hidden',
        userSelect: isDragging ? 'none' : 'auto',
      }}
    >
      {/* Left pane - Editor */}
      <div style={{ overflow: 'hidden', minWidth: 0 }}>{left}</div>

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          cursor: 'col-resize',
          backgroundColor: isDragging ? '#3B82F6' : '#E5E7EB',
          transition: isDragging ? 'none' : 'background-color 0.15s',
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          if (!isDragging) e.currentTarget.style.backgroundColor = '#D1D5DB';
        }}
        onMouseLeave={(e) => {
          if (!isDragging) e.currentTarget.style.backgroundColor = '#E5E7EB';
        }}
      />

      {/* Right pane - Preview */}
      <div style={{ overflow: 'hidden', minWidth: 0 }}>{right}</div>
    </div>
  );
}
