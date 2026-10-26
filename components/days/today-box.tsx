'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useSpring, useTransform } from 'framer-motion';
import { MAX_SCORE, MIN_SCORE, scoreColor } from '@/lib/days';

const SPARKS = 14;

type Props = {
  size: number;
  day: number;
  value: number | null;
  editable: boolean;
  onDraft: (score: number) => void;
  onCommit: (score: number) => void;
};

/**
 * Today's evaluation: drag up inside the box (or tap a height) and it fills with liquid light,
 * glowing hotter and shifting color the higher it goes. Letting go saves it with a burst.
 */
export default function TodayBox({ size, day, value, editable, onDraft, onCommit }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const draftRef = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [bursts, setBursts] = useState<{ id: number; score: number }[]>([]);

  const level = useSpring(0, { stiffness: 140, damping: 18 });
  const height = useTransform(level, (v) => `${v}%`);
  useEffect(() => { level.set(value ?? 0); }, [value, level]);

  const shown = value ?? MIN_SCORE;
  const glow = value ? 8 + value * (dragging ? 0.55 : 0.35) : 0;

  const scoreAt = (clientY: number) => {
    const rect = ref.current!.getBoundingClientRect();
    const t = 1 - (clientY - rect.top) / rect.height;
    return Math.min(MAX_SCORE, Math.max(MIN_SCORE, Math.round(t * MAX_SCORE)));
  };

  const draftTo = (score: number) => {
    draftRef.current = score;
    onDraft(score);
  };

  const commit = (score: number, burst: boolean) => {
    onCommit(score);
    if (burst) setBursts((b) => [...b, { id: Date.now(), score }]);
  };

  return (
    <motion.div
      ref={ref}
      role={editable ? 'slider' : undefined}
      aria-valuemin={MIN_SCORE}
      aria-valuemax={MAX_SCORE}
      aria-valuenow={value ?? undefined}
      tabIndex={editable ? 0 : -1}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: dragging ? 1.04 : 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`relative shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${editable ? 'cursor-ns-resize' : ''}`}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.2,
        touchAction: 'none',
        boxShadow: value
          ? `0 0 ${glow}px ${glow / 4}px ${scoreColor(shown, 0.35)}, 0 0 ${glow * 2.5}px ${scoreColor(shown, 0.15)}`
          : undefined,
        transition: 'box-shadow 0.4s ease',
      }}
      onPointerDown={(e) => {
        if (!editable) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
        draftTo(scoreAt(e.clientY));
      }}
      onPointerMove={(e) => {
        if (dragging) draftTo(scoreAt(e.clientY));
      }}
      onPointerUp={() => {
        if (!dragging) return;
        setDragging(false);
        if (draftRef.current !== null) commit(draftRef.current, true);
        draftRef.current = null;
      }}
      onKeyDown={(e) => {
        if (!editable || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
        e.preventDefault();
        const next = Math.min(MAX_SCORE, Math.max(MIN_SCORE, (value ?? 0) + (e.key === 'ArrowUp' ? 5 : -5)));
        commit(next, false);
      }}
    >
      {/* Glass shell; breathes while today is still empty */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          borderRadius: 'inherit',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          animation: value ? undefined : 'days-breathe 3.2s ease-in-out infinite',
        }}
      >
        <motion.div
          className="absolute inset-x-0 bottom-0"
          style={{
            height,
            background: `linear-gradient(to top, ${scoreColor(shown, 0.95)}, ${scoreColor(shown, 0.7)})`,
            transition: 'background 0.3s ease',
          }}
        >
          {/* Two drifting waves make the surface feel liquid */}
          {[0, 1].map((i) => (
            <svg
              key={i}
              className="absolute bottom-full left-0 h-[9px] w-[200%]"
              viewBox="0 0 200 10"
              preserveAspectRatio="none"
              style={{
                animation: `days-wave ${i ? 3.4 : 2.3}s linear infinite${i ? ' reverse' : ''}`,
                opacity: value ? (i ? 0.5 : 0.85) : 0,
                marginBottom: -1,
              }}
            >
              <path
                d="M0 5 Q 12.5 0 25 5 T 50 5 T 75 5 T 100 5 T 125 5 T 150 5 T 175 5 T 200 5 V 10 H 0 Z"
                fill={scoreColor(shown, 0.7)}
              />
            </svg>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0" />
        </motion.div>
      </div>

      <span className="pointer-events-none absolute left-2.5 top-2 select-none text-[11px] text-white/45">{day}</span>

      {/* Saving: a ring and a spray of sparks in today's color */}
      <AnimatePresence>
        {bursts.map((b) => (
          <motion.div
            key={b.id}
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            onAnimationComplete={() => setBursts((all) => all.filter((x) => x.id !== b.id))}
          >
            <motion.div
              className="absolute inset-0"
              style={{ borderRadius: size * 0.2, border: `2px solid ${scoreColor(b.score)}` }}
              initial={{ scale: 1 }}
              animate={{ scale: 1.5 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
            {Array.from({ length: SPARKS }, (_, i) => {
              const a = (i / SPARKS) * Math.PI * 2 + b.id;
              const r = size * (0.7 + ((i * 37) % 10) / 20);
              return (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-full"
                  style={{ background: scoreColor(b.score), boxShadow: `0 0 12px 2px ${scoreColor(b.score)}` }}
                  initial={{ x: -5, y: -5, scale: 1 }}
                  animate={{ x: Math.cos(a) * r - 5, y: Math.sin(a) * r - 5, scale: 0 }}
                  transition={{ duration: 0.9, ease: [0.2, 0.8, 0.3, 1] }}
                />
              );
            })}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
