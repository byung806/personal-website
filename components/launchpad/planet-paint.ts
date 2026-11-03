/**
 * Pencil planets for /play and /letters: a hatched sphere lit from the upper left, with craters or a
 * ring. Same hand as the launch site in paint.ts.
 */

import { pencilFill, pencilOutline, rng, type Pt } from '@/lib/pencil';
import { INK } from './paint';

export type PlanetLook = {
  /** Base wash, light hatch, shadow hatch. */
  wash: string;
  light: string;
  shade: string;
  craters?: number;
  ring?: string;
};

export const PLANETS = {
  /** The cream moon the letters live on. */
  letters: { wash: '#e9d6c6', light: '#fff6ec', shade: '#9a5868', craters: 7 },
  /** A teal ringed planet for the planet garden. */
  garden: { wash: '#5f9a93', light: '#bfe3d6', shade: '#1f4b5a', ring: '#e8c98f' },
} satisfies Record<string, PlanetLook>;

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
  const R = Math.min(w, h) * (look.ring ? 0.3 : 0.42);
  const lit = (x: number, y: number) => Math.hypot(x - (cx - R * 0.45), y - (cy - R * 0.45)) < R * 1.05;

  // Back half of the ring
  const ring = (front: boolean) => {
    if (!look.ring) return;
    const [from, to] = front ? [0, Math.PI] : [Math.PI, Math.PI * 2];
    for (const k of [1.55, 1.7, 1.85]) {
      const pts = circle(cx, cy, R * k, R * k * 0.28, 20, from, to).map(([x, y]) => [x, y + (x - cx) * -0.18] as Pt);
      pencilOutline(ctx, r, pts, k === 1.7 ? look.ring : `${look.ring}99`, k === 1.7 ? R * 0.07 : R * 0.03);
    }
  };
  ring(false);

  const sphere = circle(cx, cy, R, R);
  pencilFill(ctx, r, sphere, look.wash, [
    { color: look.light, angle: -0.9, density: 9, len: [5, 12], width: 0.9, where: lit },
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
