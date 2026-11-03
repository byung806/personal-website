'use client';

import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Patrick_Hand } from 'next/font/google';
import PaintedCanvas from './painted-canvas';
import { paintRocket } from './rocket-paint';
import { paintPlanet, type PlanetLook } from './planet-paint';
import { decodeRocket, encodeRocket, randomRocket, type RocketDesign } from '@/lib/rocket';

const hand = Patrick_Hand({ subsets: ['latin'], weight: '400' });

/** A guestbook entry as a rocket (from /api/rockets). */
export type RocketEntry = { id: number; username: string; message: string; rocket: string; createdAt: string };

/** The guestbook rockets, plus signing one (`sign`) and showing it once its flight is over (`land`). */
export function useRockets() {
  const [rockets, setRockets] = useState<RocketEntry[]>([]);
  const [justLaunchedId, setJustLaunchedId] = useState<number | null>(null);
  const pending = useRef<RocketEntry | null>(null);

  useEffect(() => {
    fetch('/api/rockets')
      .then((r) => (r.ok ? r.json() : null))
      .then((list: RocketEntry[] | null) => list && setRockets(list))
      .catch(() => {});
  }, []);

  /** Saves the signed rocket; resolves to an error message, or null once it's saved. */
  const sign = useCallback(async (design: RocketDesign, username: string, message: string) => {
    try {
      const res = await fetch('/api/rockets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, message, rocket: encodeRocket(design) }),
      });
      const body = await res.json();
      if (!res.ok) return (body.error as string) ?? 'Something went wrong';
      pending.current = body;
      return null;
    } catch {
      return 'Something went wrong';
    }
  }, []);

  const land = useCallback(() => {
    const entry = pending.current;
    if (!entry) return;
    pending.current = null;
    setRockets((list) => [entry, ...list]);
    setJustLaunchedId(entry.id);
  }, []);

  return { rockets, sign, land, justLaunchedId };
}

/** One pencil rocket on its own canvas. */
export function RocketCanvas({ design, seed, flame = false, eager = false, className = '', style }: { design: RocketDesign; seed: number; flame?: boolean; eager?: boolean; className?: string; style?: CSSProperties }) {
  const paint = useCallback((ctx: CanvasRenderingContext2D, w: number) => paintRocket(ctx, w, design, seed, flame), [design, seed, flame]);
  return (
    <div className={className} style={style}>
      <PaintedCanvas paint={paint} grain={10} eager={eager} className="h-full w-full" />
    </div>
  );
}

/** Stable pseudo-random 0..1 per id. */
const hash01 = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * How far rockets drift against the page while crossing the screen, in px: the farthest lag behind by
 * this much (so they scroll slower), the nearest pull ahead (faster).
 */
const DEPTH_DRIFT = [420, -220];

/** "3 days ago", in plain words. */
function ago(iso: string) {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (seconds < 60) return 'just now';
  const fmt = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
  const [unit, size] = units.find(([, n]) => seconds >= n)!;
  return fmt.format(-Math.floor(seconds / size), unit);
}

/** A rocket drifting in its cell with the signer's name under it; hover or tap to read their note. */
function FloatingRocket({ entry, fresh, index }: { entry: RocketEntry; fresh: boolean; index: number }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  // How far the note slides sideways to stay on screen
  const [nudge, setNudge] = useState(0);
  const noteRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!open || !noteRef.current) return setNudge(0);
    // Measured unscaled (it pops in from half size)
    const box = noteRef.current.getBoundingClientRect();
    const half = noteRef.current.offsetWidth / 2;
    const [left, right] = [(box.left + box.right) / 2 - half, (box.left + box.right) / 2 + half];
    const pad = 12;
    setNudge(left < pad ? pad - left : right > innerWidth - pad ? innerWidth - pad - right : 0);
  }, [open]);
  const design = useMemo(() => decodeRocket(entry.rocket) ?? randomRocket(), [entry.rocket]);
  const id = entry.id;
  // How near it is, 0 (far) to 1 (near), with more far ones than near: nearer ones are bigger,
  // brighter and scroll faster (see DEPTH_DRIFT)
  const depth = Math.pow(hash01(id * 41), 1.4);
  const size = 36 + depth * 54;
  const dx = (4 + hash01(id * 3) * 10) * (0.5 + depth);
  const dy = (4 + hash01(id * 5) * 10) * (0.5 + depth);
  const anchor = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({ target: anchor, offset: ['start end', 'end start'] });
  const [far, near] = DEPTH_DRIFT;
  const drift = far + (near - far) * depth;
  const parallaxY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-drift / 2, drift / 2]);
  // All heading up together, like one fleet, each a few degrees off
  const tilt = Math.round(hash01(id * 23) * 10 - 5);

  return (
    <>
      {/* Measures the cell, since the rocket itself moves */}
      <span ref={anchor} aria-hidden className="pointer-events-none absolute inset-0" />
      <motion.div
        className="absolute"
        style={{ left: `${30 + hash01(id * 13) * 40}%`, x: '-50%', top: `${6 + hash01(id * 17) * 28}%`, y: parallaxY, zIndex: open ? 60 : Math.round(depth * 10) }}
      >
        <motion.div
          className="flex flex-col items-center pointer-events-auto cursor-help"
          initial={reduce ? false : fresh ? { y: 700, opacity: 0 } : { scale: 0, opacity: 0 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={fresh ? { duration: 2.2, ease: [0.2, 0.7, 0.2, 1] } : { type: 'spring', stiffness: 420, damping: 13, delay: 0.2 + (index % 6) * 0.08 }}
          onHoverStart={() => setOpen(true)}
          onHoverEnd={() => setOpen(false)}
          onTap={() => setOpen((o) => !o)}
        >
          <motion.div
            style={{ width: size, height: size }}
            initial={{ rotate: tilt }}
            animate={reduce ? undefined : { x: [0, dx, 0, -dx, 0], y: [0, -dy, 0, dy, 0], rotate: [tilt, tilt + 2, tilt, tilt - 2, tilt] }}
            transition={{ duration: 14 + hash01(id * 7) * 12, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              className="w-full h-full [filter:drop-shadow(0_0_8px_rgba(240,200,190,0.3))]"
              animate={open && !reduce ? { scale: 1.2, rotate: [0, -7, 6, -3, 0] } : { scale: 1, rotate: 0 }}
              transition={open ? { scale: { type: 'spring', stiffness: 400, damping: 12 }, rotate: { duration: 0.5 } } : { duration: 0.25 }}
            >
              <RocketCanvas design={design} seed={id * 13} flame className="w-full h-full" style={{ opacity: 0.6 + depth * 0.4 }} />
            </motion.div>
          </motion.div>
          <span
            // Only while hovered, so the sky isn't a wall of names
            className={`${hand.className} mt-1 max-w-[120px] truncate leading-none text-[#f0dfd2] transition-opacity duration-200`}
            style={{ fontSize: 13 + depth * 4, opacity: open ? 0.9 : 0 }}
          >
            {entry.username}
          </span>

          <AnimatePresence>
            {open && (
              <motion.div
                ref={noteRef}
                className={`${hand.className} absolute top-full mt-2 left-1/2 w-max max-w-[min(240px,70vw)] rounded-2xl bg-[#f0dfd2] px-4 py-2.5 text-[#3a1f28] shadow-[0_0_18px_rgba(240,200,190,0.35)] pointer-events-none`}
                style={{ marginLeft: nudge }}
                initial={{ opacity: 0, scale: 0.5, x: '-50%', y: -8, rotate: -6 }}
                animate={{ opacity: 1, scale: 1, x: '-50%', y: 0, rotate: hash01(id * 29) < 0.5 ? -2 : 2 }}
                exit={{ opacity: 0, scale: 0.6, x: '-50%', transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 520, damping: 16 }}
              >
                {entry.message && <p className="text-[17px] leading-snug break-words">{entry.message}</p>}
                <p className="mt-1 text-[14px] leading-tight text-[#3a1f28]/60">
                  {entry.username}, launched {ago(entry.createdAt)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}

/** A pencil planet that links to a page, with what you can do there written under it. */
export function PlanetLink({ href, look, label, seed = 1 }: { href: string; look: PlanetLook; label: string; seed?: number }) {
  const paint = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => paintPlanet(ctx, w, h, look, seed), [look, seed]);
  return (
    <Link href={href} className="group relative flex h-full flex-col items-center justify-center pointer-events-auto">
      <motion.div
        className="relative aspect-square w-[min(100%,300px)] transition-transform duration-500 group-hover:scale-[1.06] group-hover:-rotate-3"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      >
        <PaintedCanvas paint={paint} grain={12} className="absolute inset-0 w-full h-full [filter:drop-shadow(0_0_24px_rgba(240,200,190,0.18))]" />
      </motion.div>
      <span className={`${hand.className} -mt-2 text-[24px] md:text-[28px] leading-none text-[#f0dfd2] underline-offset-[6px] decoration-[#f0dfd2]/40 group-hover:underline`}>
        {label}
      </span>
    </Link>
  );
}

/**
 * Space full of guestbook rockets (newest first) with planets dropped in among them, laid out on a
 * grid so nothing piles up. `planets` lists [position in the list, planet, optional grid classes to place it].
 */
export default function RocketField({ rockets, planets, justLaunchedId }: { rockets: RocketEntry[]; planets: [number, ReactNode, string?][]; justLaunchedId: number | null }) {
  const at = new Map(planets.map(([i, node, className = '']) => [i, { node, className }]));
  // Planets stay put even before the rockets load
  const slots = Math.max(rockets.length, Math.max(...planets.map(([i]) => i)) + 1);
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 auto-rows-[190px] sm:auto-rows-[240px] grid-flow-dense">
      {Array.from({ length: slots }, (_, i) => (
        <Fragment key={rockets[i]?.id ?? `empty-${i}`}>
          {at.has(i) && <div className={`col-span-2 row-span-2 ${at.get(i)!.className}`}>{at.get(i)!.node}</div>}
          <div className="relative">{rockets[i] && <FloatingRocket entry={rockets[i]} fresh={rockets[i].id === justLaunchedId} index={i} />}</div>
        </Fragment>
      ))}
    </div>
  );
}
