'use client';

import { RotateCcw } from 'lucide-react';

interface ToolbarProps {
  onReset: () => void;
}

export function Toolbar({ onReset }: ToolbarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: '44px',
        borderBottom: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontSize: '15px',
          fontWeight: 700,
          color: '#111827',
          fontFamily: 'monospace',
          letterSpacing: '-0.02em',
        }}
      >
        dsrender
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onReset}
          title="Reset to default"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            fontSize: '12px',
            color: '#6B7280',
            background: 'none',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#D1D5DB';
            e.currentTarget.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E5E7EB';
            e.currentTarget.style.color = '#6B7280';
          }}
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>
    </div>
  );
}
