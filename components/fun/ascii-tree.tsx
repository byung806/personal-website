'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * A rotating ASCII Christmas tree, every needle, light and present a character in a terminal grid with a depth
 * buffer. Ported from Bryan's standalone "ASCII Christmas Tree" study, made more magical: everything is born white
 * and cools into its color, so the tree and its decorations glow into being like orbs from nothing; white sparkles
 * twinkle across it; and the colors are more vivid. Clicking it sends sparks off its outline. It grows when scrolled
 * into view and sleeps offscreen.
 */
/** `children` (the section title) sits over the top of the night, above the tree. */
export default function AsciiTree({ className = '', children }: { className?: string; children?: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    return startTree(wrap, canvas);
  }, []);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`}>
      <canvas ref={canvasRef} role="img" aria-label="An ASCII Christmas tree growing, decorating itself and sparkling" className="absolute inset-0 block h-full w-full" />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ boxShadow: 'inset 0 0 130px 34px #060910bd' }} />
      {children && <div className="relative">{children}</div>}
    </div>
  );
}

const CYCLE = 20;
const TAU = Math.PI * 2;
const HEIGHT = 1.66;
const RADIUS = 0.66;
const GLYPHS = 'x+*:o%/=-.#@';
// How long things stay white after they appear before cooling into their color (seconds).
const LEAF_BIRTH = 1.6;
const DECOR_BIRTH = 1.3;
const LEVELS = 6;

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const smooth = (a: number, b: number, x: number) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
/** The time at which smooth(a, b, t) reaches v. */
function unsmooth(a: number, b: number, v: number) {
  if (v <= 0) return a;
  if (v >= 1) return b;
  let lo = 0, hi = 1;
  for (let i = 0; i < 30; i++) {
    const k = (lo + hi) / 2;
    if (k * k * (3 - 2 * k) < v) lo = k; else hi = k;
  }
  return a + (b - a) * (lo + hi) / 2;
}
function mulberry32(a: number) {
  return () => { let t = a += 0x6D2B79F5; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function hexToRgb(hex: string) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
/** More saturated and a touch brighter. */
function vivid(hex: string, sat = 1.45, light = 1.08) {
  const [r, g, b] = hexToRgb(hex).map(v => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  s = Math.min(1, s * sat);
  const L = Math.min(0.97, l * light);
  const q = L < 0.5 ? L * (1 + s) : L + s - L * s, p = 2 * L - q;
  const hue = (t: number) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  return '#' + [hue(h + 1 / 3), hue(h), hue(h - 1 / 3)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
}

const BASE_COLORS = [
  '#10251f', '#143323', '#17412a', '#1b4e30', '#205f3a', '#276b42', '#328051', '#4a9961', '#5bab73', '#7eb989', // foliage 0..9
  '#74492a', '#ae782e', '#d5a141', '#eec36a', '#fff1b6', // gold 10..14
  '#6f151d', '#a81b24', '#cb2831', '#f04b3b', '#fb8c61', // red 15..19
  '#637984', '#a7b8b7', '#e6e7d5', '#faf5d1', // ice 20..23
  '#132c65', '#2044a1', '#3777d2', '#9ac5f3', // blue 24..27
  '#49535d', '#a6a4a2', '#c4ab8a', // ground 28..30
];
const COLORS = BASE_COLORS.map((c, i) => (i < 20 || (i >= 24 && i < 28) ? (i < 10 ? vivid(c, 1.6, 1.22) : vivid(c, 1.45)) : c));
// COLORS[c] blended toward white: SHADES[c][level], level 0 = own color, LEVELS - 1 = pure white.
const SHADES = COLORS.map(c => {
  const [r, g, b] = hexToRgb(c);
  return Array.from({ length: LEVELS }, (_, level) => {
    // Eased so it lingers near white, then cools quickly into color.
    const w = Math.pow(level / (LEVELS - 1), 0.6);
    return `rgb(${Math.round(r + (255 - r) * w)},${Math.round(g + (255 - g) * w)},${Math.round(b + (255 - b) * w)})`;
  });
});

function startTree(wrap: HTMLElement, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let simTime = reducedMotion ? 13.5 : 0, lastFrame = 0, lastDraw = 0, raf = 0, visible = false, started = false;
  let cw = 6.2, ch = 8.8, cols = 0, rows = 0, W = 0, H = 0, unit = 0, baseY = 0, dpr = 1;
  let depthBuffer = new Float32Array(0), glyphBuffer = new Uint8Array(0), colorBuffer = new Uint8Array(0);
  let whiteBuffer = new Uint8Array(0), activeBuffer = new Uint8Array(0);
  const touched: number[] = [];
  let pointerX = 0;
  // Caches that keep each frame cheap: the still sky and ground painted once, and soft glows as sprites instead of
  // fresh gradients.
  const backdrop = document.createElement('canvas');
  const glowSprites = new Map<string, HTMLCanvasElement>();

  // Stable, deterministic random values keep the tree's shape as it turns.
  const rng = mulberry32(7);
  const rand = (lo = 0, hi = 1) => lo + (hi - lo) * rng();
  const pick = <T,>(a: T[]) => a[(rng() * a.length) | 0];
  const growAt = (y: number) => unsmooth(0.1, 4.6, (y - 0.005) / HEIGHT);
  const decorAt = (share: number) => unsmooth(5.8, 9.8, share);

  type Glyph = { x: number; y: number; z: number; char: number; tint: number; flick: number; born: number };
  const glyphs: Glyph[] = [];
  // A dense volume of characters builds the triangular silhouette.
  for (let i = 0; i < 11600; i++) {
    const y = Math.pow(rand(), 0.86) * HEIGHT;
    const ny = y / HEIGHT;
    const angle = rand(0, TAU);
    const tier = Math.floor(ny * 23);
    const tierBump = 1 + 0.06 * Math.sin(tier * 1.78) + 0.045 * Math.sin(ny * 110);
    const radial = Math.sqrt(rand(0.10, 1)) * (RADIUS * (1 - ny) ** 0.92) * tierBump;
    const g = { x: Math.cos(angle) * radial, y: y + rand(-0.005, 0.005), z: Math.sin(angle) * radial, char: (rng() < 0.67 ? 0 : (rand(1, GLYPHS.length) | 0)), tint: rand(-1.8, 1.8), flick: rand(0, TAU), born: 0 };
    rand();
    g.born = growAt(g.y);
    glyphs.push(g);
  }
  // Whorls of slightly drooping branches break up the smooth cone.
  for (let tier = 1; tier <= 23; tier++) {
    const y0 = (tier / 24) * HEIGHT;
    const branchCount = 7 + ((tier * 7) % 6);
    for (let branch = 0; branch < branchCount; branch++) {
      const a0 = branch / branchCount * TAU + rand(-0.16, 0.16);
      const fullR = RADIUS * (1 - y0 / HEIGHT);
      for (let j = 0; j < 34; j++) {
        const v = (j + rand()) / 34;
        const r = fullR * (0.20 + 0.94 * v);
        const angle = a0 + 0.13 * Math.sin(v * 4 + branch);
        const y = y0 - 0.032 * v * v + rand(-0.008, 0.008);
        const g = { x: Math.cos(angle) * r + rand(-0.012, 0.012), y, z: Math.sin(angle) * r + rand(-0.012, 0.012), char: pick([0, 0, 0, 1, 2, 5]), tint: rand(-1, 1.8), flick: rand(0, TAU), born: 0 };
        rand();
        g.born = growAt(g.y);
        glyphs.push(g);
      }
    }
  }
  // Fine gold strands in helices along the fir.
  const garland: { x: number; y: number; z: number; char: number; flick: number; born: number }[] = [];
  for (let i = 0; i < 2150; i++) {
    const ny = 0.08 + 0.86 * i / 2150;
    const a = ny * TAU * 5.25 + 0.7;
    const r = RADIUS * (1 - ny) ** 0.92 * (1.035 + rand(-0.04, 0.04));
    garland.push({ x: Math.cos(a) * r, y: ny * HEIGHT + rand(-0.013, 0.013), z: Math.sin(a) * r, char: pick([1, 2, 4, 8]), flick: (rand(), rand(0, TAU)), born: decorAt(i / 2150) });
  }
  const snowOnTree: { x: number; y: number; z: number; char: number; phase: number; born: number }[] = [];
  for (let i = 0; i < 420; i++) {
    const ny = rand(0.08, 0.99), a = rand(0, TAU), r = RADIUS * (1 - ny) ** 0.92 * rand(0.84, 1.05);
    snowOnTree.push({ x: Math.cos(a) * r, y: ny * HEIGHT, z: Math.sin(a) * r, char: pick([1, 2, 9]), phase: rand(0, TAU), born: decorAt(i / 420) });
  }
  const baubles: { x: number; y: number; z: number; type: number; radius: number; born: number }[] = [];
  for (let i = 0; i < 78; i++) {
    const ny = rand(0.09, 0.96), a = rand(0, TAU), r = RADIUS * (1 - ny) ** 0.92 * 1.04;
    const type = pick([0, 0, 0, 0, 1, 1, 1, 2]);
    baubles.push({ x: Math.cos(a) * r, y: ny * HEIGHT, z: Math.sin(a) * r, type, radius: rand(0.014, 0.033) * (1.09 - 0.3 * ny), born: (rand(), decorAt(i / 78)) });
  }
  type GiftGlyph = { x: number; y: number; z: number; col: number; char: number; phase: number; born: number };
  const gifts: GiftGlyph[][] = [];
  function addGift(cx: number, cz: number, sx: number, sy: number, sz: number, col: number, ribbon: number) {
    const box: GiftGlyph[] = [];
    const step = 0.016;
    for (const side of ['top', 'left', 'right', 'front', 'back']) {
      const ni = Math.ceil(sx / step), nj = Math.ceil((side === 'top' ? sz : sy) / step);
      for (let i = 0; i <= ni; i++) for (let j = 0; j <= nj; j++) {
        if (rand() < 0.17) continue;
        const u = i / ni - 0.5, v = j / nj - 0.5;
        let x = cx + u * sx, y = 0, z = cz;
        if (side === 'top') { y = sy + 0.012; z = cz + v * sz; }
        else { y = sy * (v + 0.5); z = cz + (side === 'front' ? sz / 2 : side === 'back' ? -sz / 2 : v * sz); if (side === 'left') x = cx - sx / 2; if (side === 'right') x = cx + sx / 2; }
        const ribbonOn = (side === 'top' ? Math.abs(u) < 0.11 || Math.abs(v) < 0.11 : Math.abs(u) < 0.11);
        box.push({ x, y, z, col: ribbonOn ? ribbon : col, char: ribbonOn ? pick([1, 4, 4, 5]) : pick([0, 1, 2, 4, 7]), phase: rand(0, TAU), born: unsmooth(7.3, 10.2, y / 0.31) });
      }
    }
    // A small bow on each.
    for (let i = 0; i < 30; i++) {
      const a = i / 30 * TAU, rr = 0.041 * (0.6 + 0.4 * Math.sin(a * 2) ** 2);
      box.push({ x: cx + Math.cos(a) * rr, y: sy + 0.02 + Math.sin(a) * 0.016, z: cz + Math.sin(a) * rr, col: ribbon, char: 4, phase: rand(0, TAU), born: unsmooth(7.3, 10.2, (sy + 0.02) / 0.31) });
    }
    gifts.push(box);
  }
  addGift(-0.47, 0.50, 0.28, 0.23, 0.23, 16, 13);
  addGift(0.53, 0.38, 0.30, 0.21, 0.26, 25, 14);
  addGift(0.12, 0.73, 0.23, 0.13, 0.20, 17, 22);
  addGift(-0.80, 0.26, 0.17, 0.16, 0.19, 11, 22);
  addGift(0.76, 0.68, 0.18, 0.12, 0.17, 20, 17);
  const sky = Array.from({ length: 400 }, () => ({ x: rand(), y: rand(), r: rand(0.3, 1.15), speed: rand(0.0015, 0.008), phase: rand(0, TAU), alpha: rand(0.18, 0.75) }));
  const falling = Array.from({ length: 170 }, () => ({ x: rand(), y: rand(), speed: rand(0.012, 0.060), drift: rand(0.002, 0.022), size: rand(0.6, 1.55), phase: rand(0, TAU) }));
  // White sparkles that wink on and off across the tree's surface.
  const sparkles = Array.from({ length: 170 }, () => {
    const ny = rand(0.04, 0.97), a = rand(0, TAU), r = RADIUS * (1 - ny) ** 0.92 * rand(0.92, 1.08);
    return { x: Math.cos(a) * r, y: ny * HEIGHT, z: Math.sin(a) * r, rate: rand(0.35, 0.9), phase: rand(), size: rand(2.2, 5.5) };
  });

  function resize() {
    const rect = wrap.getBoundingClientRect();
    W = Math.max(100, rect.width); H = Math.max(100, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    const mobile = W < 650;
    ch = mobile ? 7.5 : 8.5; cw = mobile ? 5.1 : 5.8;
    cols = Math.ceil(W / cw); rows = Math.ceil(H / ch);
    depthBuffer = new Float32Array(cols * rows);
    glyphBuffer = new Uint8Array(cols * rows);
    colorBuffer = new Uint8Array(cols * rows);
    whiteBuffer = new Uint8Array(cols * rows);
    activeBuffer = new Uint8Array(cols * rows);
    // Leaves room above the star for the section title over the top of the night.
    unit = Math.min(H * 0.3, W * 0.55);
    baseY = H * 0.88;
    paintBackdrop();
    render(simTime);
  }

  function paintBackdrop() {
    backdrop.width = canvas.width; backdrop.height = canvas.height;
    const c = backdrop.getContext('2d')!;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = '#070b13'; c.fillRect(0, 0, W, H);
    const g = c.createRadialGradient(W * 0.5, H * 0.61, H * 0.05, W * 0.5, H * 0.61, Math.max(W * 0.66, H * 0.8));
    g.addColorStop(0, '#121e2e'); g.addColorStop(0.40, '#0b1322'); g.addColorStop(1, '#060911');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    ground(c);
  }

  /** A soft round glow in `color`, solid to `core` of its radius, then fading out. */
  function glowSprite(color: string, core: number) {
    const key = color + core;
    let sprite = glowSprites.get(key);
    if (!sprite) {
      sprite = document.createElement('canvas');
      sprite.width = sprite.height = 64;
      const c = sprite.getContext('2d')!;
      const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, color); g.addColorStop(core, color); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.fillRect(0, 0, 64, 64);
      glowSprites.set(key, sprite);
    }
    return sprite;
  }

  // Screen-aligned cells act as a Z-buffer: nearer glyphs hide farther ones.
  let angle = 0, sinA = 0, cosA = 1;
  function project(x: number, y: number, z: number) {
    const px = x * cosA - z * sinA, dz = z * cosA + x * sinA;
    const persp = 1 - 0.12 * dz;
    return [W * 0.5 + px * unit * persp, baseY - y * unit + dz * unit * 0.14, dz];
  }
  /** `white` 0..1: how freshly born, so how close to white it's drawn. */
  function plot(x: number, y: number, z: number, char: number, color: number, boost = 0, white = 0) {
    const p = project(x, y, z);
    const col = (p[0] / cw) | 0, row = (p[1] / ch) | 0;
    if (col < 0 || row < 0 || col >= cols || row >= rows) return;
    const idx = row * cols + col, dep = p[2] + boost;
    if (!activeBuffer[idx] || dep >= depthBuffer[idx]) {
      if (!activeBuffer[idx]) { touched.push(idx); activeBuffer[idx] = 1; }
      depthBuffer[idx] = dep;
      glyphBuffer[idx] = char;
      colorBuffer[idx] = color;
      whiteBuffer[idx] = Math.round(clamp(white) * (LEVELS - 1));
    }
  }
  const whiteness = (t: number, born: number, span: number) => 1 - smooth(0, span, t - born);
  const noise = (a: number, b: number) => { const n = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return n - Math.floor(n); };

  function skyAndSnow(t: number) {
    const c = ctx!;
    c.drawImage(backdrop, 0, 0, W, H);
    for (const s of sky) {
      const x = s.x * W, y = s.y * H;
      const blink = 0.65 + 0.35 * Math.sin(t * 1.25 + s.phase);
      c.fillStyle = `rgba(192,207,215,${s.alpha * blink * 0.72})`;
      c.fillRect(x, y, s.r, s.r);
      if (s.r > 1.04 && blink > 0.85) c.fillRect(x - 2, y + 0.2, 4, 0.4);
    }
    c.font = `${Math.max(6, ch)}px Menlo,Consolas,monospace`;
    for (const f of falling) {
      const y = ((f.y + (t * f.speed) % 1) % 1) * H;
      const x = ((f.x + Math.sin(t * 0.5 + f.phase) * f.drift) % 1) * W;
      c.fillStyle = `rgba(212,222,219,${0.19 + f.size * 0.11})`;
      if (f.size > 1.3) c.fillText('*', x, y);
      else c.fillRect(x, y, f.size, f.size);
    }
  }
  function ground(c: CanvasRenderingContext2D) {
    const glow = c.createRadialGradient(W * 0.5, baseY, 8, W * 0.5, baseY, unit * 0.92);
    glow.addColorStop(0, 'rgba(151,178,156,.13)'); glow.addColorStop(0.3, 'rgba(82,107,99,.07)'); glow.addColorStop(1, 'rgba(13,25,29,0)');
    c.fillStyle = glow; c.fillRect(W * 0.5 - unit, baseY - unit * 0.44, unit * 2, unit * 1.2);
    // A dotted, terminal-style ground plane.
    c.font = `${Math.max(6, ch * 0.94)}px Menlo,Consolas,monospace`;
    for (let j = 0; j < 20; j++) {
      const yy = baseY - 20 + j * ch * 0.94;
      if (yy > H - 15) break;
      const strength = (0.13 + 0.16 * Math.sin(j * 0.24)) * (1 - 0.15 * j / 20);
      c.fillStyle = `rgba(174,190,182,${strength})`;
      const spacing = cw * 1.5;
      const offset = (j % 2) * spacing * 0.55;
      for (let xx = -spacing; xx < W + spacing; xx += spacing) {
        const dd = Math.abs(xx - W * 0.5) / (W * 0.5);
        if (noise(xx, j) < 0.10 + dd * 0.12) continue;
        c.fillText((j + Math.floor(xx / spacing)) % 4 === 0 ? '-' : '.', xx + offset, yy);
      }
    }
    // Icy characters around the trunk.
    c.font = `${ch * 0.93}px Menlo,Consolas,monospace`;
    for (let i = 0; i < 400; i++) {
      const a = i * 2.39996, r = Math.sqrt((i + 0.5) / 400) * RADIUS * unit * 1.22;
      c.fillStyle = `rgba(187,201,191,${0.18 + 0.2 * (i % 7) / 7})`;
      c.fillText(i % 5 === 0 ? '*' : '.', W * 0.5 + Math.cos(a) * r, baseY + Math.sin(a) * r * 0.18);
    }
  }
  function tree(t: number) {
    const c = ctx!;
    const grow = smooth(0.1, 4.6, t);
    const decorate = smooth(5.8, 9.8, t);
    const presents = smooth(7.3, 10.2, t);
    const starPower = smooth(7.8, 10.2, t);
    angle = t * TAU / CYCLE + pointerX * 0.10;
    sinA = Math.sin(angle); cosA = Math.cos(angle);
    touched.length = 0; activeBuffer.fill(0);
    const maxY = HEIGHT * grow;
    for (let i = 0; i < glyphs.length; i++) {
      const p = glyphs[i]; if (p.y > maxY + 0.005) continue;
      const dz = p.z * cosA + p.x * sinA;
      let shade = 3 + dz * 4 + p.tint + Math.sin(p.y * 25 + i * 0.11) * 0.45;
      shade += 0.3 * Math.sin(t * 1.6 + p.flick);
      plot(p.x, p.y, p.z, p.char, Math.floor(clamp(shade, 0, 9)), 0, whiteness(t, p.born, LEAF_BIRTH));
    }
    // A white cross-section rides up the tip of the growing tree.
    if (grow < 0.995) {
      const rad = RADIUS * (1 - grow) ** 0.92;
      const n = Math.max(60, Math.floor(1900 * rad * rad));
      for (let i = 0; i < n; i++) {
        const a = i * 2.399963, r = Math.sqrt((i + 0.5) / n) * rad;
        plot(Math.cos(a) * r, maxY + 0.006 + Math.sin(i * 0.3 + t) * 0.002, Math.sin(a) * r, (i % 11 === 0 ? 4 : i % 4 === 0 ? 1 : 7), i % 8 < 2 ? 23 : (i % 3 ? 22 : 21), 0.09, 1);
      }
    }
    const orbs: { x: number; y: number; r: number; white: number; color: string }[] = [];
    if (decorate > 0) {
      for (let i = 0; i < garland.length; i++) {
        const p = garland[i]; if (p.y > HEIGHT * grow || (i / garland.length) > decorate) continue;
        const dz = p.z * cosA + p.x * sinA;
        const glimmer = Math.sin(t * 2.2 + p.flick) * 0.5 + 0.5;
        plot(p.x, p.y, p.z, p.char, dz > -0.15 ? (glimmer > 0.89 ? 14 : glimmer > 0.50 ? 12 : 11) : 10, 0.025, whiteness(t, p.born, DECOR_BIRTH));
      }
      for (let i = 0; i < snowOnTree.length; i++) {
        const p = snowOnTree[i]; if (p.y > maxY || i / snowOnTree.length > decorate) continue;
        if (Math.sin(t * 1.3 + p.phase) > 0.12) plot(p.x, p.y, p.z, p.char, p.z > 0 ? 22 : 21, 0.055);
      }
      for (let i = 0; i < baubles.length; i++) {
        const b = baubles[i]; if (i / baubles.length > decorate || b.y > maxY) continue;
        const dz = b.z * cosA + b.x * sinA;
        if (dz < -0.10) continue;
        const white = whiteness(t, b.born, DECOR_BIRTH);
        const base = b.type === 0 ? 16 : b.type === 1 ? 12 : 21;
        for (let k = 0; k < 17; k++) {
          const a = k * 2.399963, r = Math.sqrt((k + 0.5) / 17) * b.radius;
          let col = base;
          if (k % 5 === 0) col += b.type === 0 ? 3 : b.type === 1 ? 2 : 1;
          else if (k % 4 === 0) col += 1;
          plot(b.x + Math.cos(a) * r, b.y + Math.sin(a) * r, b.z + 0.003, k % 7 === 0 ? 4 : k % 3 === 0 ? 1 : 0, col, 0.09, white);
        }
        const p = project(b.x, b.y, b.z);
        orbs.push({ x: p[0], y: p[1], r: b.radius * unit, white, color: COLORS[base + 2] });
      }
    }
    if (presents > 0) {
      for (const box of gifts) {
        for (const p of box) {
          if (presents < 1 && p.y > presents * 0.31) continue;
          const bright = Math.sin(t * 1.8 + p.phase) > 0.87 ? 1 : 0;
          // Presents stay put beside the tree while it turns.
          const fixedX = p.x * cosA + p.z * sinA, fixedZ = p.z * cosA - p.x * sinA;
          plot(fixedX, p.y, fixedZ, p.char, Math.min(COLORS.length - 1, p.col + bright), 0.4, whiteness(t, p.born, DECOR_BIRTH));
        }
      }
    }

    // Soft light behind each bauble, white-hot as it's born.
    c.globalCompositeOperation = 'lighter';
    for (const o of orbs) {
      const radius = o.r * (2.6 + 2.2 * o.white);
      c.globalAlpha = 0.16 + 0.1 * o.white;
      c.drawImage(glowSprite(o.color, 0.35), o.x - radius, o.y - radius, radius * 2, radius * 2);
      if (o.white > 0.02) {
        const core = radius * 0.6;
        c.globalAlpha = 0.55 * o.white;
        c.drawImage(glowSprite('#ffffff', 0), o.x - core, o.y - core, core * 2, core * 2);
      }
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';

    c.font = `${Math.max(6, ch * 0.98)}px Menlo,Consolas,'Courier New',monospace`;
    c.textBaseline = 'alphabetic';
    c.textAlign = 'left';
    touched.sort((a, b) => a - b);
    let last = '';
    for (const idx of touched) {
      const fill = SHADES[colorBuffer[idx]][whiteBuffer[idx]];
      if (fill !== last) { c.fillStyle = fill; last = fill; }
      c.fillText(GLYPHS[glyphBuffer[idx]], (idx % cols) * cw, ((idx / cols) | 0) * ch + ch * 0.8);
    }
    drawSparkles(t, maxY);
    if (starPower > 0.01) drawStar(starPower, t);
  }
  function drawSparkles(t: number, maxY: number) {
    const c = ctx!;
    c.globalCompositeOperation = 'lighter';
    c.strokeStyle = '#ffffff';
    for (const s of sparkles) {
      if (s.y > maxY) continue;
      const dz = s.z * cosA + s.x * sinA;
      if (dz < -0.05) continue;
      // Each winks once per cycle of its own: a quick swell, then gone.
      const phase = (t * s.rate + s.phase) % 1;
      let k = phase <= 0.22 ? Math.sin(phase / 0.22 * Math.PI) : 0;
      // All of them at once, flickering, right after a click.
      if (flashK > 0) k = Math.max(k, flashK * (0.55 + 0.45 * Math.sin(s.phase * 40 + t * 25)));
      if (k <= 0.01) continue;
      const [x, y] = project(s.x, s.y, s.z);
      const size = s.size * k * (0.8 + 0.3 * dz);
      c.globalAlpha = 0.5 * k;
      c.drawImage(glowSprite('#ffffff', 0), x - size * 1.6, y - size * 1.6, size * 3.2, size * 3.2);
      c.globalAlpha = k;
      c.lineWidth = 0.9;
      c.beginPath();
      c.moveTo(x - size, y); c.lineTo(x + size, y);
      c.moveTo(x, y - size); c.lineTo(x, y + size);
      c.stroke();
      c.globalAlpha = 1;
    }
    c.globalCompositeOperation = 'source-over';
  }
  function drawStar(power: number, t: number) {
    const c = ctx!;
    const p = project(0, HEIGHT + 0.055, 0); const x = p[0], y = p[1];
    const pulse = (0.86 + 0.14 * Math.sin(t * 3.2)) * (1 + 0.7 * flashK);
    c.save(); c.globalAlpha = power;
    const glow = c.createRadialGradient(x, y, 0, x, y, Math.max(27, unit * 0.17));
    glow.addColorStop(0, 'rgba(255,238,129,.42)');
    glow.addColorStop(0.35, 'rgba(255,198,70,.16)');
    glow.addColorStop(1, 'rgba(239,169,59,0)');
    c.fillStyle = glow; c.fillRect(x - 90, y - 90, 180, 180);
    c.shadowColor = '#ffe59d'; c.shadowBlur = 14 * pulse;
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4 + 0.04 * Math.sin(t * 0.4), len = (i % 2 === 0 ? unit * 0.155 : unit * 0.09) * pulse;
      const dx = Math.sin(a), dy = Math.cos(a);
      c.strokeStyle = `rgba(255,206,97,${i % 2 === 0 ? 0.7 : 0.32})`;
      c.lineWidth = i % 2 === 0 ? 1.2 : 0.7;
      c.setLineDash(i % 2 === 0 ? [2, 4] : [1, 6]);
      c.beginPath(); c.moveTo(x + dx * 9, y + dy * 9); c.lineTo(x + dx * len, y + dy * len); c.stroke();
    }
    c.setLineDash([]);
    c.fillStyle = '#ffd95a'; c.font = `bold ${Math.max(13, unit * 0.047)}px Menlo,Consolas,monospace`;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('*', x, y);
    c.font = `${Math.max(8, unit * 0.026)}px Menlo,Consolas,monospace`;
    c.fillStyle = '#fff4bd'; c.fillText('+', x, y - 1);
    c.shadowBlur = 0; c.restore();
  }
  // MARK: Click to sparkle
  // A click on the tree sends a wave of glowing ASCII sparks off its outline, starting at the height clicked and racing
  // up and down the edges; the star flares and every sparkle on the tree flashes at once. Real time, not simTime.
  type Spark = { x: number; y: number; vx: number; vy: number; born: number; life: number; char: string; color: string };
  const bursts: Spark[] = [];
  const BURST_GLYPHS = ['*', '+', 'x', 'o', '.', "'", '*', '+', '*'];
  const BURST_COLORS = ['#ffffff', '#ffffff', '#fff4bd', '#ffd95a', COLORS[18], COLORS[8], COLORS[26], COLORS[13]];
  const FLASH = 0.9;
  let flashAt = -10, flashK = 0;
  const halfWidth = (ny: number) => RADIUS * (1 - clamp(ny)) ** 0.92 * unit * 1.04;

  /** How far up the tree (0 base, 1 tip) a point is, or null if it isn't on the grown tree. */
  function onTree(x: number, y: number) {
    const ny = (baseY - y) / (HEIGHT * unit);
    if (ny < -0.04 || ny > smooth(0.1, 4.6, simTime) + 0.06) return null;
    return Math.abs(x - W / 2) <= halfWidth(ny) + 22 ? clamp(ny) : null;
  }

  function burst(from: number) {
    const now = performance.now() / 1000;
    flashAt = now;
    const spark = (x: number, y: number, dx: number, dy: number, delay: number, speed: number) => {
      const len = Math.hypot(dx, dy) || 1;
      bursts.push({
        x, y, vx: dx / len * speed, vy: dy / len * speed, born: now + delay, life: 1.3 + Math.random() * 1.4,
        char: BURST_GLYPHS[(Math.random() * BURST_GLYPHS.length) | 0], color: BURST_COLORS[(Math.random() * BURST_COLORS.length) | 0],
      });
    };
    for (let i = 0; i < 380; i++) {
      const ny = Math.random(), side = Math.random() < 0.5 ? -1 : 1;
      const x = W / 2 + side * halfWidth(ny) * (0.9 + Math.random() * 0.18);
      // Off the edge and a little up, fanned out.
      spark(x, baseY - ny * HEIGHT * unit, side + (Math.random() - 0.5) * 0.9, -0.35 + (Math.random() - 0.5) * 0.9,
        Math.abs(ny - from) * 0.55 + Math.random() * 0.08, 60 + Math.random() * 190);
    }
    const [sx, sy] = project(0, HEIGHT + 0.055, 0);
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * TAU;
      spark(sx, sy, Math.cos(a), Math.sin(a), Math.abs(1 - from) * 0.55 + Math.random() * 0.05, 40 + Math.random() * 110);
    }
    if (bursts.length > 1500) bursts.splice(0, bursts.length - 1500);
  }

  function drawBursts(now: number) {
    if (!bursts.length) return;
    const c = ctx!;
    c.font = `bold ${Math.max(8, ch * 1.25)}px Menlo,Consolas,monospace`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const glow = Math.max(8, ch * 1.6);
    for (let i = bursts.length - 1; i >= 0; i--) {
      const p = bursts[i];
      const age = now - p.born;
      if (age < 0) continue;
      if (age > p.life) { bursts[i] = bursts[bursts.length - 1]; bursts.pop(); continue; }
      const k = age / p.life;
      const alpha = (1 - k) ** 1.5 * Math.min(1, age / 0.08);
      // Drifts out, slowing, and floats up like an ember.
      const x = p.x + p.vx * age * (1 - k * 0.4), y = p.y + p.vy * age * (1 - k * 0.4) - 16 * age * age;
      c.globalCompositeOperation = 'lighter';
      c.globalAlpha = alpha * 0.75;
      c.drawImage(glowSprite(p.color, 0), x - glow, y - glow, glow * 2, glow * 2);
      c.globalCompositeOperation = 'source-over';
      c.globalAlpha = alpha;
      c.fillStyle = p.color;
      c.fillText(p.char, x, y);
    }
    c.globalAlpha = 1;
  }

  // Builds itself once, then just keeps turning (one turn every CYCLE seconds); it never starts over.
  function render(t: number) {
    const now = performance.now() / 1000;
    flashK = clamp(1 - (now - flashAt) / FLASH);
    skyAndSnow(t);
    tree(t);
    drawBursts(now);
  }
  function loop(now: number) {
    raf = requestAnimationFrame(loop);
    if (!lastFrame) lastFrame = now;
    const dt = Math.min((now - lastFrame) / 1000, 0.05); lastFrame = now;
    if (!reducedMotion) simTime += dt;
    // Up to 30fps, enough for a soft terminal animation.
    if (now - lastDraw >= 32) { render(simTime); lastDraw = now; }
  }

  const onMove = (e: PointerEvent) => {
    const b = wrap.getBoundingClientRect();
    pointerX = clamp((e.clientX - b.left) / b.width * 2 - 1, -1, 1);
    if (!reducedMotion) canvas.style.cursor = onTree(e.clientX - b.left, e.clientY - b.top) === null ? '' : 'pointer';
  };
  const onLeave = () => { pointerX = 0; };
  const onClick = (e: MouseEvent) => {
    if (reducedMotion) return;
    const b = wrap.getBoundingClientRect();
    const ny = onTree(e.clientX - b.left, e.clientY - b.top);
    if (ny !== null) burst(ny);
  };
  wrap.addEventListener('pointermove', onMove);
  wrap.addEventListener('pointerleave', onLeave);
  wrap.addEventListener('click', onClick);
  const resizer = new ResizeObserver(resize);
  resizer.observe(wrap);
  // Runs only while on screen; it starts growing the first time it's seen.
  const watcher = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !raf) {
      if (!started && !reducedMotion) simTime = 0;
      started = true;
      lastFrame = 0;
      raf = requestAnimationFrame(loop);
    } else if (!visible && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }, { threshold: 0.25 });
  watcher.observe(wrap);
  resize();

  return () => {
    cancelAnimationFrame(raf);
    resizer.disconnect();
    watcher.disconnect();
    wrap.removeEventListener('pointermove', onMove);
    wrap.removeEventListener('pointerleave', onLeave);
    wrap.removeEventListener('click', onClick);
  };
}
