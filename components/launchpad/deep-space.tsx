'use client';

import { useEffect, useRef } from 'react';
import { rng, type Rand } from '@/lib/pencil';
import { archSteps, dot, drawGlimpse, drawMilkyWay, drawTrail } from './night-sky';

/**
 * Endless night sky behind a long page, in the style of the old banner (night-sky.tsx, after
 * tinycamp.site): a dense field of fine stars, milky-way sections that change as you go (a diagonal
 * band, its mirror, a low swoop, a slanting stream) melting into one another, distant galaxies,
 * nebulae and clusters, and glitter stars re-rolled ten times a second. Each layer scrolls at its own
 * speed (parallax) and is cut into tiles painted from a seed the first time they come into view, so
 * the same spot always shows the same sky. Shooting stars fly now and then and wherever you click; the
 * cursor leaves a lilac trail.
 */

/** `tile` px of page per tile; a tile is painted `overlap` px taller at each end, over its neighbors. */
type Layer = { speed: number; tile: number; overlap?: number; paint?: (ctx: CanvasRenderingContext2D, r: Rand, w: number, h: number, i: number) => void };

/** Backdrop colors by depth, one every DEPTH_STEP px of page, looping (the first is the old banner's). */
const DEPTHS = ['#0b1628', '#0c0921', '#100c29', '#091626', '#120b25'];
const DEPTH_STEP = 1600;
const SHOOTING_COLORS = ['#D1B678', '#5461AD', '#ED9BAF', '#4E97B7'];
const STAR_TINTS = ['255,255,255', '200,215,255', '255,214,230', '255,240,200', '190,240,255'];
const ARM_COLORS = ['159,179,255', '255,159,208', '168,240,255', '201,168,255', '255,196,150', '150,255,210'];

const pick = <T,>(r: Rand, xs: T[]) => xs[Math.floor(r() * xs.length)];

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, rad: number, rgb: string, a: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
}

/** A spiral galaxy: a warm core and star-strewn logarithmic arms, tilted away from us. */
function spiral(ctx: CanvasRenderingContext2D, r: Rand, cx: number, cy: number, R: number) {
  const arms = 2 + Math.floor(r() * 3);
  const wind = 2.5 + r() * 3;
  const squash = 0.3 + r() * 0.65;
  const turn = r() * Math.PI;
  const arm = pick(r, ARM_COLORS);
  const [cos, sin] = [Math.cos(turn), Math.sin(turn)];
  const place = (lx: number, ly: number) => [cx + lx * cos - ly * squash * sin, cy + lx * sin + ly * squash * cos];

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(turn);
  ctx.scale(1, squash);
  glow(ctx, 0, 0, R * 1.1, arm, 0.1);
  ctx.restore();

  const n = Math.min(9000, R * R * 0.25);
  for (let i = 0; i < n; i++) {
    const d = R * Math.pow(r(), 0.9);
    const spread = (r() + r() - 1) * (0.45 + 1.1 * (1 - d / R));
    const a = (Math.floor(r() * arms) * Math.PI * 2) / arms + (d / R) * wind + spread;
    const [x, y] = place(Math.cos(a) * d, Math.sin(a) * d);
    const k = d / R;
    ctx.fillStyle = `rgba(${k < 0.25 ? '255,236,205' : arm},${(0.25 + r() * 0.6) * (1 - k * 0.6)})`;
    const s = 0.4 + r() * (k < 0.2 ? 1.3 : 0.9);
    ctx.fillRect(x, y, s, s);
  }
  ctx.globalCompositeOperation = 'lighter';
  glow(ctx, cx, cy, R * 0.32, '255,226,190', 0.55);
  glow(ctx, cx, cy, R * 0.1, '255,250,240', 0.8);
  ctx.globalCompositeOperation = 'source-over';
}

/** A nebula: overlapping soft clouds in two hues, with young stars inside. */
function nebula(ctx: CanvasRenderingContext2D, r: Rand, cx: number, cy: number, R: number) {
  const hues = [pick(r, ARM_COLORS), pick(r, ARM_COLORS)];
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2;
    const d = r() * R * 0.6;
    glow(ctx, cx + Math.cos(a) * d * 1.4, cy + Math.sin(a) * d, R * (0.25 + r() * 0.45), hues[i % 2], 0.05 + r() * 0.08);
  }
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < R * 2; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.pow(r(), 0.7) * R * 0.8;
    ctx.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.6})`;
    const s = 0.4 + r() * 1;
    ctx.fillRect(cx + Math.cos(a) * d * 1.4, cy + Math.sin(a) * d, s, s);
  }
}

/** A globular cluster: a dense ball of stars. */
function cluster(ctx: CanvasRenderingContext2D, r: Rand, cx: number, cy: number, R: number) {
  const tint = pick(r, STAR_TINTS);
  glow(ctx, cx, cy, R * 0.9, tint, 0.12);
  for (let i = 0; i < R * 6; i++) {
    const a = r() * Math.PI * 2;
    const d = (r() + r() + r() - 1.5) * R * 0.55;
    ctx.fillStyle = `rgba(${tint},${0.4 + r() * 0.6})`;
    const s = 0.5 + r() * 1.1;
    ctx.fillRect(cx + Math.cos(a) * d, cy + Math.sin(a) * d, s, s);
  }
}

/**
 * A layer of deep-sky objects: `count` of them per tile (each shown with `chance`), sized by `size`.
 * Further layers get more, smaller, dimmer ones.
 */
const deepObjects = (count: number, size: number, chance: number, alpha: number) =>
  function paint(ctx: CanvasRenderingContext2D, r: Rand, w: number, h: number) {
    const scale = size * Math.min(1, Math.max(0.55, w / 1200));
    ctx.globalAlpha = alpha;
    for (let i = 0; i < count; i++) {
      const kind = r();
      const R = (kind < 0.5 ? 90 + r() * 140 : kind < 0.8 ? 120 + r() * 120 : 30 + r() * 40) * scale;
      // Kept inside its slice of the tile, so nothing is cut off at a seam
      const y = (i + 0.5) * (h / count) + (r() - 0.5) * Math.max(0, h / count - R * 2.4);
      const x = w * (0.08 + r() * 0.84);
      if (r() < chance) (kind < 0.5 ? spiral : kind < 0.8 ? nebula : cluster)(ctx, r, x, y, R);
    }
    ctx.globalAlpha = 1;
  };

/** Runs `paint` with Math.random seeded (the night-sky painters use it), so a tile always comes out the same. */
function seeded(r: Rand, paint: () => void) {
  const random = Math.random;
  Math.random = r;
  try {
    paint();
  } finally {
    Math.random = random;
  }
}

/** The dense field of fine stars, a few of them bright. */
function field(ctx: CanvasRenderingContext2D, r: Rand, w: number, h: number) {
  for (let i = 0; i < (w * h) / 650; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.55})`;
    dot(ctx, r() * w, r() * h, r() < 0.04 ? 0.9 + r() * 0.6 : r() * 0.55);
  }
}

/** Milky-way sections, one per tile, so the sky changes as you scroll. */
const SECTIONS: ((ctx: CanvasRenderingContext2D, w: number, h: number) => void)[] = [
  drawMilkyWay,
  // The same band, mirrored
  (ctx, w, h) => {
    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    drawMilkyWay(ctx, w, h);
    ctx.restore();
  },
  // The launchpad's swoop, minus its field stars (the field layer has those)
  (ctx, w, h) => archSteps(ctx, w, h).slice(1).forEach((step) => step()),
  (ctx, w, h) => {
    drawGlimpse(ctx, w, h);
    drawTrail(ctx, w, h);
  },
];
const sectionAt = (i: number) => Math.floor(rng(i * 31 + 7)() * SECTIONS.length);

/** How far each section fades in and out at its ends, overlapping its neighbors. */
const SECTION_FADE = 280;

function section(ctx: CanvasRenderingContext2D, r: Rand, w: number, h: number, i: number) {
  // Never the same section twice in a row
  let k = sectionAt(i);
  if (k === sectionAt(i - 1)) k = (k + 1) % SECTIONS.length;
  seeded(r, () => SECTIONS[k](ctx, w, h));
  // Fade both ends
  const { width, height } = ctx.canvas;
  const f = SECTION_FADE / h;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'destination-in';
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(f, 'rgba(0,0,0,1)');
  g.addColorStop(1 - f, 'rgba(0,0,0,1)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

const LAYERS: Layer[] = [
  { speed: 0.08, tile: 900, paint: field },
  { speed: 0.16, tile: 1000, overlap: SECTION_FADE, paint: section },
  { speed: 0.24, tile: 900, paint: deepObjects(2, 0.4, 0.5, 0.75) },
  { speed: 0.36, tile: 1100, paint: deepObjects(1, 0.9, 0.45, 0.9) },
  // Glitter, drawn live (see `glitterAt`)
  { speed: 0.5, tile: 900 },
];

/** Glitter stars per px² (the old banner's 500 over a 1440×900 sky). */
const GLITTER_DENSITY = 500 / (1440 * 900);

type Glitter = { x: number; y: number; size: number; r: number; color: string };
type Shooter = { x: number; y: number; vx: number; vy: number; life: number; color: string };
type Spark = { x: number; y: number; size: number; vx: number; vy: number };
const SHOOTER_LIFE = 60;

const mix = (a: string, b: string, t: number) => {
  const [x, y] = [a, b].map((c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)));
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`;
};
const depthColor = (y: number) => {
  const k = Math.max(0, y) / DEPTH_STEP;
  const i = Math.floor(k);
  return mix(DEPTHS[i % DEPTHS.length], DEPTHS[(i + 1) % DEPTHS.length], k - i);
};

export default function DeepSpace({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    /** Painted tiles by "layer:index"; dropped once they're far off screen. */
    let tiles = new Map<string, HTMLCanvasElement>();
    const glitter = new Map<number, Glitter[]>();
    let shooters: Shooter[] = [];
    let sparks: Spark[] = [];

    const tileAt = (l: number, i: number) => {
      const key = `${l}:${i}`;
      let t = tiles.get(key);
      if (t) return t;
      const layer = LAYERS[l];
      const th = layer.tile + 2 * (layer.overlap ?? 0);
      t = document.createElement('canvas');
      t.width = Math.round(w * dpr);
      t.height = Math.round(th * dpr);
      const tctx = t.getContext('2d')!;
      tctx.scale(dpr, dpr);
      layer.paint!(tctx, rng(l * 100003 + i * 7919 + 17), w, th, i);
      tiles.set(key, t);
      return t;
    };

    /** Like the old banner's glitter: each star's size, hue and brightness re-rolled every tenth of a second. */
    const reroll = (s: Glitter) => {
      s.r = Math.max(0.2, s.size + (Math.random() - 0.8) * 0.5);
      s.color = `hsla(${Math.floor(Math.random() * 160)},100%,85%,${reduce ? 0.4 : Math.random() * 0.6})`;
    };
    const glitterAt = (i: number) => {
      let list = glitter.get(i);
      if (list) return list;
      const r = rng(i * 4243 + 5);
      const tile = LAYERS[LAYERS.length - 1].tile;
      list = Array.from({ length: Math.round(w * tile * GLITTER_DENSITY) }, () => ({ x: r() * w, y: r() * tile, size: 0.6 + r() * 0.6, r: 0, color: '' }));
      list.forEach(reroll);
      glitter.set(i, list);
      return list;
    };

    const resize = () => {
      const nw = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(nw * dpr);
      canvas.height = Math.round(h * dpr);
      // Tiles span the width, so only a new width repaints them (not a phone's toolbar sliding away)
      if (nw !== w) {
        w = nw;
        tiles = new Map();
        glitter.clear();
      }
    };

    let lastGlitter = 0;
    const draw = (now: number) => {
      const y = window.scrollY;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, depthColor(y * 0.5));
      bg.addColorStop(1, depthColor((y + h) * 0.5));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const refresh = now - lastGlitter > 100;
      if (refresh) lastGlitter = now;
      const seen = new Set<string>();
      LAYERS.forEach((layer, l) => {
        const offset = y * layer.speed;
        const over = layer.overlap ?? 0;
        // Tiles overlapping the screen, counting the parts painted past their ends
        for (let i = Math.floor((offset - over) / layer.tile); i * layer.tile - over - offset < h; i++) {
          const top = i * layer.tile - offset;
          if (layer.paint) {
            seen.add(`${l}:${i}`);
            ctx.drawImage(tileAt(l, i), 0, top - over, w, layer.tile + 2 * over);
          } else {
            for (const s of glitterAt(i)) {
              if (refresh && !reduce) reroll(s);
              ctx.beginPath();
              ctx.arc(s.x, top + s.y, s.r, 0, Math.PI * 2);
              ctx.fillStyle = s.color;
              ctx.fill();
            }
          }
        }
      });
      // Forget tiles that scrolled well out of view
      if (tiles.size > seen.size + 6) tiles.forEach((_, k) => !seen.has(k) && tiles.delete(k));

      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      shooters = shooters.filter((s) => s.life > 0);
      for (const s of shooters) {
        s.life--;
        s.x += s.vx;
        s.y += s.vy;
        const half = SHOOTER_LIFE / 2;
        const age = Math.pow(1 - Math.abs(s.life - half) / half, 2);
        const [ex, ey] = [s.x - s.vx * 8 * age, s.y - s.vy * 8 * age];
        const g = ctx.createLinearGradient(s.x, s.y, ex, ey);
        g.addColorStop(0, '#fff');
        g.addColorStop(Math.min(age, 0.7), s.color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.strokeStyle = g;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
      sparks = sparks.filter((p) => p.size > 0.05);
      ctx.fillStyle = 'rgba(162,127,189,0.6)';
      for (const p of sparks) {
        p.x += p.vx;
        p.y += p.vy;
        p.size -= 0.04;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.size / 2, p.y + p.size / 2);
        ctx.lineTo(p.x, p.y + p.size);
        ctx.lineTo(p.x + p.size / 2, p.y + p.size / 2);
        ctx.closePath();
        ctx.fill();
      }
    };

    const shoot = (x = Math.random() * w, y = Math.random() * h * 0.4) =>
      shooters.push({
        x,
        y,
        vx: (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 5.5),
        vy: 1 + Math.random() * 3,
        life: SHOOTER_LIFE,
        color: SHOOTING_COLORS[Math.floor(Math.random() * SHOOTING_COLORS.length)],
      });

    resize();
    let raf = 0;
    let nextShot = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;
      if (now > nextShot) {
        if (nextShot) shoot();
        nextShot = now + 1500 + Math.random() * 3000;
      }
      draw(now);
    };
    const redraw = () => draw(performance.now());
    if (reduce) {
      redraw();
      window.addEventListener('scroll', redraw, { passive: true });
    } else raf = requestAnimationFrame(tick);

    const onResize = () => {
      resize();
      redraw();
    };
    const onMove = (e: PointerEvent) => {
      if (reduce) return;
      for (let i = 0; i < 5; i++) {
        sparks.push({ x: e.clientX, y: e.clientY, size: 0.8 + Math.random() * 2, vx: (Math.random() * 0.75 - 0.25) * 2, vy: (Math.random() * 0.75 - 0.25) * 2 });
      }
    };
    const onClick = (e: MouseEvent) => !reduce && shoot(e.clientX, e.clientY);
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('click', onClick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', redraw);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('click', onClick);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none h-full w-full ${className}`} />;
}
