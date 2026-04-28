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

  let duration: number | null = null;
  let easing: string | null = null;

  const msMatch = lower.match(/(\d+)\s*ms/);
  const sMatch = lower.match(/([\d.]+)\s*s(?!ec)/);
  if (msMatch) {
    duration = parseInt(msMatch[1], 10);
  } else if (sMatch) {
    duration = parseFloat(sMatch[1]) * 1000;
  }

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
    easing = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  }

  if (!duration && !easing) {
    const pureEasing = lower.replace(/[^a-z0-9().,-\s]/g, '').trim();
    if (['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'].includes(pureEasing)) {
      easing = pureEasing;
    }
  }

  if (!easing && !duration) {
    const nameHints = name.toLowerCase();
    if (/easing|curve/.test(nameHints)) {
      easing = value.trim();
    }
    if (/duration|delay|speed|timing/.test(nameHints)) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        duration = num > 10 ? num : num * 1000;
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

  const p0 = { x: pad, y: pad + h };
  const p1 = { x: pad + x1 * w, y: pad + h - y1 * h };
  const p2 = { x: pad + x2 * w, y: pad + h - y2 * h };
  const p3 = { x: pad + w, y: pad };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={pad} y={pad} width={w} height={h} fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-200 dark:text-gray-700" />
      <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="#C7D2FE" strokeWidth="1" strokeDasharray="2 2" />
      <line x1={p3.x} y1={p3.y} x2={p2.x} y2={p2.y} stroke="#C7D2FE" strokeWidth="1" strokeDasharray="2 2" />
      <path
        d={`M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`}
        fill="none"
        stroke="#6366F1"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx={p1.x} cy={p1.y} r="3" fill="#818CF8" />
      <circle cx={p2.x} cy={p2.y} r="3" fill="#818CF8" />
      <circle cx={p0.x} cy={p0.y} r="2.5" fill="currentColor" className="text-gray-700 dark:text-gray-300" />
      <circle cx={p3.x} cy={p3.y} r="2.5" fill="currentColor" className="text-gray-700 dark:text-gray-300" />
    </svg>
  );
}

function AnimatedDot({ easing, duration, playing }: { easing: string; duration: number; playing: boolean }) {
  return (
    <div className="w-full h-7 bg-gray-50 dark:bg-gray-800 rounded-full relative overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Track line */}
      <div className="absolute top-1/2 left-3.5 right-3.5 h-px bg-gray-300 dark:bg-gray-600" />
      {/* Dot */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-indigo-500 shadow-[0_1px_3px_rgba(99,102,241,0.4)]"
        style={{
          left: playing ? 'calc(100% - 22px)' : '6px',
          transition: playing
            ? `left ${duration}ms ${easing}`
            : 'left 0ms',
        }}
      />
    </div>
  );
}

function DurationBar({ duration, maxDuration }: { duration: number; maxDuration: number }) {
  const widthPercent = Math.max((duration / maxDuration) * 100, 8);
  return (
    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-sm overflow-hidden">
      <div
        className="h-full bg-orange-500 rounded-sm transition-[width] duration-300 ease-in-out"
        style={{ width: `${widthPercent}%` }}
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
        resetTimer.current = setTimeout(() => {
          setPlaying(false);
        }, animDuration + 800);
      });
    });
  }, [animDuration]);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-[10px] p-4 flex flex-col gap-2.5 min-w-[200px] flex-[1_1_200px] max-w-[320px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">
          {token.name}
        </div>
        {isAnimatable && (
          <button
            onClick={handlePlay}
            className="flex items-center justify-center w-[26px] h-[26px] p-0 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-md cursor-pointer text-indigo-500 transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900"
            title="Play animation"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <polygon points="1,0 10,5 1,10" />
            </svg>
          </button>
        )}
      </div>

      {/* Easing curve */}
      {hasEasing && (
        <div className="flex items-center gap-3">
          <EasingCurveSVG easing={token.easing!} />
          <div className="flex flex-col gap-0.5">
            <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
              {token.easing}
            </div>
            {hasDuration && (
              <div className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
                {token.duration}ms
              </div>
            )}
          </div>
        </div>
      )}

      {/* Duration bar */}
      {!hasEasing && hasDuration && (
        <div className="flex flex-col gap-1">
          <DurationBar duration={token.duration!} maxDuration={maxDuration} />
          <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
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

      {/* Raw value fallback */}
      {!hasEasing && !hasDuration && (
        <div className="text-xs font-mono text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
          {token.value}
        </div>
      )}

      {/* Usage */}
      {token.usage && (
        <div className="text-[11px] text-gray-400 dark:text-gray-500">
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

  const easingTokens = motionTokens.filter((t) => t.easing);
  const durationTokens = motionTokens.filter((t) => !t.easing && t.duration !== null);
  const otherTokens = motionTokens.filter((t) => !t.easing && t.duration === null);

  return (
    <div className="flex flex-col gap-4">
      {easingTokens.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {easingTokens.map((token, i) => (
            <MotionCard key={`e-${i}`} token={token} maxDuration={maxDuration} />
          ))}
        </div>
      )}
      {durationTokens.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {durationTokens.map((token, i) => (
            <MotionCard key={`d-${i}`} token={token} maxDuration={maxDuration} />
          ))}
        </div>
      )}
      {otherTokens.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {otherTokens.map((token, i) => (
            <MotionCard key={`o-${i}`} token={token} maxDuration={maxDuration} />
          ))}
        </div>
      )}
    </div>
  );
}
