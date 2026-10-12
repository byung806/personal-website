/**
 * The launch site drawn with the pencil kit in lib/pencil.ts, after tinycamp.site's hand-painted
 * night scene: rose-and-cream mountain, pines, tower and ships on rolling teal meadows.
 */

import { pencilFill, pencilLine, pencilMeadow, pencilOutline, rng, rollingCrest, type Crest, type Pt } from '@/lib/pencil';

export const INK = {
  ground: '#0a2133',
  groundDeep: '#071a2a',
  rose: '#6f3446',
  roseMid: '#9a5868',
  roseLight: '#c98f9b',
  maroon: '#4e2231',
  cream: '#f0dfd2',
  flame: '#f2876b',
  flameCore: '#ffd9a6',
};

/** A mountain with sweeping concave slopes and a notched, snowy peak. `cx` is its center on the horizon. */
function paintMountain(ctx: CanvasRenderingContext2D, cx: number, horizon: number, s: number) {
  const r = rng(11);
  const W = 260 * s;
  const H = 140 * s;
  const peak: Pt = [cx - W * 0.06, horizon - H];
  const pts: Pt[] = [
    [cx - W / 2, horizon + 2], [cx - W * 0.3, horizon - H * 0.12], [cx - W * 0.17, horizon - H * 0.42],
    [cx - W * 0.09, horizon - H * 0.82], peak, [cx - W * 0.01, horizon - H * 0.9], [cx + W * 0.03, horizon - H * 0.95],
    [cx + W * 0.11, horizon - H * 0.6], [cx + W * 0.24, horizon - H * 0.24], [cx + W / 2, horizon + 2],
  ];
  const lit = (x: number) => x < peak[0] + (horizon - peak[1]) * 0.05;
  pencilFill(ctx, r, pts, 'rgba(111,52,70,0.75)', [
    { color: INK.roseLight, angle: -1.05, density: 7, len: [6, 14], where: (x) => lit(x) },
    { color: INK.cream, angle: -1.1, density: 1.6, len: [5, 11], where: (x) => lit(x) },
    { color: INK.roseMid, angle: -2.0, density: 6, len: [6, 14], where: (x) => !lit(x) },
    { color: INK.maroon, angle: -2.1, density: 3, len: [5, 12] },
  ]);
  // Snow
  pencilFill(ctx, r, [
    [peak[0] - W * 0.045, peak[1] + H * 0.12], peak, [cx - W * 0.01, horizon - H * 0.9],
    [cx + W * 0.03, horizon - H * 0.95], [cx + W * 0.05, horizon - H * 0.82], [cx + W * 0.0, horizon - H * 0.8], [cx - W * 0.04, horizon - H * 0.86],
  ], 'rgba(240,223,210,0.55)', [{ color: '#fff', angle: -1.2, density: 10, len: [3, 7], width: 0.7 }], 0.8);
  // Cream rim light down both ridges
  pencilOutline(ctx, r, pts.slice(1, 5), 'rgba(240,223,210,0.55)', 0.9);
  pencilOutline(ctx, r, pts.slice(6, 9), 'rgba(240,223,210,0.35)', 0.8);
}

/** A cluster of narrow pines, pencilled in vertical strokes. */
function paintTrees(ctx: CanvasRenderingContext2D, cx: number, groundAt: Crest, s: number) {
  const r = rng(21);
  const trees = Array.from({ length: 13 }, (_, i) => ({
    x: cx + (i - 6) * 8.5 * s + (r() - 0.5) * 6 * s,
    hgt: (40 + r() * 38) * s,
    wid: (10 + r() * 6) * s,
    base: 0,
  })).map((t) => ({ ...t, base: groundAt(t.x) + (3 + r() * 10) * s })).sort((a, b) => a.base - b.base); // farther (higher) trees first
  for (const t of trees) {
    const light = r() < 0.45;
    const pts: Pt[] = [
      [t.x - t.wid / 2, t.base], [t.x - t.wid * 0.3, t.base - t.hgt * 0.45], [t.x - t.wid * 0.05, t.base - t.hgt * 0.95],
      [t.x + t.wid * 0.02, t.base - t.hgt], [t.x + t.wid * 0.3, t.base - t.hgt * 0.45], [t.x + t.wid / 2, t.base],
    ];
    pencilFill(ctx, r, pts, light ? 'rgba(201,143,155,0.55)' : 'rgba(111,52,70,0.8)', [
      { color: light ? INK.cream : INK.roseLight, angle: -1.5, density: 14, len: [5, 12], width: 0.8 },
      { color: INK.maroon, angle: -1.6, density: 5, len: [4, 10], width: 0.8, where: (x) => x > t.x },
    ], 0.8);
  }
}

/**
 * Launch site ground (the sky stays transparent so the night sky shows): a far ridge with the
 * mountain behind it, a nearer band of rolling knolls with the pines, and a dark foreground swell.
 * Every crest stays above 75% of the height, where the launch tower stands (see launchpad.tsx).
 */
/** `below` px of extra ground run under the scene (the footer sits there); the scene is laid out in the rest. */
export function paintLaunchSite(ctx: CanvasRenderingContext2D, w: number, fullH: number, below = 0) {
  const h = fullH - below;
  const s = Math.min(1.2, Math.max(0.6, w / 1440));
  const far = rollingCrest(5, h * 0.685, h * 0.02, w);
  const near = rollingCrest(9, h * 0.712, h * 0.017, w); // waves sum to ±1.83×amp, so it stays above 0.75h
  const front = rollingCrest(13, h * 0.875, h * 0.03, w);

  // The mountain stands behind the far ridge: seat it at the ridge's lowest point under it, then let
  // the ridge roll over its feet
  const mx = w * 0.24;
  const half = 130 * s;
  paintMountain(ctx, mx, Math.max(...Array.from({ length: 11 }, (_, i) => far(mx - half + (i * half) / 5))) + 3, s);
  pencilMeadow(ctx, w, h, far, { top: '#123349', bottom: '#0b2234', grass: 0.7, edge: 0.5, seed: 3 });
  pencilMeadow(ctx, w, h, near, { top: INK.ground, bottom: INK.groundDeep, grass: 0.9, edge: 0.3, seed: 4 });
  paintTrees(ctx, w * 0.42, near, s);
  pencilMeadow(ctx, w, fullH, front, { top: '#08192a', bottom: '#051220', grass: 1.25, edge: 0.15, seed: 6 });
}

/** Launch tower and pad in a 150×230 box: pencilled lattice, shaded slab. */
export function paintTower(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const r = rng(31);
  const X = (v: number) => (v * w) / 150;
  const Y = (v: number) => (v * h) / 230;
  const rail = INK.roseLight;
  pencilLine(ctx, r, X(20), Y(214), X(21), Y(40), rail, 2.2);
  pencilLine(ctx, r, X(44), Y(214), X(43), Y(40), rail, 2.2);
  pencilLine(ctx, r, X(18), Y(40), X(46), Y(41), rail, 2);
  for (let i = 0; i < 7; i++) {
    const y = 50 + i * 24;
    pencilLine(ctx, r, X(21), Y(y), X(43), Y(y + 22), INK.roseMid, 1.1, 1);
    pencilLine(ctx, r, X(43), Y(y), X(21), Y(y + 22), INK.roseMid, 1.1, 1);
  }
  pencilLine(ctx, r, X(44), Y(95), X(80), Y(96), rail, 1.8);
  pencilLine(ctx, r, X(44), Y(150), X(80), Y(149), rail, 1.8);
  pencilLine(ctx, r, X(22.5), Y(210), X(23), Y(44), 'rgba(240,223,210,0.5)', 0.8, 1);
  pencilFill(ctx, r, [[X(6), Y(214)], [X(144), Y(214)], [X(137), Y(228)], [X(13), Y(228)]], 'rgba(78,34,49,0.9)', [
    { color: INK.roseMid, angle: -0.15, density: 18, len: [6, 14], width: 0.8 },
  ], 0.6);
  pencilLine(ctx, r, X(6), Y(214), X(144), Y(214), 'rgba(240,223,210,0.6)', 1);
}

/** A pencilled cream button shape filling a w×h box: wobbly pill, hatched fill, double outline. */
export function paintPencilButton(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const r = rng(Math.round(w * 7 + h));
  const pad = 3;
  const rad = (h - pad * 2) / 2;
  const pts: Pt[] = [];
  // Stadium outline: right cap, then left cap, with a little hand jitter
  for (let i = 0; i <= 8; i++) {
    const a = -Math.PI / 2 + (i / 8) * Math.PI;
    pts.push([w - pad - rad + Math.cos(a) * rad + (r() - 0.5) * 1.5, h / 2 + Math.sin(a) * rad + (r() - 0.5) * 1.5]);
  }
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI / 2 + (i / 8) * Math.PI;
    pts.push([pad + rad + Math.cos(a) * rad + (r() - 0.5) * 1.5, h / 2 + Math.sin(a) * rad + (r() - 0.5) * 1.5]);
  }
  pencilFill(ctx, r, pts, INK.cream, [
    { color: '#fff', angle: -0.5, density: 2.2, len: [5, 11], width: 0.9 },
    { color: INK.roseLight, angle: -0.45, density: 1.4, len: [5, 10], width: 0.8, where: (_, y) => y > h * 0.58 },
  ], 1);
  pencilOutline(ctx, r, pts, 'rgba(78,34,49,0.85)', 1.6, true);
}

// ── Ships ────────────────────────────────────────────────────────────────────

export type ShipKind = 'rocket' | 'ufo' | 'satellite';

/** A ship drawn in pencil into a square of side `size`, pointing up. `seed` varies the hand. */
export function paintShip(ctx: CanvasRenderingContext2D, size: number, kind: ShipKind, color: string, seed: number, flame = true) {
  const r = rng(seed);
  const u = size / 72;
  const P = (pts: Pt[]) => pts.map(([x, y]) => [x * u, y * u] as Pt);

  if (kind === 'rocket') {
    if (flame) {
      pencilFill(ctx, r, P([[29, 50], [36, 69], [43, 50]]), 'rgba(242,135,107,0.85)', [{ color: INK.flameCore, angle: -1.57, density: 30, len: [3, 7], width: 0.7 }], 0.6);
    }
    for (const fin of [[[27, 37], [14, 54], [28, 51]], [[45, 37], [58, 54], [44, 51]]] as Pt[][]) {
      pencilFill(ctx, r, P(fin), 'rgba(111,52,70,0.95)', [{ color: INK.roseLight, angle: -1.2, density: 30, len: [3, 7], width: 0.6 }], 0.6);
    }
    const body = P([[36, 4], [44, 14], [47, 30], [45.5, 51], [26.5, 51], [25, 30], [28, 14]]);
    pencilFill(ctx, r, body, color, [
      { color: '#fff', angle: -1.3, density: 14, len: [4, 9], width: 0.7 },
      { color: INK.roseMid, angle: -1.9, density: 10, len: [4, 9], width: 0.7, where: (x) => x > 40 * u },
    ], 0.7);
    pencilFill(ctx, r, P([[36, 4], [44, 14], [45.5, 21], [26.5, 21], [28, 14]]), 'rgba(111,52,70,0.95)', [{ color: INK.roseLight, angle: -1.1, density: 30, len: [3, 7], width: 0.6 }], 0.6);
    pencilOutline(ctx, r, body, 'rgba(78,34,49,0.8)', 1.1 * u, true);
    ctx.beginPath();
    ctx.arc(36 * u, 32 * u, 5 * u, 0, Math.PI * 2);
    ctx.fillStyle = '#0c0921';
    ctx.fill();
    pencilOutline(ctx, r, Array.from({ length: 9 }, (_, i) => [36 * u + Math.cos(i * 0.8) * 5.5 * u, 32 * u + Math.sin(i * 0.8) * 5.5 * u] as Pt), INK.cream, 1.6 * u, true);
  } else if (kind === 'ufo') {
    const dome = P([[25, 38], [27, 27], [36, 21], [45, 27], [47, 38]]);
    pencilFill(ctx, r, dome, 'rgba(176,196,230,0.55)', [{ color: '#fff', angle: -0.8, density: 14, len: [3, 7], width: 0.6 }], 0.6);
    const saucer = P([[8, 40], [20, 34], [36, 32], [52, 34], [64, 40], [52, 46], [36, 48], [20, 46]]);
    pencilFill(ctx, r, saucer, color, [
      { color: '#fff', angle: -0.15, density: 14, len: [5, 10], width: 0.7 },
      { color: INK.roseMid, angle: -0.1, density: 10, len: [5, 10], width: 0.7, where: (_, y) => y > 42 * u },
    ], 0.7);
    pencilOutline(ctx, r, saucer, 'rgba(78,34,49,0.75)', 1 * u, true);
    for (const x of [21, 36, 51]) {
      ctx.beginPath();
      ctx.arc(x * u, (x === 36 ? 44 : 42) * u, 1.8 * u, 0, Math.PI * 2);
      ctx.fillStyle = INK.flameCore;
      ctx.fill();
    }
  } else {
    for (const x0 of [6, 46]) {
      const panel = P([[x0, 31], [x0 + 20, 31], [x0 + 20, 42], [x0, 42]]);
      pencilFill(ctx, r, panel, 'rgba(79,106,154,0.9)', [{ color: '#9fb6e0', angle: 0, density: 16, len: [4, 9], width: 0.6 }], 0.6);
      pencilOutline(ctx, r, panel, INK.cream, 0.8 * u, true);
      pencilLine(ctx, r, (x0 + 10) * u, 31 * u, (x0 + 10) * u, 42 * u, 'rgba(240,223,210,0.6)', 0.6 * u, 1);
    }
    pencilLine(ctx, r, 26 * u, 36.5 * u, 46 * u, 36.5 * u, INK.cream, 1 * u, 1);
    pencilLine(ctx, r, 36 * u, 26 * u, 36 * u, 15 * u, INK.cream, 1 * u, 1);
    const body = P([[29, 25], [43, 25], [43, 46], [29, 46]]);
    pencilFill(ctx, r, body, color, [{ color: '#fff', angle: -1.2, density: 18, len: [3, 8], width: 0.6 }], 0.6);
    pencilOutline(ctx, r, body, 'rgba(78,34,49,0.75)', 1 * u, true);
    ctx.beginPath();
    ctx.arc(36 * u, 13.5 * u, 2.4 * u, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

/** A lumpy lavender smoke puff in pencil, filling a square of side `size`. */
export function paintSmokePuff(ctx: CanvasRenderingContext2D, size: number, seed: number) {
  const r = rng(seed);
  const c = size / 2;
  const n = 11;
  const pts: Pt[] = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const rad = c * (0.62 + r() * 0.3);
    return [c + Math.cos(a) * rad, c + Math.sin(a) * rad * 0.85];
  });
  pencilFill(ctx, r, pts, 'rgba(206,196,222,0.45)', [
    { color: '#f1eaf4', angle: -0.7, density: 9, len: [4, 10], width: 0.8 },
    { color: '#8f86a8', angle: 2.4, density: 5, len: [4, 9], width: 0.8, where: (_, y) => y > c },
  ], 1.5);
}
