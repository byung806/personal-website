'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Patrick_Hand } from 'next/font/google';
import PaintedCanvas from './painted-canvas';
import { paintRocket } from './rocket-paint';
import { PLANETS, paintPlanet, planetRadius, randomPlanetLook, type PlanetLook } from './planet-paint';
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
};

/** Planets that lead somewhere, by system number. */
const LINKS: Record<number, { href: string; label: string; look: PlanetLook }> = {
  0: { href: '/letters', label: 'read my letters', look: PLANETS.letters },
  2: { href: '/p/planet-garden', label: 'draw a planet', look: PLANETS.garden },
};

/**
 * Splits the rockets (newest first) into little solar systems down the page: a planet each, alternating
 * sides, with one or two tilted orbits its rockets coast round. Laid out for a field `W` px wide.
 */
function buildSystems(rockets: RocketEntry[], W: number): System[] {
  const phone = W < 640;
  const r = rng(99);
  const groups: RocketEntry[][] = [];
  for (let i = 0; i < rockets.length; ) {
    const n = 7 + Math.floor(r() * 5);
    groups.push(rockets.slice(i, i + n));
    i += n;
  }
  while (groups.length < 3) groups.push([]);

  return groups.map((group, g) => {
    const sr = rng(g * 977 + 3);
    const link = LINKS[g];
    const look = link?.look ?? randomPlanetLook(sr);
    const box = phone ? 140 + sr() * 60 : 180 + sr() * 120;
    const R = planetRadius(look, box);
    const side = phone ? 0.5 : (g % 2 ? 0.64 : 0.36) + (sr() - 0.5) * 0.1;
    const cx = side * W;
    const room = Math.min(cx, W - cx) - 30;
    const squash = 0.3 + sr() * 0.14;
    const tilt = (sr() - 0.5) * 0.5;
    const dir = g % 2 ? 1 : -1;
    const outer = Math.min(room, (R * 1.6 + 26) * 1.5);
    const radii = group.length > 6 ? [Math.min(R * 1.6 + 26, outer * 0.7), outer] : [Math.min(R * 1.8 + 30, room)];
    const orbits: Orbit[] = radii.map((rx, k) => ({
      rx,
      ry: rx * squash,
      tilt: tilt + k * (sr() - 0.5) * 0.25,
      // Outer orbits are slower; a lap takes about a minute or two
      speed: (dir * Math.PI * 2) / (45 + rx * 0.15),
    }));
    const inner = orbits.length > 1 ? Math.ceil(group.length * 0.4) : group.length;
    const riders = group.map((entry, i) => {
      const k = i < inner ? 0 : 1;
      const [m, j] = k ? [group.length - inner, i - inner] : [inner, i];
      return {
        entry,
        orbit: orbits[k],
        phase: (Math.PI * 2 * j) / m + (sr() - 0.5) * 0.3,
        size: phone ? 34 + sr() * 10 : 54 + sr() * 16,
        design: decodeRocket(entry.rocket) ?? randomRocket(sr),
      };
    });
    const ry = orbits[orbits.length - 1].ry;
    const span = Math.max(box, 2 * ry + 80);
    const label = link ? 50 : 0;
    const near = Math.min(1, Math.max(0, (box - 140) / 160));
    // Gentler on phones, where systems sit closer together
    const drift = (200 - near * 320) * (phone ? 0.35 : 1);
    return { key: `system-${g}`, look, seed: g * 7 + 3, link, box, cx, cy: span / 2, height: span + label + (phone ? 90 : 70), drift, orbits, riders };
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

        {system.riders.map((rider, i) => {
          const id = rider.entry.id;
          const open = openId === id;
          return (
            <div
              key={id}
              ref={(el) => {
                const rig = rigs.get(id) ?? { outer: null, inner: null };
                rig.outer = el;
                rigs.set(id, rig);
              }}
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
                  ref={(el) => {
                    const rig = rigs.get(id) ?? { outer: null, inner: null };
                    rig.inner = el;
                    rigs.set(id, rig);
                  }}
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

  // One loop moves every rocket round its orbit; a system stands still while one of its rockets is open
  const openRef = useRef(openId);
  openRef.current = openId;
  useEffect(() => {
    const riders = systems.flatMap((s, si) => s.riders.map((rider) => ({ rider, si, cx: s.cx, cy: s.cy })));
    const clocks = systems.map(() => 0);
    let last = performance.now();
    let raf = 0;
    const place = () => {
      for (const { rider, si, cx, cy } of riders) {
        const rig = rigs.get(rider.entry.id);
        if (!rig?.outer || !rig.inner) continue;
        const { rx, ry, tilt, speed } = rider.orbit;
        const a = rider.phase + clocks[si] * speed;
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
        rig.outer.style.transform = `translate(${cx + x - rider.size / 2}px, ${cy + y - rider.size / 2}px)`;
        if (rider.entry.id !== openRef.current) rig.outer.style.zIndex = s > 0 ? '8' : '3';
        rig.inner.style.transform = `rotate(${heading}rad) scale(${0.8 + 0.25 * nearness})`;
        rig.inner.style.opacity = String(0.7 + 0.3 * nearness);
      }
    };
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const paused = riders.find((r) => r.rider.entry.id === openRef.current)?.si;
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
