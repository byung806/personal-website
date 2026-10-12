/**
 * Pencil: procedural colored-pencil drawing for any 2D canvas. No dependencies, no framework.
 *
 * The look comes from four tricks:
 * - Wobbly shapes: points are nudged a pixel or so, then joined with a smooth curve (`tracePath`).
 * - Stroke fills: a faint wash, then hundreds of short, slightly curved strokes clipped to the shape,
 *   each with its own angle jitter, length, width and opacity, layered light/dark (`pencilFill`).
 * - Hand lines: straight lines bow a little and overshoot their ends, in 1–2 passes (`pencilLine`).
 * - Paper: grass flicks for ground (`pencilMeadow`) and per-pixel grain at the end (`addGrain`).
 * All randomness goes through a seeded `rng`, so the same seed always draws the same picture.
 *
 * Usage (sizes in CSS pixels; scale the context for devicePixelRatio first):
 *   const r = rng(42);
 *   pencilFill(ctx, r, [[20, 120], [80, 20], [140, 120]], 'rgba(111,52,70,0.8)', [
 *     { color: '#c98f9b', angle: -1.05, density: 7 },          // light strokes, up-right
 *     { color: '#4e2231', angle: -2.1, density: 3, len: [5, 12] }, // darker strokes, the other way
 *   ]);
 *   pencilOutline(ctx, r, [[20, 120], [80, 20], [140, 120]], '#f0dfd2', 1);
 *   addGrain(ctx, canvas.width, canvas.height, 14); // last, in device pixels
 */

export type Pt = [number, number];
export type Rand = () => number;

/** Seeded PRNG (mulberry32). */
export function rng(seed: number): Rand {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const grainTiles = new Map<number, HTMLCanvasElement>();

/** A small tile of random light and dark specks, made once per `amount` and reused. */
function grainTile(amount: number) {
  let tile = grainTiles.get(amount);
  if (tile) return tile;
  tile = document.createElement('canvas');
  tile.width = tile.height = 128;
  const tctx = tile.getContext('2d')!;
  const img = tctx.createImageData(128, 128);
  const r = rng(99);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * amount;
    const v = n > 0 ? 255 : 0;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = Math.abs(n) * 2;
  }
  tctx.putImageData(img, 0, 0);
  grainTiles.set(amount, tile);
  return tile;
}

/** Monochrome grain over the whole pixel buffer (device pixels); transparent pixels stay transparent. */
export function addGrain(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  // Tiled over what's already drawn (and only there), so it costs next to nothing even on big canvases
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = ctx.createPattern(grainTile(amount), 'repeat')!;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** A smooth path through `pts` (Catmull-Rom), each point nudged by up to `wobble` px. */
export function tracePath(ctx: CanvasRenderingContext2D, r: Rand, pts: Pt[], closed: boolean, wobble = 1.2) {
  const p = pts.map(([x, y]) => [x + (r() - 0.5) * wobble, y + (r() - 0.5) * wobble] as Pt);
  const n = p.length;
  const at = (i: number) => (closed ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))]);
  ctx.beginPath();
  ctx.moveTo(p[0][0], p[0][1]);
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    ctx.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
      p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6,
      p2[0], p2[1],
    );
  }
  if (closed) ctx.closePath();
}

/** One pencil line with a slight bow and overshoot past its ends, drawn in 1–2 shaky passes. */
export function pencilLine(
  ctx: CanvasRenderingContext2D, r: Rand,
  x0: number, y0: number, x1: number, y1: number,
  color: string, width = 1, passes = 2,
) {
  const len = Math.hypot(x1 - x0, y1 - y0) || 1;
  const ux = (x1 - x0) / len;
  const uy = (y1 - y0) / len;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  for (let p = 0; p < passes; p++) {
    const o0 = 1 + r() * 3;
    const o1 = 1 + r() * 3;
    const bow = (r() - 0.5) * Math.min(4, len * 0.04);
    const sx = x0 - ux * o0 + (r() - 0.5) * 1.2;
    const sy = y0 - uy * o0 + (r() - 0.5) * 1.2;
    const ex = x1 + ux * o1 + (r() - 0.5) * 1.2;
    const ey = y1 + uy * o1 + (r() - 0.5) * 1.2;
    ctx.lineWidth = width * (0.7 + r() * 0.5);
    ctx.globalAlpha = 0.65 + r() * 0.35;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo((sx + ex) / 2 - uy * bow, (sy + ey) / 2 + ux * bow, ex, ey);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export type StrokeSet = { color: string; angle: number; density: number; len?: [number, number]; width?: number; where?: (x: number, y: number) => boolean };

/**
 * Fill a shape the way a pencil would: a thin base wash, then layers of short strokes at an angle.
 * `density` is strokes per 100 px² of the shape's bounding box.
 */
export function pencilFill(ctx: CanvasRenderingContext2D, r: Rand, pts: Pt[], wash: string, sets: StrokeSet[], wobble = 1.2) {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  ctx.save();
  tracePath(ctx, r, pts, true, wobble);
  ctx.fillStyle = wash;
  ctx.fill();
  ctx.clip();
  ctx.lineCap = 'round';
  for (const s of sets) {
    const count = ((x1 - x0 + 8) * (y1 - y0 + 8) * s.density) / 100;
    const [lmin, lmax] = s.len ?? [5, 12];
    ctx.strokeStyle = s.color;
    for (let i = 0; i < count; i++) {
      const x = x0 - 4 + r() * (x1 - x0 + 8);
      const y = y0 - 4 + r() * (y1 - y0 + 8);
      if (s.where && !s.where(x, y)) continue;
      const a = s.angle + (r() - 0.5) * 0.35;
      const l = lmin + r() * (lmax - lmin);
      const dx = Math.cos(a) * l;
      const dy = Math.sin(a) * l;
      ctx.globalAlpha = 0.25 + r() * 0.55;
      ctx.lineWidth = (s.width ?? 0.9) * (0.6 + r() * 0.8);
      ctx.beginPath();
      ctx.moveTo(x - dx / 2, y - dy / 2);
      ctx.quadraticCurveTo(x + (r() - 0.5) * 1.5, y + (r() - 0.5) * 1.5, x + dx / 2, y + dy / 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** A shaky pencil outline along `pts` (open), in two passes, sometimes lifting off. */
export function pencilOutline(ctx: CanvasRenderingContext2D, r: Rand, pts: Pt[], color: string, width = 1, closed = false) {
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let p = 0; p < 2; p++) {
    ctx.lineWidth = width * (p ? 0.6 : 1);
    ctx.globalAlpha = p ? 0.45 : 0.85;
    tracePath(ctx, r, pts, closed, 1.4);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export type Crest = (x: number) => number;

/** A gently rolling line: base height plus a few slow sine waves with seeded phases. */
export function rollingCrest(seed: number, base: number, amp: number, w: number): Crest {
  const r = rng(seed);
  const waves = [0.8, 1.7, 3.1].map((f, i) => ({ f: (f * Math.PI * 2) / w, p: r() * Math.PI * 2, a: amp / (i + 1) }));
  return (x) => base + waves.reduce((y, v) => y + Math.sin(x * v.f + v.p) * v.a, 0);
}

/**
 * One band of meadow: filled from its crest down, covered in curly grass marks that shrink toward the
 * crest, and edged with a broken cream pencil line. Later bands paint over earlier ones.
 */
export function pencilMeadow(
  ctx: CanvasRenderingContext2D, w: number, h: number, crest: Crest,
  { top, bottom, grass = 1, edge = 0.45, seed }: { top: string; bottom: string; grass?: number; edge?: number; seed: number },
) {
  const r = rng(seed);
  const pts: Pt[] = [];
  for (let x = -8; x <= w + 8; x += 8) pts.push([x, crest(x)]);
  const minY = Math.min(...pts.map((p) => p[1]));

  ctx.save();
  tracePath(ctx, r, [[-8, h + 8], ...pts, [w + 8, h + 8]], true, 0.6);
  const g = ctx.createLinearGradient(0, minY, 0, h);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.clip();

  // Soft lighter patches, like uneven pencil pressure
  for (let i = 0; i < 8; i++) {
    const x = r() * w;
    const y = minY + r() * (h - minY);
    const rad = 70 + r() * 180;
    const patch = ctx.createRadialGradient(x, y, 0, x, y, rad);
    patch.addColorStop(0, 'rgba(46,86,110,0.14)');
    patch.addColorStop(1, 'rgba(46,86,110,0)');
    ctx.fillStyle = patch;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }

  ctx.lineCap = 'round';
  const count = (w * (h - minY)) / 22;
  for (let i = 0; i < count; i++) {
    const x = r() * w;
    const y = minY + r() * (h - minY);
    const c = crest(x);
    if (y < c + 1) continue;
    const depth = 0.4 + 0.6 * Math.min(1, (y - c) / (h * 0.3)); // smaller toward the crest
    const len = (7 + r() * 11) * depth * grass;
    const lean = (r() - 0.3) * 7 * depth * grass;
    const dark = r() < 0.6;
    ctx.strokeStyle = dark ? '#020b16' : '#3b6680';
    ctx.globalAlpha = dark ? 0.3 + r() * 0.35 : 0.15 + r() * 0.25;
    ctx.lineWidth = (dark ? 1 : 0.8) * (0.7 + r() * 0.6);
    ctx.beginPath();
    ctx.moveTo(x, y);
    // An S-curve flick, like a quick pencil mark for a blade of grass
    ctx.bezierCurveTo(x + lean * 0.5, y - len * 0.35, x - lean * 0.4, y - len * 0.7, x + lean, y - len);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Crest: a broken cream line, with a soft second pass
  if (edge > 0) {
    for (let p = 0; p < 2; p++) {
      const color = `rgba(240,210,196,${p ? edge * 0.45 : edge})`;
      const width = p ? 1.6 : 0.9;
      let x = 0;
      while (x < w) {
        const run = 30 + r() * 160;
        const end = Math.min(w, x + run);
        // Follow the crest in short pieces so the line bends with the hills
        for (let sx = x; sx < end; sx += 24) {
          const ex = Math.min(end, sx + 24);
          pencilLine(ctx, r, sx, crest(sx) + 0.5, ex, crest(ex) + 0.5, color, width, 1);
        }
        x = end + (r() < 0.3 ? 6 + r() * 24 : 0);
      }
    }
  }
}
