'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import Galaxy, { type GalaxyFrame } from '@/components/galaxy';
import type { Planet } from './use-planets';

// Module-level so the Galaxy effect doesn't re-initialize WebGL on every render.
const GALAXY_FOCAL: [number, number] = [0.5, 0.5];
const GALAXY_ROTATION: [number, number] = [1.0, 0.0];
const GALAXY_ROTATION_SPEED = 0.1;
const GALAXY_REPULSION = 1;
const PLANET_SIZE = 72;
/** Minimum spacing between planets, in viewport heights (~125px on a 625px-tall hero). */
const MIN_PLANET_GAP = 0.2;

type Point = { x: number; y: number };

/**
 * Nudges planets apart until no two are closer than MIN_PLANET_GAP (best effort when crowded),
 * keeping them inside the same bounds they were placed in. Display-only; stored positions are untouched.
 */
function spreadPlanets(points: Point[], halfW: number, halfH: number): Point[] {
  const pts = points.map((p) => ({ ...p }));
  for (let iter = 0; iter < 60; iter++) {
    let moved = false;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        let dx = pts[j].x - pts[i].x;
        let dy = pts[j].y - pts[i].y;
        let d = Math.hypot(dx, dy);
        if (d >= MIN_PLANET_GAP) continue;
        if (d < 1e-6) { dx = Math.cos(i + j); dy = Math.sin(i + j); d = 1; }
        const push = (MIN_PLANET_GAP - d) / 2;
        pts[i].x -= (dx / d) * push; pts[i].y -= (dy / d) * push;
        pts[j].x += (dx / d) * push; pts[j].y += (dy / d) * push;
        moved = true;
      }
    }
    for (const p of pts) {
      p.x = Math.min(Math.max(p.x, -halfW), halfW);
      p.y = Math.min(Math.max(p.y, -halfH), halfH);
    }
    if (!moved) break;
  }
  return pts;
}

/** Stable pseudo-random 0..1 per planet, so sizes don't reshuffle on reload. */
const hash01 = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
};

/**
 * Where a planet should appear on screen this frame, following the Galaxy shader's motion.
 * Coordinates are the shader's uv: centered, y up, in units of viewport height.
 * - Rotation: the shader samples at R(t) * p, so a planet fixed at galaxy point g shows at R(t)^-1 g.
 * - Cursor: the shader warps space by k / (r + 0.1) toward the cursor. Planets get the same pull,
 *   applied as a smooth, monotonic map so they slide in without jumping, and spiral, shrink and
 *   fade as they fall in, like a small black hole.
 */
function planetScreenPos(gx: number, gy: number, f: GalaxyFrame) {
  const a = f.time * GALAXY_ROTATION_SPEED;
  const c = Math.cos(a);
  const sn = Math.sin(a);
  // GLSL mat2(c, -s, s, c) is column-major, so its inverse (transpose) maps back to screen space.
  const qx = c * gx - sn * gy;
  const qy = sn * gx + c * gy;

  const mx = (f.mouse.x - 0.5) * (f.width / f.height);
  const my = f.mouse.y - 0.5;

  const dx = qx - mx;
  const dy = qy - my;
  const r0 = Math.hypot(dx, dy) || 1e-6;
  const k = GALAXY_REPULSION * 0.05 * f.mouseActive;
  const r = Math.max(r0 - k / (r0 + 0.1), 0);

  // Swirl around the cursor in proportion to how far the planet has fallen in.
  const swirl = 2.5 * (1 - r / r0);
  const ux = dx / r0;
  const uy = dy / r0;
  const cs = Math.cos(swirl);
  const ss = Math.sin(swirl);
  const px = mx + (ux * cs - uy * ss) * r;
  const py = my + (ux * ss + uy * cs) * r;

  // Shrink/fade only as strongly as the pull is active, so a planet passing the resting
  // cursor position (the center, before any mouse movement) isn't swallowed.
  const active = f.mouseActive;
  return {
    x: px * f.height + f.width / 2,
    y: f.height / 2 - py * f.height,
    scale: 1 - active * (0.85 - 0.85 * smoothstep(0, 0.14, r)),
    opacity: 1 - active * (1 - smoothstep(0.005, 0.07, r)),
  };
}

/**
 * Full-bleed galaxy hero; drawn planets orbit in it and fall into the cursor. `children` overlays the bottom-left (e.g. a title).
 */
export default function PlanetSky({ planets, children }: { planets: Planet[]; children?: ReactNode }) {
  const planetElsRef = useRef<Array<HTMLDivElement | null>>([]);

  // Stored x/y (10–90%) become fixed points in the galaxy, spread across the hero and spaced apart.
  // The spacing pass depends on the hero's aspect ratio, so it's cached and redone on resize.
  const layoutRef = useRef<{ aspect: number; points: Point[] } | null>(null);
  useEffect(() => { layoutRef.current = null; }, [planets]);

  const movePlanets = useCallback((f: GalaxyFrame) => {
    const aspect = f.width / f.height;
    if (!layoutRef.current || Math.abs(layoutRef.current.aspect - aspect) > 0.02) {
      const raw = planets.map((p) => ({ x: (p.x / 100 - 0.5) * aspect, y: 0.5 - p.y / 100 }));
      layoutRef.current = { aspect, points: spreadPlanets(raw, 0.4 * aspect, 0.4) };
    }
    const points = layoutRef.current.points;
    // Full size from ~1200px wide, down to 55% on phones.
    const fit = Math.min(1, Math.max(0.55, f.width / 1200));
    planets.forEach((planet, i) => {
      const el = planetElsRef.current[i];
      if (!el || !points[i]) return;
      const { x, y, scale, opacity } = planetScreenPos(points[i].x, points[i].y, f);
      // Each planet has its own size and a slow pulse, like the stars in the field.
      const size = (0.65 + 0.7 * hash01(planet.id)) * (1 + 0.07 * Math.sin(f.time * 0.9 + hash01(planet.id * 7) * 6.28));
      el.style.transform = `translate(${x - PLANET_SIZE / 2}px, ${y - PLANET_SIZE / 2}px) scale(${size * scale * fit})`;
      el.style.opacity = String(opacity);
    });
  }, [planets]);

  return (
    <section className="relative h-[85vh] min-h-[520px] bg-black overflow-hidden rounded-b-[3.3rem] shadow-[0_8px_12px_-4px_rgba(0,0,0,0.7)]">
      {/* Galaxy sits above the title so stars and planets drift over it (canvas is transparent) */}
      <div className="absolute inset-0 z-10">
        <Galaxy
          focal={GALAXY_FOCAL}
          rotation={GALAXY_ROTATION}
          starSpeed={0.6}
          density={0.6}
          hueShift={230}
          speed={1.9}
          glowIntensity={0.3}
          saturation={0.35}
          mouseRepulsion
          twinkleIntensity={0.45}
          rotationSpeed={GALAXY_ROTATION_SPEED}
          repulsionStrength={GALAXY_REPULSION}
          transparent
          onFrame={movePlanets}
        />
        {/* Drawn planets live in the galaxy: they orbit with it and fall into the cursor.
            will-change gives each its own layer so the glow blur is rasterized once, not every frame. */}
        {planets.map((planet, i) => (
          <div
            key={planet.id}
            ref={(el) => { planetElsRef.current[i] = el; }}
            className="absolute left-0 top-0 opacity-0 pointer-events-none will-change-[transform,opacity]"
            style={{ width: PLANET_SIZE, height: PLANET_SIZE }}
          >
            {/* Glow: a blurred copy of the drawing so it glows in its own colors */}
            {/* eslint-disable-next-line @next/next/no-img-element -- data URLs, nothing for next/image to optimize */}
            <img
              src={planet.drawingData}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full scale-150 opacity-90 [filter:blur(16px)_brightness(1.25)_saturate(1.8)]"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={planet.drawingData}
              alt="planet"
              className="relative w-full h-full [filter:drop-shadow(0_0_4px_rgba(255,255,255,0.35))]"
            />
          </div>
        ))}
      </div>

      <div className="relative z-0 h-full flex flex-col justify-end px-6 md:px-16 pb-16 md:pb-20 pointer-events-none">
        {children}
      </div>
    </section>
  );
}
