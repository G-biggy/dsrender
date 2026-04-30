'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCcw, MessageSquarePlus, Info, ChevronDown, ExternalLink, Mail, X } from 'lucide-react';
import { SAMPLE_FILES } from '@/lib/samples';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  onReset: () => void;
  onLoadSample: (file: string) => void;
  onShowWelcome: () => void;
}

const GITHUB_REPO = 'G-biggy/dsrender';

function ToolbarButton({
  onClick,
  title,
  children,
  className,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-400 bg-transparent border border-gray-700 rounded-md cursor-pointer transition-colors',
          'hover:border-gray-600 hover:text-gray-200',
          className
        )}
      >
        {children}
      </button>
      <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-1 text-[11px] leading-tight whitespace-nowrap rounded bg-gray-200 text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-100 pointer-events-none z-50">
        {title}
      </span>
    </div>
  );
}

export function Toolbar({ onReset, onLoadSample, onShowWelcome }: ToolbarProps) {
  const [sampleOpen, setSampleOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sampleOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSampleOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sampleOpen]);

  const [showRequestModal, setShowRequestModal] = useState(false);

  const openGitHubIssue = useCallback(() => {
    const body = [
      '**Token type / section:**\n',
      '**Example markdown (just the failing segment, not your full file):**',
      '```',
      '',
      '```\n',
      '**Expected rendering:**\n',
      '**What actually happened:**\n',
      '---',
      '_Only paste the specific section that didn\'t render. Do not share your full design system file — GitHub issues are public._',
    ].join('\n');
    window.open(
      `https://github.com/${GITHUB_REPO}/issues/new?title=${encodeURIComponent('Renderer request: [Type]')}&body=${encodeURIComponent(body)}&labels=${encodeURIComponent('renderer-request')}`,
      '_blank'
    );
    setShowRequestModal(false);
  }, []);

  return (
    <div className="flex items-center justify-between px-4 h-11 border-b border-gray-700 bg-gray-900 shrink-0">
      <div className="relative group">
        <div className="text-[15px] font-bold text-gray-100 font-mono tracking-tight cursor-default">
          dsrender
        </div>
        <span className="absolute top-full left-0 mt-1.5 px-2 py-1 text-[11px] leading-tight whitespace-nowrap rounded bg-gray-200 text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-100 pointer-events-none z-50">
          Design System Render
        </span>
      </div>

      <div className="flex items-center gap-2">
        {SAMPLE_FILES.length === 1 ? (
          <ToolbarButton
            onClick={() => onLoadSample(SAMPLE_FILES[0].file)}
            title={`Load the ${SAMPLE_FILES[0].name} sample`}
          >
            Load sample
          </ToolbarButton>
        ) : (
          <div ref={dropdownRef} className="relative">
            <ToolbarButton onClick={() => setSampleOpen(!sampleOpen)} title="Load a sample design system">
              Samples
              <ChevronDown size={12} />
            </ToolbarButton>
            {sampleOpen && (
              <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 min-w-[180px] z-50">
                {SAMPLE_FILES.map((sample) => (
                  <button
                    key={sample.file}
                    onClick={() => {
                      onLoadSample(sample.file);
                      setSampleOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[13px] text-gray-300 bg-transparent border-none cursor-pointer hover:bg-gray-700 transition-colors"
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <ToolbarButton onClick={() => setShowRequestModal(true)} title="Request a renderer">
          <MessageSquarePlus size={14} />
        </ToolbarButton>

        <ToolbarButton onClick={onShowWelcome} title="About dsrender">
          <Info size={14} />
        </ToolbarButton>

        <ToolbarButton onClick={onReset} title="Clear editor">
          <RotateCcw size={14} />
        </ToolbarButton>
      </div>

      {showRequestModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowRequestModal(false); }}
        >
          <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-[90%] p-6 relative">
            <button
              onClick={() => setShowRequestModal(false)}
              className="absolute top-3 right-3 p-1 text-gray-500 hover:text-gray-300 bg-transparent border-none cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-gray-100 mb-3 flex items-center gap-2">
              <MessageSquarePlus size={20} />
              Request a renderer
            </h3>

            <div className="flex flex-col gap-3 text-sm text-gray-300 leading-relaxed">
              <p>
                If a token type or section didn&apos;t render as expected, send us the{' '}
                <strong>specific section</strong>{' '}that needs support. Please only include the
                relevant segment, not your full design system.
              </p>

              <div className="text-xs text-gray-500 bg-gray-800 rounded-lg p-3 flex flex-col gap-1.5">
                <p className="m-0"><strong className="text-gray-400">Your privacy matters.</strong>{' '}Any design tokens you share will be used solely to improve dsrender and will not be stored, shared, or used for any other purpose.</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-5">
              <a
                href="mailto:gheyath+dsrender@gmail.com?subject=dsrender%20%E2%80%94%20Renderer%20request&body=Token%20type%20%2F%20section%3A%0A%0AExample%20markdown%20(just%20the%20failing%20segment)%3A%0A%0AExpected%20rendering%3A%0A%0AWhat%20actually%20happened%3A"
                className="flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-900 text-sm font-semibold rounded-lg no-underline transition-colors hover:bg-gray-200"
                onClick={() => setShowRequestModal(false)}
              >
                <Mail size={14} />
                Send request via email
              </a>
              <button
                onClick={openGitHubIssue}
                className="flex items-center justify-center gap-2 py-2 text-xs text-gray-500 bg-transparent border-none cursor-pointer transition-colors hover:text-gray-300"
              >
                <ExternalLink size={12} />
                Or open a public GitHub issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
