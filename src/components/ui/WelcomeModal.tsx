'use client';

import { useEffect, useRef } from 'react';
import { X, MessageSquarePlus } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-[90%] p-8 relative animate-[scaleIn_0.2s_ease-out]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-300 bg-transparent border-none cursor-pointer transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold text-gray-100 mb-1">
          Design System Render
        </h2>
        <p className="text-sm text-gray-400 font-mono mb-6">
          dsrender
        </p>

        <div className="flex flex-col gap-4 text-sm text-gray-300 leading-relaxed">
          <p>
            Paste your <code className="text-xs bg-gray-800 px-1.5 py-0.5 rounded font-mono">DESIGN.md</code> and
            instantly see your design tokens rendered as visual previews: color swatches, typography specimens, spacing scales, shadows, components, and more.
          </p>

          <p>
            Specimens that don&apos;t have a color in your markdown — spacing tiles, z-index layers, glow halos, breakpoint marks — render in the color from the{' '}
            <code className="text-xs bg-gray-800 px-1.5 py-0.5 rounded font-mono">## dsrender spec</code>{' '}
            section at the top of your file. Edit the hex to recolor them. That section is hidden from the rendered output.
          </p>

          <p>
            This tool is actively growing. If a token type or section doesn&apos;t render as expected, use the{' '}
            <strong className="inline-flex items-center gap-1"><MessageSquarePlus size={14} className="inline" /> Request a renderer</strong>{' '}
            button in the toolbar to let us know what&apos;s missing.
          </p>

          <p className="text-xs text-gray-500">
            Load a sample from the toolbar to see it in action.
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 bg-gray-100 text-gray-900 text-sm font-semibold rounded-lg border-none cursor-pointer transition-colors hover:bg-gray-200"
        >
          Got it
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
