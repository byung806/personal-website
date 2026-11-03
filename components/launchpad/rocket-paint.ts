/**
 * A built rocket (see lib/rocket.ts) in pencil: fins behind, body, nose, window, flame, each part
 * swappable. Same hand as the ships in paint.ts.
 */

import { pencilFill, pencilLine, pencilOutline, rng, tracePath, type Pt } from '@/lib/pencil';
import { PAINTS, TRIMS, type RocketDesign } from '@/lib/rocket';
import { INK } from './paint';

const CX = 36;
const BASE_Y = 51;

/** Body outlines: where the nose sits (`top`), half-widths at the top, the widest point (`mid`) and the base. */
const BODY = [
  { top: 18, topHalf: 8.5, half: 10.5, mid: 32, base: 9.5 }, // classic
  { top: 22, topHalf: 11, half: 14.5, mid: 36, base: 12 }, // chubby
  { top: 15, topHalf: 6, half: 7.5, mid: 32, base: 7 }, // slim
  { top: 17, topHalf: 10, half: 10, mid: 34, base: 10 }, // bullet
];

/** `hex` blended toward white by `k` (0..1). */
function lighten(hex: string, k: number) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const m = (v: number) => Math.round(v + (255 - v) * k);
  return `rgb(${m(r)},${m(g)},${m(b)})`;
}

const mirror = (pts: Pt[]) => pts.map(([x, y]) => [CX * 2 - x, y] as Pt);

function nosePoints(kind: number, b: (typeof BODY)[number]): Pt[] {
  const { top, topHalf: t } = b;
  const L = CX - t - 0.5;
  const R = CX + t + 0.5;
  if (kind === 1) {
    // Dome
    const h = Math.min(t, top - 3);
    return Array.from({ length: 9 }, (_, i) => {
      const a = Math.PI + (i / 8) * Math.PI;
      return [CX + Math.cos(a) * (t + 0.5), top + 1 + Math.sin(a) * h] as Pt;
    });
  }
  if (kind === 2) {
    // Needle: a long concave spike
    const h = Math.min(20, top - 1);
    return [[L, top + 1], [CX - t * 0.35, top - h * 0.3], [CX - 0.8, top - h * 0.85], [CX, top - h], [CX + 0.8, top - h * 0.85], [CX + t * 0.35, top - h * 0.3], [R, top + 1]];
  }
  if (kind === 3) {
    // Capsule: a flat-topped cap (the antenna is drawn separately)
    return [[L, top + 1], [CX - t * 0.55, top - 6], [CX + t * 0.55, top - 6], [R, top + 1]];
  }
  // Cone
  const h = Math.min(14, top - 3);
  return [[L, top + 1], [CX - t * 0.55, top - h * 0.5], [CX, top - h], [CX + t * 0.55, top - h * 0.5], [R, top + 1]];
}

/** The left fin(s) for each fin kind; the right side is mirrored. */
function finPoints(kind: number, b: (typeof BODY)[number]): Pt[] {
  const ex = CX - b.base;
  if (kind === 1) return [[ex + 1, 33], [ex - 7, 42], [ex - 11, 58], [ex + 1, 50]]; // swept
  if (kind === 2) return [[ex + 1, 36], [ex - 7, 40], [ex - 10, 48], [ex - 8, 54], [ex + 1, 51]]; // round
  if (kind === 3) return [[ex + 1, 42], [ex - 8, 55], [ex + 1, 51]]; // trio (plus a center fin)
  return [[ex + 1, 37], [ex - 12, 54], [ex + 1, 51]]; // triangle
}

function porthole(ctx: CanvasRenderingContext2D, r: () => number, x: number, y: number, rad: number, u: number) {
  ctx.beginPath();
  ctx.arc(x * u, y * u, rad * u, 0, Math.PI * 2);
  ctx.fillStyle = '#0c0921';
  ctx.fill();
  const ring = Array.from({ length: 9 }, (_, i) => [x * u + Math.cos(i * 0.8) * (rad + 0.5) * u, y * u + Math.sin(i * 0.8) * (rad + 0.5) * u] as Pt);
  pencilOutline(ctx, r, ring, INK.cream, Math.max(1, rad * 0.32) * u, true);
}

/** A rocket drawn into a square of side `size`, pointing up. `seed` varies the hand. */
export function paintRocket(ctx: CanvasRenderingContext2D, size: number, d: RocketDesign, seed: number, flame = true) {
  const r = rng(seed);
  const u = size / 72;
  const P = (pts: Pt[]) => pts.map(([x, y]) => [x * u, y * u] as Pt);
  const b = BODY[d.body];
  const paint = PAINTS[d.paint];
  const trim = TRIMS[d.trim];
  const trimWash = `${trim}f2`;
  const trimSets = [{ color: lighten(trim, 0.45), angle: -1.2, density: 30, len: [3, 7] as [number, number], width: 0.6 }];

  if (flame) {
    const w = Math.max(5, b.base * 0.7);
    pencilFill(ctx, r, P([[CX - w, BASE_Y - 1], [CX, 69], [CX + w, BASE_Y - 1]]), 'rgba(242,135,107,0.85)', [{ color: INK.flameCore, angle: -1.57, density: 30, len: [3, 7], width: 0.7 }], 0.6);
  }

  // Fins sit behind the body
  const fin = finPoints(d.fins, b);
  for (const f of [fin, mirror(fin)]) pencilFill(ctx, r, P(f), trimWash, trimSets, 0.6);

  const body: Pt[] = P([
    [CX - b.topHalf, b.top], [CX - b.half, b.mid], [CX - b.base, BASE_Y],
    [CX + b.base, BASE_Y], [CX + b.half, b.mid], [CX + b.topHalf, b.top],
  ]);
  pencilFill(ctx, r, body, paint, [
    { color: '#fff', angle: -1.3, density: 14, len: [4, 9], width: 0.7 },
    { color: INK.roseMid, angle: -1.9, density: 10, len: [4, 9], width: 0.7, where: (x) => x > (CX + b.half * 0.35) * u },
  ], 0.7);

  // Stripe window: a trim band round the body (clipped to it) under a small porthole
  if (d.window === 2) {
    ctx.save();
    tracePath(ctx, rng(seed), body, true, 0);
    ctx.clip();
    const y0 = b.mid + 3;
    pencilFill(ctx, r, P([[CX - b.half - 3, y0], [CX + b.half + 3, y0 + 1], [CX + b.half + 3, y0 + 5], [CX - b.half - 3, y0 + 4]]), trimWash, trimSets, 0.4);
    ctx.restore();
  }

  pencilOutline(ctx, r, body, 'rgba(78,34,49,0.8)', 1.1 * u, true);

  if (d.fins === 3) {
    const center = P([[CX - 1.8, 44], [CX + 1.8, 44], [CX + 1.4, 58], [CX - 1.4, 58]]);
    pencilFill(ctx, r, center, trimWash, trimSets, 0.4);
  }

  const nose = P(nosePoints(d.nose, b));
  pencilFill(ctx, r, nose, trimWash, trimSets, 0.6);
  pencilOutline(ctx, r, nose, 'rgba(78,34,49,0.6)', 0.9 * u, true);
  if (d.nose === 3) {
    pencilLine(ctx, r, CX * u, (b.top - 6) * u, CX * u, (b.top - 12) * u, INK.cream, 0.9 * u, 1);
    ctx.beginPath();
    ctx.arc(CX * u, (b.top - 12.5) * u, 1.6 * u, 0, Math.PI * 2);
    ctx.fillStyle = INK.flameCore;
    ctx.fill();
  }

  const wy = b.mid - 2;
  const rad = Math.min(5, b.half * 0.55);
  if (d.window === 0) porthole(ctx, r, CX, wy, rad, u);
  else if (d.window === 1) {
    porthole(ctx, r, CX, wy - rad * 0.75, rad * 0.62, u);
    porthole(ctx, r, CX, wy + rad * 0.75, rad * 0.62, u);
  } else if (d.window === 2) porthole(ctx, r, CX, wy - 2, rad * 0.7, u);
  else {
    // Star
    const star = Array.from({ length: 10 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const k = (i % 2 ? 0.45 : 1) * (rad + 1);
      return [(CX + Math.cos(a) * k) * u, (wy + Math.sin(a) * k) * u] as Pt;
    });
    ctx.beginPath();
    star.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fillStyle = '#0c0921';
    ctx.fill();
    ctx.strokeStyle = INK.flameCore;
    ctx.lineWidth = 1.1 * u;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
}
