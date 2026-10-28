'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { MAX_SCORE, MIN_SCORE, scoreColor, type MeterKey } from '@/lib/days';
import { METER_ICONS } from './meter-icons';

type Props = {
  meter: { key: MeterKey; label: string; description: string };
  width: number;
  height: number;
  value: number | null;
  editable: boolean;
  onDraft: (score: number) => void;
  onCommit: (score: number) => void;
};

/** One of today's meters: a slim pill you drag up to fill, with its icon underneath. */
export default function Meter({ meter, width, height, value, editable, onDraft, onCommit }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const draftRef = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const level = useSpring(0, { stiffness: 160, damping: 20 });
  const fill = useTransform(level, (v) => `${v}%`);
  useEffect(() => { level.set(value ?? 0); }, [value, level]);

  const Icon = METER_ICONS[meter.key];
  const shown = value ?? MIN_SCORE;

  const scoreAt = (clientY: number) => {
    const rect = ref.current!.getBoundingClientRect();
    const t = 1 - (clientY - rect.top) / rect.height;
    return Math.min(MAX_SCORE, Math.max(MIN_SCORE, Math.round(t * MAX_SCORE)));
  };

  const draftTo = (score: number) => {
    draftRef.current = score;
    onDraft(score);
  };

  return (
    <div
      className="relative flex flex-col items-center gap-1.5"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <span
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-40 -translate-x-1/2 rounded-lg border border-white/10 bg-[#111118]/95 px-2 py-1.5 text-center text-[10px] leading-snug text-white/50 transition-opacity duration-150"
        style={{ opacity: hovered || dragging ? 1 : 0 }}
      >
        <span className="block text-[11px] text-white/85">{meter.label}</span>
        {meter.description}
      </span>
      <motion.div
        ref={ref}
        role={editable ? 'slider' : undefined}
        aria-label={meter.label}
        aria-valuemin={MIN_SCORE}
        aria-valuemax={MAX_SCORE}
        aria-valuenow={value ?? undefined}
        tabIndex={editable ? 0 : -1}
        animate={{ scaleX: dragging ? 1.25 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`relative overflow-hidden rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${editable ? 'cursor-ns-resize' : ''}`}
        style={{
          width,
          height,
          touchAction: 'none',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: value ? `0 0 ${dragging ? 16 : 6 + value / 14}px ${scoreColor(shown, dragging ? 0.6 : 0.35)}` : undefined,
          transition: 'box-shadow 0.3s ease',
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
          if (draftRef.current !== null) onCommit(draftRef.current);
          draftRef.current = null;
        }}
        onKeyDown={(e) => {
          if (!editable || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
          e.preventDefault();
          onCommit(Math.min(MAX_SCORE, Math.max(MIN_SCORE, (value ?? 0) + (e.key === 'ArrowUp' ? 5 : -5))));
        }}
      >
        <motion.div
          className="absolute inset-x-0 bottom-0 rounded-full"
          style={{
            height: fill,
            background: `linear-gradient(to top, ${scoreColor(shown, 0.95)}, ${scoreColor(shown, 0.75)})`,
          }}
        />
      </motion.div>
      <Icon size={12} strokeWidth={2} style={{ color: value ? scoreColor(shown) : 'rgba(255, 255, 255, 0.3)' }} />
    </div>
  );
}
