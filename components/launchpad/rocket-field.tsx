'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Patrick_Hand } from 'next/font/google';
import PaintedCanvas from './painted-canvas';
import { paintRocket } from './rocket-paint';
import { PLANETS, PLANET_KINDS, paintPlanet, planetRadius, randomMoonLook, randomPlanetLook, type PlanetLook } from './planet-paint';
import { rng } from '@/lib/pencil';
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

/** "3 days ago", in plain words. */
function ago(iso: string) {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (seconds < 60) return 'just now';
  const fmt = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
  const [unit, size] = units.find(([, n]) => seconds >= n)!;
  return fmt.format(-Math.floor(seconds / size), unit);
}

// ── Solar systems ────────────────────────────────────────────────────────────

/** An elliptical orbit around a planet, tilted by `tilt` (radians); `speed` in radians a second (sign is the direction). */
type Orbit = { rx: number; ry: number; tilt: number; speed: number };
/** A rocket on an orbit, starting `phase` radians round it. */
type Rider = { entry: RocketEntry; orbit: Orbit; phase: number; size: number; design: RocketDesign };
/** A little moon on its own orbit; `key` is negative so it never clashes with a rocket's id. */
type Moon = { key: number; orbit: Orbit; phase: number; size: number; look: PlanetLook; seed: number };
type System = {
  key: string;
  look: PlanetLook;
  seed: number;
  link?: { href: string; label: string };
  /** Planet box size and center, in px of the system's block. */
  box: number;
  cx: number;
  cy: number;
  height: number;
  /** How far it drifts against the page while crossing the screen, in px (parallax: smaller planets read as farther, so they lag). */
  drift: number;
  orbits: Orbit[];
  riders: Rider[];
  moons: Moon[];
};

/** Planets that lead somewhere, by system number. */
const LINKS: Record<number, { href: string; label: string; look: PlanetLook }> = {
  0: { href: '/letters', label: 'read my letters', look: PLANETS.letters },
  2: { href: '/p/planet-garden', label: 'draw a planet', look: PLANETS.garden },
};

/** A lap takes about a minute or two, longer further out. */
const lap = (rx: number, dir: number) => (dir * Math.PI * 2) / (45 + rx * 0.15);

/**
 * Splits the rockets (newest first) into a few solar systems down the page: a planet each (every one a
 * different kind), alternating sides, with up to three tilted orbits its rockets coast round and a moon
 * or two. Laid out for a field `W` px wide.
 */
function buildSystems(rockets: RocketEntry[], W: number): System[] {
  const phone = W < 640;
  const r = rng(99);
  const groups: RocketEntry[][] = [];
  for (let i = 0; i < rockets.length; ) {
    const n = 14 + Math.floor(r() * 7);
    groups.push(rockets.slice(i, i + n));
    i += n;
  }
  // A few stragglers join the system before them rather than get a planet of their own
  if (groups.length > 3 && groups[groups.length - 1].length < 8) groups[groups.length - 2].push(...groups.pop()!);
  while (groups.length < 3) groups.push([]);
  // Planet kinds in a shuffled order, so neighbors never match (not the cratered rock, which the letters moon already is)
  const kinds = PLANET_KINDS.map((_, k) => k).slice(1).sort(() => r() - 0.5);

  return groups.map((group, g) => {
    const sr = rng(g * 977 + 3);
    const link = LINKS[g];
    const look = link?.look ?? randomPlanetLook(sr, kinds[g % kinds.length]);
    const box = phone ? 140 + sr() * 70 : 220 + sr() * 130;
    const R = planetRadius(look, box);
    const side = phone ? 0.5 : (g % 2 ? 0.62 : 0.38) + (sr() - 0.5) * 0.08;
    const cx = side * W;
    // On phones the outer orbit runs a little past the screen's edges, and orbits are rounder, for room
    const room = phone ? W / 2 + 10 : Math.min(cx, W - cx) - 30;
    const squash = phone ? 0.5 + sr() * 0.12 : 0.3 + sr() * 0.14;
    const tilt = (sr() - 0.5) * 0.5;
    const dir = g % 2 ? 1 : -1;

    const count = group.length > 12 ? 3 : group.length > 5 ? 2 : 1;
    // Clear of the planet and its ring, and out to most of the room beside it
    const inner = Math.min(Math.max(R * 1.45 + 24, box * 0.62), room * 0.55);
    const outer = Math.min(room, Math.max(inner * (count === 3 ? 2 : 1.6), phone ? 0 : 330));
    const orbits: Orbit[] = Array.from({ length: count }, (_, k) => {
      const rx = count === 1 ? inner : inner + ((outer - inner) * k) / (count - 1);
      return { rx, ry: rx * squash, tilt: tilt + k * (sr() - 0.5) * 0.2, speed: lap(rx, dir) };
    });

    // More rockets on the longer outer orbits
    const total = orbits.reduce((t, o) => t + o.rx ** 1.5, 0);
    const shares = orbits.map((o) => Math.round((group.length * o.rx ** 1.5) / total));
    shares[shares.length - 1] += group.length - shares.reduce((a, b) => a + b, 0);
    let next = 0;
    const riders = orbits.flatMap((orbit, k) =>
      group.slice(next, (next += shares[k])).map((entry, j, list) => ({
        entry,
        orbit,
        phase: (Math.PI * 2 * j) / list.length + (sr() - 0.5) * 0.3,
        size: phone ? 30 + sr() * 8 : 54 + sr() * 16,
        design: decodeRocket(entry.rocket) ?? randomRocket(sr),
      })),
    );

    // A moon or two: one close in, sometimes one way out, on orbits of their own
    const moons: Moon[] = Array.from({ length: 1 + (sr() < 0.5 ? 1 : 0) }, (_, m) => {
      const rx = m === 0 ? R * 1.15 + 14 : Math.min(room, outer * 1.08);
      return {
        key: -(g * 100 + m + 1),
        orbit: { rx, ry: rx * squash * (0.8 + sr() * 0.5), tilt: tilt + (sr() - 0.5) * 0.6, speed: lap(rx, m ? dir : -dir) * 1.6 },
        phase: sr() * Math.PI * 2,
        size: (phone ? 22 : 28) + sr() * (m ? 10 : 18),
        look: randomMoonLook(sr),
        seed: g * 31 + m,
      };
    });

    const ry = Math.max(...[...orbits, ...moons.map((m) => m.orbit)].map((o) => o.ry));
    const span = Math.max(box, 2 * ry + 90);
    const label = link ? 50 : 0;
    const near = Math.min(1, Math.max(0, (box - 140) / 200));
    // Gentler on phones, where systems sit closer together
    const drift = (200 - near * 320) * (phone ? 0.35 : 1);
    return { key: `system-${g}`, look, seed: g * 7 + 3, link, box, cx, cy: span / 2, height: span + label + (phone ? 110 : 120), drift, orbits, riders, moons };
  });
}

/** An orbit drawn as a faint dotted pencil ellipse; `half` picks the far (back) or near (front) side. */
function OrbitLine({ orbit, cx, cy, half }: { orbit: Orbit; cx: number; cy: number; half: 'back' | 'front' }) {
  const id = `clip-${half}-${Math.round(cx)}-${Math.round(cy)}-${Math.round(orbit.rx)}`;
  const pad = orbit.rx + 4;
  return (
    <svg aria-hidden className="pointer-events-none absolute overflow-visible" style={{ left: cx, top: cy, width: 1, height: 1 }}>
      <g transform={`rotate(${(orbit.tilt * 180) / Math.PI})`}>
        <clipPath id={id}>
          <rect x={-pad} y={half === 'back' ? -pad : 0} width={pad * 2} height={pad} />
        </clipPath>
        <ellipse rx={orbit.rx} ry={orbit.ry} fill="none" stroke="#f0dfd2" strokeOpacity={half === 'back' ? 0.18 : 0.32} strokeWidth={1.4} strokeDasharray="1.5 6" strokeLinecap="round" clipPath={`url(#${id})`} />
      </g>
    </svg>
  );
}

/** The signer's name and note, under a rocket, kept on screen. */
function Note({ entry }: { entry: RocketEntry }) {
  const ref = useRef<HTMLDivElement>(null);
  const [nudge, setNudge] = useState(0);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const { left, right } = ref.current.getBoundingClientRect();
    const pad = 12;
    setNudge(left < pad ? pad - left : right > innerWidth - pad ? innerWidth - pad - right : 0);
  }, []);
  return (
    <motion.div
      ref={ref}
      className={`${hand.className} absolute top-full mt-1 left-1/2 w-max max-w-[min(240px,70vw)] rounded-2xl bg-[#f0dfd2] px-4 py-2.5 text-[#3a1f28] shadow-[0_0_18px_rgba(240,200,190,0.35)] pointer-events-none`}
      style={{ marginLeft: nudge }}
      initial={{ opacity: 0, scale: 0.5, x: '-50%', y: -8, rotate: -6 }}
      animate={{ opacity: 1, scale: 1, x: '-50%', y: 0, rotate: hash01(entry.id * 29) < 0.5 ? -2 : 2 }}
      transition={{ type: 'spring', stiffness: 520, damping: 16 }}
    >
      {entry.message && <p className="text-[17px] leading-snug break-words">{entry.message}</p>}
      <p className={`${entry.message ? 'mt-1 text-[14px] text-[#3a1f28]/60' : 'text-[17px]'} leading-tight`}>
        {entry.username}, launched {ago(entry.createdAt)}
      </p>
    </motion.div>
  );
}

/** Moving parts the animation loop positions directly: the rocket's spot and its turn. */
type Rig = { outer: HTMLDivElement | null; inner: HTMLDivElement | null };

/** Hands an element to the loop as one of the parts of body `id`'s rig. */
const rigRef = (rigs: Map<number, Rig>, id: number, part: keyof Rig) => (el: HTMLDivElement | null) => {
  const rig = rigs.get(id) ?? { outer: null, inner: null };
  rig[part] = el;
  rigs.set(id, rig);
};

/** A little moon going round. */
function MoonBody({ moon, rigs }: { moon: Moon; rigs: Map<number, Rig> }) {
  const paint = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => paintPlanet(ctx, w, h, moon.look, moon.seed), [moon.look, moon.seed]);
  return (
    <div ref={rigRef(rigs, moon.key, 'outer')} aria-hidden className="pointer-events-none absolute left-0 top-0 will-change-transform" style={{ width: moon.size, height: moon.size }}>
      <div ref={rigRef(rigs, moon.key, 'inner')} className="h-full w-full">
        <PaintedCanvas paint={paint} grain={10} className="h-full w-full" />
      </div>
    </div>
  );
}

/** One system: its planet, orbit lines and rockets, drifting with the scroll at a speed set by its size. */
function SystemBlock({ system, rigs, openId, onOpen, index }: { system: System; rigs: Map<number, Rig>; openId: number | null; onOpen: (id: number | null) => void; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const { drift } = system;
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-drift / 2, drift / 2]);
  const paint = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => paintPlanet(ctx, w, h, system.look, system.seed), [system.look, system.seed]);
  const { cx, cy, box, link } = system;

  const planet = (
    <div className="relative" style={{ width: box, height: box }}>
      <PaintedCanvas paint={paint} grain={12} className="absolute inset-0 h-full w-full [filter:drop-shadow(0_0_24px_rgba(240,200,190,0.16))]" />
    </div>
  );

  return (
    <div ref={ref} className="relative" style={{ height: system.height }}>
      <motion.div className="absolute inset-0" style={{ y }}>
        {system.orbits.map((o, k) => <OrbitLine key={`b${k}`} orbit={o} cx={cx} cy={cy} half="back" />)}

        <div className="absolute z-[5] flex flex-col items-center" style={{ left: cx - box / 2, top: cy - box / 2 }}>
          {link ? (
            <Link href={link.href} className="group pointer-events-auto flex flex-col items-center">
              <div className="transition-transform duration-500 group-hover:scale-[1.06] group-hover:-rotate-3">{planet}</div>
            </Link>
          ) : (
            planet
          )}
        </div>
        {link && (
          <Link
            href={link.href}
            className={`${hand.className} absolute z-[9] -translate-x-1/2 whitespace-nowrap text-[24px] md:text-[28px] leading-none text-[#f0dfd2] underline-offset-[6px] decoration-[#f0dfd2]/40 hover:underline`}
            style={{ left: cx, top: cy + Math.max(box / 2, system.orbits[system.orbits.length - 1].ry) + 26 }}
          >
            {link.label}
          </Link>
        )}

        {system.orbits.map((o, k) => <OrbitLine key={`f${k}`} orbit={o} cx={cx} cy={cy} half="front" />)}

        {system.moons.map((moon) => <MoonBody key={moon.key} moon={moon} rigs={rigs} />)}

        {system.riders.map((rider, i) => {
          const id = rider.entry.id;
          const open = openId === id;
          return (
            <div
              key={id}
              ref={rigRef(rigs, id, 'outer')}
              className="absolute left-0 top-0 pointer-events-auto cursor-help will-change-transform"
              style={{ width: rider.size, height: rider.size, zIndex: open ? 60 : undefined }}
              onPointerEnter={(e) => e.pointerType === 'mouse' && onOpen(id)}
              onPointerLeave={(e) => e.pointerType === 'mouse' && onOpen(null)}
              onClick={() => onOpen(open ? null : id)}
            >
              <motion.div
                className="h-full w-full"
                initial={reduce ? false : { scale: 0, opacity: 0 }}
                animate={{ scale: open ? 1.3 : 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 14, delay: open ? 0 : 0.2 + ((index * 3 + i) % 8) * 0.06 }}
              >
                <div
                  ref={rigRef(rigs, id, 'inner')}
                  className="h-full w-full [filter:drop-shadow(0_0_6px_rgba(240,200,190,0.25))]"
                >
                  <RocketCanvas design={rider.design} seed={id * 13} className="h-full w-full" />
                </div>
              </motion.div>
              {open && <Note entry={rider.entry} />}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

/**
 * The guestbook as little solar systems down the page: every signature is a rocket coasting round a
 * planet, passing behind it on the far side and in front on the near side. Hovering (or tapping) a
 * rocket stops its system and shows who sent it and their note. The first two link planets lead to
 * the letters and the planet garden.
 */
export default function RocketField({ rockets, justLaunchedId }: { rockets: RocketEntry[]; justLaunchedId: number | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(1200);
  const [openId, setOpenId] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const systems = useMemo(() => buildSystems(rockets, W), [rockets, W]);
  const rigs = useRef(new Map<number, Rig>()).current;

  // A rocket that just arrived shows its note, so you can find yours
  useEffect(() => {
    if (justLaunchedId !== null) setOpenId(justLaunchedId);
  }, [justLaunchedId]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // One loop moves every rocket and moon round its orbit; a system stands still while one of its rockets is open
  const openRef = useRef(openId);
  openRef.current = openId;
  useEffect(() => {
    const bodies = systems.flatMap((s, si) => [
      ...s.riders.map((r) => ({ id: r.entry.id, orbit: r.orbit, phase: r.phase, size: r.size, turns: true, si, cx: s.cx, cy: s.cy })),
      ...s.moons.map((m) => ({ id: m.key, orbit: m.orbit, phase: m.phase, size: m.size, turns: false, si, cx: s.cx, cy: s.cy })),
    ]);
    const clocks = systems.map(() => 0);
    let last = performance.now();
    let raf = 0;
    const place = () => {
      for (const { id, orbit, phase, size, turns, si, cx, cy } of bodies) {
        const rig = rigs.get(id);
        if (!rig?.outer || !rig.inner) continue;
        const { rx, ry, tilt, speed } = orbit;
        const a = phase + clocks[si] * speed;
        const [c, s] = [Math.cos(a), Math.sin(a)];
        const [ct, st] = [Math.cos(tilt), Math.sin(tilt)];
        const [lx, ly] = [rx * c, ry * s];
        const x = lx * ct - ly * st;
        const y = lx * st + ly * ct;
        // Heading along the orbit (the rocket is drawn nose up)
        const sign = Math.sign(speed);
        const [vx, vy] = [-rx * s * sign, ry * c * sign];
        const heading = Math.atan2(vx * st + vy * ct, vx * ct - vy * st) + Math.PI / 2;
        // The near side (lower half of the ellipse) passes in front of the planet, a little bigger
        const nearness = (s + 1) / 2;
        rig.outer.style.transform = `translate(${cx + x - size / 2}px, ${cy + y - size / 2}px)`;
        if (id !== openRef.current) rig.outer.style.zIndex = s > 0 ? '8' : '3';
        rig.inner.style.transform = `${turns ? `rotate(${heading}rad) ` : ''}scale(${0.8 + 0.25 * nearness})`;
        rig.inner.style.opacity = String(0.7 + 0.3 * nearness);
      }
    };
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const paused = bodies.find((b) => b.id === openRef.current)?.si;
      clocks.forEach((_, i) => i !== paused && (clocks[i] += dt));
      place();
    };
    place();
    if (!reduce) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [systems, rigs, reduce]);

  return (
    <div ref={ref} className="relative">
      {systems.map((system, i) => (
        <SystemBlock key={system.key} system={system} rigs={rigs} openId={openId} onOpen={setOpenId} index={i} />
      ))}
    </div>
  );
}
