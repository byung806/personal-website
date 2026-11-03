/**
 * Pencil planets for /play and /letters: a hatched sphere lit from the upper left, dressed as one of a
 * few kinds (cratered rock, banded gas giant, ice world, lava world, ocean world), sometimes ringed.
 * Same hand as the launch site in paint.ts.
 */

import { pencilFill, pencilLine, pencilOutline, rng, tracePath, type Pt } from '@/lib/pencil';
import { INK } from './paint';

export type PlanetLook = {
  /** Base wash, light hatch, shadow hatch. */
  wash: string;
  light: string;
  shade: string;
  craters?: number;
  ring?: string;
  /** How far the ring leans (its slope across the planet) and how open it is (ellipse height / width). */
  ringTilt?: number;
  ringOpen?: number;
  /** Gas giant: colors of the cloud bands, top to bottom (repeated), and a storm spot. */
  bands?: string[];
  spot?: string;
  /** Ice caps at the poles. */
  caps?: string;
  /** Glowing cracks across a dark crust. */
  cracks?: string;
  /** Continents on an ocean world. */
  land?: string;
};

export const PLANETS = {
  /** The cream moon the letters live on. */
  letters: { wash: '#e9d6c6', light: '#fff6ec', shade: '#9a5868', craters: 7 },
  /** A teal ringed planet for the planet garden. */
  garden: { wash: '#5f9a93', light: '#bfe3d6', shade: '#1f4b5a', ring: '#e8c98f', bands: ['#7fb8ae', '#4f8a84', '#a9d6cb', '#5f9a93'] },
} satisfies Record<string, PlanetLook>;

const pick = <T,>(rand: () => number, xs: T[]) => xs[Math.floor(rand() * xs.length)];
const RINGS = ['#e8c98f', '#f0dfd2', '#b9a3d6', '#9fd3c0', '#d9939c'];

/** The kinds of planet in the sky, each a function of `rand` to a look. */
export const PLANET_KINDS: ((rand: () => number) => PlanetLook)[] = [
  // Cratered rock
  (rand) => {
    const [wash, light, shade] = pick(rand, [
      ['#c98f9b', '#f3d3d8', '#6f3446'],
      ['#b7a99a', '#ece3d8', '#5a4a44'],
      ['#d97f6a', '#f6c9b8', '#7a2f2a'],
    ]);
    return { wash, light, shade, craters: 5 + Math.floor(rand() * 6) };
  },
  // Banded gas giant, often ringed
  (rand) => {
    const [wash, light, shade, bands, spot] = pick(rand, [
      ['#d9a25f', '#f7dcae', '#7a4a22', ['#e8c98f', '#b9743f', '#f2dfc0', '#c98a4f'], '#b84a3a'],
      ['#9c8cc9', '#ddd3f3', '#4a3c7a', ['#b9a3d6', '#7c6bb0', '#d8cdef', '#8f7fc2'], '#d9939c'],
      ['#d9939c', '#f6d3d8', '#6f3446', ['#e8b0b8', '#b56a78', '#f3d6c8', '#c98f9b'], '#f0dfd2'],
    ] as [string, string, string, string[], string][]);
    return { wash, light, shade, bands, spot: rand() < 0.6 ? spot : undefined, ring: rand() < 0.5 ? pick(rand, RINGS) : undefined };
  },
  // Ice world
  (rand) => ({ wash: '#a9c8e6', light: '#f2f8ff', shade: '#3c5a86', caps: '#f7fbff', craters: Math.floor(rand() * 3), ring: rand() < 0.3 ? '#f0dfd2' : undefined }),
  // Lava world
  () => ({ wash: '#3a2330', light: '#7a4a5a', shade: '#160b14', cracks: '#f2876b' }),
  // Ocean world
  (rand) => ({ wash: '#3f6fa8', light: '#a9cdf0', shade: '#1a2f5a', land: pick(rand, ['#7fae7a', '#c9b27a', '#9fd3c0']), caps: rand() < 0.5 ? '#f2f8ff' : undefined }),
];

/** A planet of the `kind`th kind from `rand`, with its ring (if any) leaning its own way. */
export function randomPlanetLook(rand: () => number, kind = Math.floor(rand() * PLANET_KINDS.length)): PlanetLook {
  const look = PLANET_KINDS[kind % PLANET_KINDS.length](rand);
  return { ...look, ringTilt: (rand() - 0.5) * 0.7, ringOpen: 0.2 + rand() * 0.2 };
}

/** A plain little moon. */
export function randomMoonLook(rand: () => number): PlanetLook {
  const [wash, light, shade] = pick(rand, [
    ['#cfc6bd', '#f6f0ea', '#5f5560'],
    ['#b9a3d6', '#e9def7', '#4a3c7a'],
    ['#e8c98f', '#fbeccc', '#7a5a2a'],
    ['#9fb3d8', '#e3ecfa', '#34477a'],
  ]);
  return { wash, light, shade, craters: 2 + Math.floor(rand() * 3) };
}

/** The sphere's radius as a fraction of the box `paintPlanet` fills (smaller when it has a ring). */
export const planetRadius = (look: PlanetLook, box: number) => box * (look.ring ? 0.3 : 0.42);

const circle = (cx: number, cy: number, rx: number, ry: number, n = 28, from = 0, to = Math.PI * 2) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / n;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as Pt;
  });

/** A planet filling a w×h box (the sphere is centered, with room for a ring). */
export function paintPlanet(ctx: CanvasRenderingContext2D, w: number, h: number, look: PlanetLook, seed = 1) {
  const r = rng(seed);
  const cx = w / 2;
  const cy = h / 2;
  const R = planetRadius(look, Math.min(w, h));
  const lit = (x: number, y: number) => Math.hypot(x - (cx - R * 0.45), y - (cy - R * 0.45)) < R * 1.05;
  const lean = look.ringTilt ?? -0.18;
  const open = look.ringOpen ?? 0.28;

  // Back half of the ring
  const ring = (front: boolean) => {
    if (!look.ring) return;
    const [from, to] = front ? [0, Math.PI] : [Math.PI, Math.PI * 2];
    for (const k of [1.55, 1.7, 1.85]) {
      const pts = circle(cx, cy, R * k, R * k * open, 20, from, to).map(([x, y]) => [x, y + (x - cx) * lean] as Pt);
      pencilOutline(ctx, r, pts, k === 1.7 ? look.ring : `${look.ring}99`, k === 1.7 ? R * 0.07 : R * 0.03);
    }
  };
  ring(false);

  const sphere = circle(cx, cy, R, R);
  pencilFill(ctx, r, sphere, look.wash, [], 1.5);

  // Surface features, kept inside the sphere
  ctx.save();
  tracePath(ctx, r, sphere, true, 0);
  ctx.clip();
  if (look.bands) {
    // Cloud bands: wavy strips across, bowed a little like lines of latitude
    const n = 6 + Math.floor(r() * 4);
    for (let i = 0; i < n; i++) {
      const y0 = cy - R + (i * 2 * R) / n;
      const y1 = y0 + (2 * R) / n;
      const wave = (x: number, y: number) => y + Math.sin((x / R) * 3 + i) * R * 0.03 + ((x - cx) / R) ** 2 * R * 0.06;
      const top: Pt[] = Array.from({ length: 9 }, (_, k) => {
        const x = cx - R - 4 + (k * (2 * R + 8)) / 8;
        return [x, wave(x, y0)];
      });
      const bottom = top.map(([x]) => [x, wave(x, y1)] as Pt).reverse();
      const color = look.bands[i % look.bands.length];
      pencilFill(ctx, r, [...top, ...bottom], `${color}cc`, [{ color, angle: 0.06, density: 10, len: [8, 18], width: 0.9 }], 0.8);
    }
    if (look.spot) {
      const spot = circle(cx + (r() - 0.3) * R * 0.6, cy + r() * 0.5 * R, R * 0.2, R * 0.11, 14);
      pencilFill(ctx, r, spot, `${look.spot}dd`, [{ color: look.spot, angle: 0.1, density: 30, len: [3, 7], width: 0.8 }], 0.6);
      pencilOutline(ctx, r, spot, `${look.light}aa`, 0.9, true);
    }
  }
  if (look.land) {
    // Continents: a few lumpy blobs
    for (let i = 0; i < 4; i++) {
      const bx = cx + (r() - 0.5) * R * 1.4;
      const by = cy + (r() - 0.5) * R * 1.2;
      const s = R * (0.18 + r() * 0.22);
      const blob = Array.from({ length: 9 }, (_, k) => {
        const a = (k / 9) * Math.PI * 2;
        const d = s * (0.6 + r() * 0.5);
        return [bx + Math.cos(a) * d, by + Math.sin(a) * d * 0.8] as Pt;
      });
      pencilFill(ctx, r, blob, `${look.land}dd`, [{ color: look.land, angle: -1, density: 22, len: [3, 8], width: 0.8 }], 1.5);
    }
  }
  if (look.caps) {
    for (const dir of [-1, 1]) {
      const cap = circle(cx, cy + dir * R * 0.94, R * 0.62, R * 0.26, 16);
      pencilFill(ctx, r, cap, `${look.caps}ee`, [{ color: '#ffffff', angle: -0.3, density: 20, len: [3, 8], width: 0.7 }], 1.2);
    }
  }
  if (look.cracks) {
    // Glowing fissures wandering across a dark crust
    ctx.shadowColor = look.cracks;
    ctx.shadowBlur = R * 0.08;
    for (let i = 0; i < 7; i++) {
      let x = cx + (r() - 0.5) * R * 1.6;
      let y = cy + (r() - 0.5) * R * 1.6;
      let a = r() * Math.PI * 2;
      for (let k = 0; k < 5; k++) {
        const len = R * (0.12 + r() * 0.18);
        a += (r() - 0.5) * 1.2;
        const [nx, ny] = [x + Math.cos(a) * len, y + Math.sin(a) * len];
        pencilLine(ctx, r, x, y, nx, ny, look.cracks, Math.max(1, R * 0.018), 1);
        [x, y] = [nx, ny];
      }
    }
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  // Light and shadow over everything
  pencilFill(ctx, r, sphere, 'rgba(0,0,0,0)', [
    { color: look.light, angle: -0.9, density: look.bands ? 4 : 9, len: [5, 12], width: 0.9, where: lit },
    { color: look.shade, angle: -2.2, density: 8, len: [5, 12], width: 0.9, where: (x, y) => !lit(x, y) },
    { color: INK.maroon, angle: -2.3, density: 3, len: [4, 10], width: 0.8, where: (x, y) => Math.hypot(x - (cx - R * 0.6), y - (cy - R * 0.6)) > R * 1.55 },
  ], 1.5);

  for (let i = 0; i < (look.craters ?? 0); i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * R * 0.72;
    const x = cx + Math.cos(a) * d;
    const y = cy + Math.sin(a) * d;
    const s = R * (0.05 + r() * 0.08);
    const squash = Math.sqrt(1 - (d / R) ** 2) * 0.5 + 0.5; // foreshortened toward the rim
    const crater = circle(x, y, s, s * squash, 12);
    pencilFill(ctx, r, crater, `${look.shade}55`, [{ color: look.shade, angle: -2.2, density: 25, len: [2, 5], width: 0.7 }], 0.8);
    pencilOutline(ctx, r, circle(x, y + s * 0.15, s, s * squash, 10, 0.2, Math.PI - 0.2), `${look.light}cc`, 0.9);
  }

  pencilOutline(ctx, r, sphere.slice(0, -1), 'rgba(240,223,210,0.55)', 1.2, true);
  ring(true);
}
