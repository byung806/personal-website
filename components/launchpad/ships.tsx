'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, cubicBezier, motion, useReducedMotion } from 'framer-motion';
import { Patrick_Hand } from 'next/font/google';
import PaintedCanvas from './painted-canvas';
import { paintPencilButton, paintShip, paintSmokePuff, type ShipKind } from './paint';
import { SKY_LAUNCHES, type Launch, type LaunchStats } from '@/lib/launches';

const hand = Patrick_Hand({ subsets: ['latin'], weight: '400' });

/** `launchedAt` is an ISO time; the default fleet has none. */
export type Ship = { id: number; kind: ShipKind; color: string; x: number; y: number; tilt: number; launchedAt?: string };

export { SHIP_COLORS } from '@/lib/launches';

/** The fleet that's always in the sky, so it's never empty. x/y are percentages of the sky. */
const DEFAULT_FLEET: Omit<Ship, 'id'>[] = [
  { kind: 'rocket', color: '#f0dfd2', x: 14, y: 34, tilt: 24 },
  { kind: 'ufo', color: '#b9a3d6', x: 76, y: 22, tilt: -8 },
  { kind: 'satellite', color: '#e8c98f', x: 46, y: 70, tilt: 18 },
];

/** Launch ids are offset so they never collide with the default fleet's. */
const LAUNCH_ID = 1000;

/** Open spots for launches, spread around the default fleet so ships never pile up (x/y in %). */
const SLOTS = [
  [32, 62],
  [60, 26],
  [86, 60],
  [28, 20],
  [66, 66],
  [88, 36],
];

/** Where a launch floats: the `i`th open spot, nudged a little by its id. */
const placed = ({ createdAt, ...l }: Launch, i: number): Ship => ({
  ...l,
  launchedAt: createdAt,
  id: LAUNCH_ID + l.id,
  x: SLOTS[i % SLOTS.length][0] + (hash01(l.id * 17) - 0.5) * 8,
  y: SLOTS[i % SLOTS.length][1] + (hash01(l.id * 19) - 0.5) * 10,
  tilt: Math.round(hash01(l.id * 23) * 80 - 40),
});

/** Default ships plus a spread of launches from everyone, old and new, stored in the database (/api/launches). */
export function useFleet() {
  const [stats, setStats] = useState<LaunchStats>({ total: 0, counts: {}, sky: [] });
  /** Id of the ship launched this visit, so only it flies in. */
  const [justLaunchedId, setJustLaunchedId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/launches')
      .then((r) => (r.ok ? r.json() : null))
      .then((s: LaunchStats | null) => s && setStats(s))
      .catch(() => {});
  }, []);

  const launch = useCallback(async (kind: ShipKind, color: string) => {
    try {
      const res = await fetch('/api/launches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, color }),
      });
      if (!res.ok) return;
      const launched: Launch = await res.json();
      // The new one takes the oldest one's spot (others stay put), or a free spot if there is one
      setStats((s) => {
        if (s.sky.length < SKY_LAUNCHES) return { ...s, total: s.total + 1, sky: [...s.sky, launched] };
        const oldest = s.sky.reduce((o, l, i) => (l.createdAt < s.sky[o].createdAt ? i : o), 0);
        return { ...s, total: s.total + 1, sky: s.sky.map((l, i) => (i === oldest ? launched : l)) };
      });
      setJustLaunchedId(LAUNCH_ID + launched.id);
    } catch {}
  }, []);

  const ships: Ship[] = [...DEFAULT_FLEET.map((s, i) => ({ ...s, id: i + 1 })), ...stats.sky.map(placed)];
  return { ships, launch, justLaunchedId, total: stats.total };
}

/** One pencil-drawn ship on its own canvas. */
export function ShipCanvas({ kind, color, seed, flame = true, className = '' }: { kind: ShipKind; color: string; seed: number; flame?: boolean; className?: string }) {
  const paint = useCallback(
    (ctx: CanvasRenderingContext2D, w: number) => paintShip(ctx, w, kind, color, seed, flame),
    [kind, color, seed, flame],
  );
  return <PaintedCanvas paint={paint} grain={10} className={className} />;
}

/** Stable pseudo-random 0..1 per id. */
const hash01 = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Rotate a looping keyframe list so it starts `k` steps in (the last frame repeats the first). */
const fromStep = <T,>(frames: T[], k: number) => {
  const loop = frames.slice(0, -1);
  const rotated = [...loop.slice(k), ...loop.slice(0, k)];
  return [...rotated, rotated[0]];
};

/** How a just-launched ship rises into the sky (from `ARRIVAL_DROP` px below its spot). */
const ARRIVAL = { duration: 2.2, ease: [0.2, 0.7, 0.2, 1] as const };
const ARRIVAL_DROP = 600;
const arrivalEase = cubicBezier(...ARRIVAL.ease);

/** One small exhaust puff: swells, sinks a little and blurs as it fades. */
function ExhaustPuff({ seed, size, left, top, delay }: { seed: number; size: number; left: string; top: string; delay: number }) {
  const paint = useCallback((ctx: CanvasRenderingContext2D, w: number) => paintSmokePuff(ctx, w, seed), [seed]);
  const drift = (hash01(seed * 3) - 0.5) * 16;
  return (
    <motion.div
      className="absolute"
      style={{ left, top, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 0.85, 0.5, 0],
        scale: [0.5, 1, 1.35, 1.7],
        x: [0, drift * 0.4, drift * 0.8, drift],
        y: [0, 6, 12, 18],
        filter: ['blur(0px)', 'blur(1.5px)', 'blur(3px)', 'blur(4px)'],
      }}
      transition={{ duration: 1.5, delay, ease: 'linear' }}
    >
      <PaintedCanvas paint={paint} grain={6} className="w-full h-full" />
    </motion.div>
  );
}

/**
 * Small puffs left behind a just-launched ship as it rises, each dropped at the ship's tail at the
 * moment it passes, and stopping when it arrives (when its engine goes out).
 */
function ExhaustTrail({ ship, size }: { ship: Ship; size: number }) {
  const a = (ship.tilt * Math.PI) / 180;
  const tail = size * 0.42; // ship center to the end of its flame, turned with the ship
  const [tx, ty] = [-Math.sin(a) * tail, Math.cos(a) * tail];
  const n = 16;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const t = (i / n) * ARRIVAL.duration * 0.95;
        const below = ARRIVAL_DROP * (1 - arrivalEase(t / ARRIVAL.duration));
        const seed = ship.id * 97 + i;
        return (
          <ExhaustPuff
            key={i}
            seed={seed}
            size={12 + hash01(seed) * 14}
            left={`calc(${ship.x}% + ${tx + (hash01(seed * 5) - 0.5) * 6}px)`}
            top={`calc(${ship.y}% + ${ty + below}px)`}
            delay={t}
          />
        );
      })}
    </>
  );
}

/** "launched 3 days ago", in plain words. */
function launchedAgo(iso?: string) {
  if (!iso) return 'here since ???';
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (seconds < 60) return 'launched just now';
  const fmt = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
  const [unit, size] = units.find(([, n]) => seconds >= n)!;
  return `launched ${fmt.format(-Math.floor(seconds / size), unit)}`;
}

/** A pencil-drawn tag that pops out next to a hovered ship, saying how long it's been up there. */
function AgeTag({ ship, size, below }: { ship: Ship; size: number; below: boolean }) {
  return (
    <motion.div
      className={`${hand.className} absolute left-1/2 z-10 whitespace-nowrap pointer-events-none`}
      style={below ? { top: size * 0.9 } : { bottom: size * 0.9 }}
      initial={{ opacity: 0, scale: 0.4, x: '-50%', y: below ? -10 : 10, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, x: '-50%', y: 0, rotate: hash01(ship.id * 29) < 0.5 ? -3 : 3 }}
      exit={{ opacity: 0, scale: 0.6, x: '-50%', transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 520, damping: 16 }}
    >
      <span className="relative block px-3.5 py-1 text-[16px] leading-tight text-[#3a1f28]">
        <span aria-hidden className="absolute inset-0 drop-shadow-[0_0_10px_rgba(240,200,190,0.45)]">
          <PaintedCanvas paint={paintPencilButton} grain={10} className="w-full h-full" />
        </span>
        <span className="relative">{launchedAgo(ship.launchedAt)}</span>
      </span>
    </motion.div>
  );
}

/**
 * The ships pop into the sky one by one, then each bobs on its own slow loop (each starts at a
 * different point of it). A just-launched rocket rises in from below with its engine lit,
 * which goes out once it's floating. Hovering (or tapping) a ship puffs it up with its engine lit
 * and pops out a tag saying how long ago it was launched.
 */
export function Fleet({ ships, justLaunchedId }: { ships: Ship[]; justLaunchedId: number | null }) {
  const reduce = useReducedMotion();
  const [arrivedId, setArrivedId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {ships.map((s, i) => {
        const size = 52 + hash01(s.id) * 40;
        const dx = 10 + hash01(s.id * 3) * 22;
        const dy = 8 + hash01(s.id * 5) * 16;
        const fresh = s.id === justLaunchedId;
        const hovered = s.id === hoveredId;
        const step = Math.floor(hash01(s.id * 11) * 4); // where in its loop this ship starts
        const drift = {
          x: fromStep([0, dx, 0, -dx, 0], step),
          y: fromStep([0, -dy, 0, dy, 0], step),
          rotate: fromStep([s.tilt, s.tilt + 5, s.tilt, s.tilt - 5, s.tilt], step),
        };
        return (
          <Fragment key={s.id}>
            {fresh && !reduce && <ExhaustTrail ship={s} size={size} />}
            <motion.div
              className="absolute pointer-events-auto cursor-help"
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, zIndex: hovered ? 20 : undefined }}
              initial={reduce ? false : fresh ? { y: ARRIVAL_DROP, opacity: 0 } : { scale: 0, opacity: 0 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              // A launch rises in; the rest pop into the sky one after another
              transition={fresh ? ARRIVAL : { type: 'spring', stiffness: 420, damping: 13, delay: 0.25 + (i % 4) * 0.12 }}
              onAnimationComplete={() => fresh && setArrivedId(s.id)}
              onHoverStart={() => setHoveredId(s.id)}
              onHoverEnd={() => setHoveredId((h) => (h === s.id ? null : h))}
              onTap={() => setHoveredId((h) => (h === s.id ? null : s.id))}
            >
              <AnimatePresence>{hovered && <AgeTag ship={s} size={size} below={s.y < 40} />}</AnimatePresence>
              {/* Puffs up with a little wobble when hovered */}
              <motion.div
                className="w-full h-full"
                animate={hovered && !reduce ? { scale: 1.18, rotate: [0, -7, 6, -3, 0] } : { scale: 1, rotate: 0 }}
                transition={hovered ? { scale: { type: 'spring', stiffness: 400, damping: 12 }, rotate: { duration: 0.5 } } : { duration: 0.25 }}
              >
                <motion.div
                  className="w-full h-full [filter:drop-shadow(0_0_8px_rgba(240,200,190,0.35))]"
                  // Start (and server-render) at the loop's first frame, so there's no jump when motion begins
                  initial={{ x: drift.x[0], y: drift.y[0], rotate: drift.rotate[0] }}
                  animate={reduce ? undefined : drift}
                  transition={{ duration: 16 + hash01(s.id * 7) * 14, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ShipCanvas kind={s.kind} color={s.color} seed={s.id * 13} flame={(fresh && arrivedId !== s.id) || hovered} className="w-full h-full" />
                </motion.div>
              </motion.div>
            </motion.div>
          </Fragment>
        );
      })}
    </div>
  );
}
