'use client';

import { useState, useCallback, useRef } from 'react';
import type { TokenSection } from '@/types';

interface MotionToken {
  name: string;
  value: string;
  duration: number | null;
  easing: string | null;
  usage?: string;
}

function parseMotionToken(name: string, value: string, usage?: string): MotionToken {
  const lower = value.toLowerCase().trim();

  // Try to extract duration (e.g., "150ms", "0.3s", "300ms ease-out")
  let duration: number | null = null;
  let easing: string | null = null;

  // Duration patterns
  const msMatch = lower.match(/(\d+)\s*ms/);
  const sMatch = lower.match(/([\d.]+)\s*s(?!ec)/);
  if (msMatch) {
    duration = parseInt(msMatch[1], 10);
  } else if (sMatch) {
    duration = parseFloat(sMatch[1]) * 1000;
  }

  // Easing patterns
  const cubicMatch = lower.match(/cubic-bezier\s*\(\s*([\d.]+)\s*,\s*([\d.-]+)\s*,\s*([\d.]+)\s*,\s*([\d.-]+)\s*\)/);
  if (cubicMatch) {
    easing = `cubic-bezier(${cubicMatch[1]}, ${cubicMatch[2]}, ${cubicMatch[3]}, ${cubicMatch[4]})`;
  } else if (/ease-in-out/.test(lower)) {
    easing = 'ease-in-out';
  } else if (/ease-out/.test(lower)) {
    easing = 'ease-out';
  } else if (/ease-in/.test(lower)) {
    easing = 'ease-in';
  } else if (/linear/.test(lower)) {
    easing = 'linear';
  } else if (/ease/.test(lower)) {
    easing = 'ease';
  } else if (/spring/.test(lower)) {
    easing = 'cubic-bezier(0.34, 1.56, 0.64, 1)'; // spring approximation
  }

  // If value is purely an easing name with no duration
  if (!duration && !easing) {
    const pureEasing = lower.replace(/[^a-z0-9().,-\s]/g, '').trim();
    if (['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'].includes(pureEasing)) {
      easing = pureEasing;
    } else if (cubicMatch) {
      // already handled above
    }
  }

  // If name hints at what it is
  if (!easing && !duration) {
    const nameHints = name.toLowerCase();
    if (/easing|curve/.test(nameHints)) {
      easing = value.trim();
    }
    if (/duration|delay|speed|timing/.test(nameHints)) {
      // Try parsing as raw number (assume ms)
      const num = parseFloat(value);
      if (!isNaN(num)) {
        duration = num > 10 ? num : num * 1000; // > 10 = ms, else seconds
      }
    }
  }

  return { name, value, duration, easing, usage };
}

function getCubicBezierPoints(easing: string): [number, number, number, number] {
  const match = easing.match(/cubic-bezier\s*\(\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*\)/);
  if (match) {
    return [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]), parseFloat(match[4])];
  }
  // Named easings to cubic-bezier
  switch (easing) {
    case 'ease': return [0.25, 0.1, 0.25, 1.0];
    case 'ease-in': return [0.42, 0, 1, 1];
    case 'ease-out': return [0, 0, 0.58, 1];
    case 'ease-in-out': return [0.42, 0, 0.58, 1];
    case 'linear': return [0, 0, 1, 1];
    default: return [0.25, 0.1, 0.25, 1.0];
  }
}

function EasingCurveSVG({ easing, size = 64 }: { easing: string; size?: number }) {
  const [x1, y1, x2, y2] = getCubicBezierPoints(easing);
  const pad = 6;
  const w = size - pad * 2;
  const h = size - pad * 2;

  // Control points in SVG coords (y is inverted)
  const p0 = { x: pad, y: pad + h };
  const p1 = { x: pad + x1 * w, y: pad + h - y1 * h };
  const p2 = { x: pad + x2 * w, y: pad + h - y2 * h };
  const p3 = { x: pad + w, y: pad };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid */}
      <rect x={pad} y={pad} width={w} height={h} fill="none" stroke="#E5E7EB" strokeWidth="1" />
      {/* Control point lines */}
      <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="#C7D2FE" strokeWidth="1" strokeDasharray="2 2" />
      <line x1={p3.x} y1={p3.y} x2={p2.x} y2={p2.y} stroke="#C7D2FE" strokeWidth="1" strokeDasharray="2 2" />
      {/* Curve */}
      <path
        d={`M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`}
        fill="none"
        stroke="#6366F1"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Control points */}
      <circle cx={p1.x} cy={p1.y} r="3" fill="#818CF8" />
      <circle cx={p2.x} cy={p2.y} r="3" fill="#818CF8" />
      {/* Start/end */}
      <circle cx={p0.x} cy={p0.y} r="2.5" fill="#374151" />
      <circle cx={p3.x} cy={p3.y} r="2.5" fill="#374151" />
    </svg>
  );
}

function AnimatedDot({ easing, duration, playing }: { easing: string; duration: number; playing: boolean }) {
  return (
    <div
      style={{
        width: '100%',
        height: '28px',
        backgroundColor: '#F9FAFB',
        borderRadius: '14px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #E5E7EB',
      }}
    >
      {/* Track line */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '14px',
          right: '14px',
          height: '1px',
          backgroundColor: '#D1D5DB',
        }}
      />
      {/* Dot */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          left: playing ? 'calc(100% - 22px)' : '6px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: '#6366F1',
          transition: playing
            ? `left ${duration}ms ${easing}`
            : 'left 0ms',
          boxShadow: '0 1px 3px rgba(99, 102, 241, 0.4)',
        }}
      />
    </div>
  );
}

function DurationBar({ duration, maxDuration }: { duration: number; maxDuration: number }) {
  const widthPercent = Math.max((duration / maxDuration) * 100, 8);
  return (
    <div
      style={{
        width: '100%',
        height: '6px',
        backgroundColor: '#F3F4F6',
        borderRadius: '3px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${widthPercent}%`,
          height: '100%',
          backgroundColor: '#F97316',
          borderRadius: '3px',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
}

function MotionCard({
  token,
  maxDuration,
}: {
  token: MotionToken;
  maxDuration: number;
}) {
  const [playing, setPlaying] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const hasEasing = !!token.easing;
  const hasDuration = token.duration !== null && token.duration > 0;
  const isAnimatable = hasEasing || hasDuration;
  const animDuration = token.duration || 300;

  const handlePlay = useCallback(() => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setPlaying(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPlaying(true);
        // Auto-reset: wait for animation to finish + a brief hold at the end
        resetTimer.current = setTimeout(() => {
          setPlaying(false);
        }, animDuration + 800);
      });
    });
  }, [animDuration]);

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        minWidth: '200px',
        flex: '1 1 200px',
        maxWidth: '320px',
      }}
    >
      {/* Header: token name + play button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#374151',
          }}
        >
          {token.name}
        </div>
        {isAnimatable && (
          <button
            onClick={handlePlay}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '26px',
              height: '26px',
              padding: 0,
              backgroundColor: '#EEF2FF',
              border: '1px solid #C7D2FE',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#6366F1',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E0E7FF')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#EEF2FF')}
            title="Play animation"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <polygon points="1,0 10,5 1,10" />
            </svg>
          </button>
        )}
      </div>

      {/* Easing curve visualization */}
      {hasEasing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <EasingCurveSVG easing={token.easing!} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#6B7280',
              }}
            >
              {token.easing}
            </div>
            {hasDuration && (
              <div
                style={{
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: '#9CA3AF',
                }}
              >
                {token.duration}ms
              </div>
            )}
          </div>
        </div>
      )}

      {/* Duration bar (for duration-only tokens without easing) */}
      {!hasEasing && hasDuration && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <DurationBar duration={token.duration!} maxDuration={maxDuration} />
          <div
            style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              color: '#6B7280',
            }}
          >
            {token.duration}ms
          </div>
        </div>
      )}

      {/* Animated dot */}
      {isAnimatable && (
        <AnimatedDot
          easing={token.easing || 'ease'}
          duration={token.duration || 300}
          playing={playing}
        />
      )}

      {/* Raw value if nothing was parsed */}
      {!hasEasing && !hasDuration && (
        <div
          style={{
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#6B7280',
            padding: '8px',
            backgroundColor: '#F9FAFB',
            borderRadius: '6px',
          }}
        >
          {token.value}
        </div>
      )}

      {/* Usage */}
      {token.usage && (
        <div
          style={{
            fontSize: '11px',
            color: '#9CA3AF',
          }}
        >
          {token.usage}
        </div>
      )}
    </div>
  );
}

export function MotionPreview({ section }: { section: TokenSection }) {
  const allTokens = [
    ...section.tokens,
    ...section.subsections.flatMap((sub) => sub.tokens),
  ];

  const motionTokens = allTokens.map((t) =>
    parseMotionToken(t.name, t.value, t.usage)
  );

  const maxDuration = Math.max(
    ...motionTokens.map((t) => t.duration ?? 300),
    300
  );

  if (motionTokens.length === 0) return null;

  // Separate easing tokens and duration tokens for grouping
  const easingTokens = motionTokens.filter((t) => t.easing);
  const durationTokens = motionTokens.filter((t) => !t.easing && t.duration !== null);
  const otherTokens = motionTokens.filter((t) => !t.easing && t.duration === null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Easing tokens */}
      {easingTokens.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {easingTokens.map((token, i) => (
            <MotionCard key={`e-${i}`} token={token} maxDuration={maxDuration} />
          ))}
        </div>
      )}

      {/* Duration tokens */}
      {durationTokens.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {durationTokens.map((token, i) => (
            <MotionCard key={`d-${i}`} token={token} maxDuration={maxDuration} />
          ))}
        </div>
      )}

      {/* Other tokens (unparseable) */}
      {otherTokens.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {otherTokens.map((token, i) => (
            <MotionCard key={`o-${i}`} token={token} maxDuration={maxDuration} />
          ))}
        </div>
      )}
    </div>
  );
}
