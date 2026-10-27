'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useSpring, useTransform } from 'framer-motion';
import { MIN_SCORE, scoreColor } from '@/lib/days';

const SPARKS = 14;

type Props = {
  size: number;
  date: Date;
  value: number | null;
  editable: boolean;
  /** Bumped each time a meter is saved; fires a burst */
  pulse: number;
};

/**
 * Today's overall score, the average of its meters: liquid light that rises, glows hotter and
 * shifts color as the meters fill. Each save sets off a burst.
 */
export default function TodayBox({ size, date, value, editable, pulse }: Props) {
  const [bursts, setBursts] = useState<{ id: number; score: number }[]>([]);

  const level = useSpring(0, { stiffness: 140, damping: 18 });
  const height = useTransform(level, (v) => `${v}%`);
  useEffect(() => { level.set(value ?? 0); }, [value, level]);

  const valueRef = useRef(value);
  valueRef.current = value;
  useEffect(() => {
    if (pulse && valueRef.current) setBursts((b) => [...b, { id: pulse, score: valueRef.current! }]);
  }, [pulse]);

  const shown = value ?? MIN_SCORE;
  const glow = value ? 8 + value * 0.4 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="relative shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.2,
        boxShadow: value
          ? `0 0 ${glow}px ${glow / 4}px ${scoreColor(shown, 0.35)}, 0 0 ${glow * 2.5}px ${scoreColor(shown, 0.15)}`
          : undefined,
        transition: 'box-shadow 0.4s ease',
      }}
    >
      {/* Glass shell; breathes while today is still empty and yours to fill */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          borderRadius: 'inherit',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          animation: value || !editable ? undefined : 'days-breathe 3.2s ease-in-out infinite',
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

      {/* Calendar face: two binding rings, the day big in the middle, the month along the bottom */}
      {[0.3, 0.7].map((p) => (
        <span
          key={p}
          className="pointer-events-none absolute -translate-x-1/2 rounded-full bg-white/30"
          style={{ left: `${p * 100}%`, top: -size * 0.05, width: size * 0.05, height: size * 0.13 }}
        />
      ))}
      <div
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center text-white"
        style={{ textShadow: '0 1px 10px rgba(0, 0, 0, 0.3)' }}
      >
        <span className="font-semibold leading-none tabular-nums" style={{ fontSize: size * 0.42, opacity: value ? 0.95 : 0.75 }}>
          {date.getDate()}
        </span>
        <span
          className="absolute uppercase tracking-[0.2em]"
          style={{ bottom: size * 0.09, fontSize: Math.max(9, size * 0.1), opacity: value ? 0.85 : 0.45 }}
        >
          {date.toLocaleString('en-US', { month: 'short' })}
        </span>
      </div>

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
