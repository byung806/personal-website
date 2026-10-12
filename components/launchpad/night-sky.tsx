'use client';

import { useEffect, useRef } from 'react';

/**
 * A living night sky, after tinycamp.site's night mode (techniques studied from its source):
 * - Milky way, drawn once: a haze of dust stars plus ~200 star clusters strung along a diagonal,
 *   each a few rings of tiny stars tinted from cyan at the edges of the band to pink-violet at its heart.
 * - Glitter: a layer of stars redrawn ten times a second with a random brightness and pastel hue.
 * - Shooting stars: every few seconds, and wherever you click.
 * - A trail of small lilac diamonds behind the cursor.
 * Pauses when off screen; with reduced motion it stays still.
 */

const BG = 'radial-gradient(#0b1628, #0c0921)';
const SHOOTING_COLORS = ['#D1B678', '#5461AD', '#ED9BAF', '#4E97B7'];
const TRAIL_COLOR = 'rgba(162,127,189,0.6)';

type Glitter = { x: number; y: number; size: number };
type Shooter = { x: number; y: number; vx: number; vy: number; life: number; color: string };
type Spark = { x: number; y: number; size: number; vx: number; vy: number };

const SHOOTER_LIFE = 60;

/** Random in [min, max), pulled toward `bias` by up to `influence`. */
function biased(min: number, max: number, bias: number, influence: number) {
  const v = min + Math.random() * (max - min);
  const k = Math.random() * influence;
  return v * (1 - k) + bias * k;
}

function drawMilkyWay(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const bandH = h * 0.7;
  const slope = 0.6 * (h / 900); // keeps the band's angle similar on short and tall skies
  const bandY = (x: number) => bandH / 2 + (w / 2 - x) * slope;
  const pickX = () => Math.floor(biased(w / 5, (4 * w) / 5, (1.7 * w) / 3, 0.3));

  // Dust: very fine stars hugging the band (normal-ish spread), plus a thin sprinkle everywhere
  const spread = () => (Math.random() + Math.random() + Math.random() - 1.5) * bandH * 0.45;
  for (let i = 0; i < (w / 1.5) * 10; i++) {
    const x = Math.random() * w;
    const band = i % 4 !== 0;
    ctx.beginPath();
    ctx.arc(x, band ? bandY(x) + spread() : Math.random() * h, Math.random() * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(0,100%,100%,${(band ? 0.4 : 0.25) + Math.random() * 0.5})`;
    ctx.fill();
  }

  // Clusters along the band
  const RINGS = 10;
  const PER_RING = 12;
  for (let c = 0; c < (w * 1.4) / 10; c++) {
    const x = pickX();
    const y = Math.floor(Math.pow(Math.random(), 1.5) * bandH * 0.6 * (Math.random() - 0.5) + bandY(x) + (Math.random() - 0.5) * 100);
    const toCenter = Math.max(0, (1 - Math.abs(x - w / 2) / (w / 2)) * (1 - Math.abs(y - bandH / 2) / (bandH / 2)));
    const size = 100 + Math.random() * 100;
    const hue = 180 + Math.floor((Math.random() * 0.5 + toCenter * 0.5) * 140);
    const light = 50 + Math.random() * 10;

    for (let ring = 1; ring < RINGS; ring++) {
      const radius = (size * ring) / RINGS;
      for (let i = 1; i < PER_RING; i++) {
        const px = x + 2 * radius * (Math.random() - 0.5);
        const py = y + 2 * Math.sqrt(Math.max(0, radius * radius - (x - px) ** 2)) * (Math.random() - 0.5);
        let r = 0.4 + Math.random() * 0.4;
        let a = 0.3 + Math.random() * 0.15;
        if (i === PER_RING - 1) { r += 1.5; a = Math.max(0.02, a - 0.4); } // a few soft, larger motes
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue},100%,${light + 15 + 15 * toCenter + Math.random() * 10}%,${a})`;
        ctx.fill();
      }
    }
    const glow = ctx.createRadialGradient(x, y, 0, x, y, size);
    glow.addColorStop(0, `hsla(${hue},100%,${light}%,0.002)`);
    glow.addColorStop(0.25, `hsla(${hue},100%,${light + 30}%,${0.012 + 0.012 * toCenter})`);
    glow.addColorStop(0.4, `hsla(${hue},100%,${light + 15}%,0.006)`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - size, y - size, size * 2, size * 2);
  }
}

/** Smooth value noise in [0, 1], summed over a few octaves. */
const NOISE_SEED = Array.from({ length: 512 }, () => Math.random());
function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const h = (i: number, j: number) => NOISE_SEED[(((i * 73) ^ (j * 151)) & 511 + 512) % 512];
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const top = h(xi, yi) + (h(xi + 1, yi) - h(xi, yi)) * u;
  const bottom = h(xi, yi + 1) + (h(xi + 1, yi + 1) - h(xi, yi + 1)) * u;
  return top + (bottom - top) * v;
}
function fbm(x: number, y: number) {
  let sum = 0;
  let amp = 0.5;
  for (let o = 0; o < 4; o++) {
    sum += noise(x, y) * amp;
    x *= 2.03;
    y *= 2.03;
    amp *= 0.5;
  }
  return sum / 0.9375;
}

/**
 * Paints a per-pixel layer over the band at a third of the resolution and scales it up smooth. It
 * walks along and across the band, so the band can curve. `color(s, n, k)` gets the position along
 * the band (0 to 1), across it (in band widths, 0 at the center line) and nearness to the core, and
 * returns [r, g, b, alpha].
 */
function paintBand(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: (s: number, n: number, k: number) => number[],
  at: (s: number, n: number) => number[],
  near: (s: number) => number,
  width: (s: number) => number,
  L: number,
) {
  const S = 3;
  const W = Math.ceil(w / S);
  const H = Math.ceil(h / S);
  const layer = document.createElement('canvas');
  layer.width = W;
  layer.height = H;
  const lctx = layer.getContext('2d')!;
  const img = lctx.createImageData(W, H);
  for (let s = 0; s <= 1; s += S / 2 / L) {
    const wd = width(s);
    for (let n = -2.5; n <= 2.5; n += S / 2 / wd) {
      const [x, y] = at(s, n * wd);
      const px = Math.round(x / S);
      const py = Math.round(y / S);
      if (px < 0 || py < 0 || px >= W || py >= H) continue;
      const [r, g, b, a] = color(s, n, near(s));
      const i = (py * W + px) * 4;
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
      img.data[i + 3] = Math.max(0, Math.min(255, a * 255));
    }
  }
  lctx.putImageData(img, 0, 0);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(layer, 0, 0, W * S, H * S);
}

/**
 * A purple milky way for the launchpad, in the same colors as the banner's: it swoops low over the
 * hills, where its dusty core is, then thins into a trail of stars climbing up through the dusk, as
 * if it runs on up to the galaxy at the top of the page. Crisp field stars everywhere.
 */
function drawArch(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // A quadratic curve: in from the left, down low over the hills, and up off the top right
  // On tall, narrow screens the curve runs wider than the sky, so it doesn't fold into a V
  const span = Math.max(w, h * 0.8);
  const X = (f: number) => w * 0.33 + (f - 0.33) * span; // the core stays a third of the way in
  const lift = w < 640 ? 0.1 * h : 0; // phones have more ground, so the band sits higher
  const P0 = [X(-0.05), 0.3 * h - lift];
  const P1 = [X(0.4), 0.85 * h - lift];
  const P2 = [X(0.95), -0.05 * h - lift];
  const at = (s: number, n: number) => {
    const t = 1 - s;
    const x = t * t * P0[0] + 2 * t * s * P1[0] + s * s * P2[0];
    const y = t * t * P0[1] + 2 * t * s * P1[1] + s * s * P2[1];
    const tx = 2 * t * (P1[0] - P0[0]) + 2 * s * (P2[0] - P1[0]);
    const ty = 2 * t * (P1[1] - P0[1]) + 2 * s * (P2[1] - P1[1]);
    const len = Math.hypot(tx, ty);
    return [x - (ty / len) * n, y + (tx / len) * n];
  };
  let L = 0;
  for (let i = 0; i < 50; i++) {
    const [x0, y0] = at(i / 50, 0);
    const [x1, y1] = at((i + 1) / 50, 0);
    L += Math.hypot(x1 - x0, y1 - y0);
  }
  const CORE = 0.4;
  const near = (s: number) => Math.max(0, 1 - Math.abs(s - CORE) / 0.35);
  const taper = (s: number) => (s < 0.6 ? 1 : 1 - ((s - 0.6) / 0.4) * 0.65); // the trail narrows as it climbs
  const width = (s: number) => L * (0.035 + 0.045 * near(s)) * taper(s) * (0.8 + 0.4 * noise(s * 6, 2.5));
  const spread = () => Math.random() + Math.random() + Math.random() - 1.5;
  const coreBiased = () => (Math.random() < 0.45 ? CORE + spread() * 0.2 : Math.random());

  // Field stars, a few of them bright
  for (let i = 0; i < (w * h) / 600; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, Math.random() < 0.04 ? 0.9 + Math.random() * 0.6 : Math.random() * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.25 + Math.random() * 0.6})`;
    ctx.fill();
  }

  // The band's glow, lumpy like star clouds: violet along its length, pinker at the core
  paintBand(ctx, w, h, (s, n, k) => {
    const lump = 0.35 + 0.9 * fbm(s * 9, n * 1.5 + 7);
    const a = Math.exp(-n * n * 1.6) * (0.08 + 0.22 * k) * lump;
    return k > 0.4 ? [196, 150, 230, a] : [140, 130, 225, a];
  }, at, near, width, L);

  // Dust of tiny stars packed into the band
  for (let i = 0; i < L * 18; i++) {
    const s = coreBiased();
    const [x, y] = at(s, spread() * width(s) * 0.75);
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${250 + Math.random() * 50},90%,90%,${0.3 + Math.random() * 0.55})`;
    ctx.fill();
  }

  // Star clumps tinted like the banner's: cyan at the edges of the band to pink-violet at its heart
  for (let c = 0; c < L / 3; c++) {
    const s = coreBiased();
    const k = near(s);
    const [x, y] = at(s, spread() * width(s) * 0.5);
    const size = (10 + Math.random() * 30 + k * 25) * taper(s);
    const hue = 190 + Math.floor((Math.random() * 0.5 + k * 0.5) * 130);
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.pow(Math.random(), 0.7) * size;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 0.3 + Math.random() * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue},100%,${75 + Math.random() * 15}%,${0.35 + Math.random() * 0.4})`;
      ctx.fill();
    }
  }

  // Dust lanes: ridged noise stretched along the band makes dark threads that branch and fade,
  // strongest just off the band's center through the core
  paintBand(ctx, w, h, (s, n, k) => {
    const ridge = Math.pow(1 - Math.abs(2 * fbm(s * 14 + 3, n * 2.2) - 1), 5);
    const a = Math.exp(-(n + 0.15) * (n + 0.15) * 2.2) * ridge * (0.3 + 0.5 * k);
    return [12, 9, 33, a];
  }, at, near, width, L);
}

/**
 * A thin trail of stars peeling off the banner's milky way and curving down out of the bottom right,
 * where the launchpad's milky way climbs out of its dusk: the same river of stars, top and bottom.
 */
function drawTrail(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const slope = 0.6 * (h / 900); // matches drawMilkyWay's band
  const P0 = [w * 0.58, h * 0.35 + (w / 2 - w * 0.58) * slope];
  const P1 = [w * 0.9, h * 0.45];
  const P2 = [w * 0.86, h * 1.02];
  const at = (s: number) => {
    const t = 1 - s;
    return [t * t * P0[0] + 2 * t * s * P1[0] + s * s * P2[0], t * t * P0[1] + 2 * t * s * P1[1] + s * s * P2[1]];
  };
  const spread = () => Math.random() + Math.random() + Math.random() - 1.5;
  const width = (s: number) => h * (0.05 - 0.03 * s); // narrows as it falls away from the band

  for (let i = 0; i < w * 4; i++) {
    const s = Math.random();
    const [x, y] = at(s);
    ctx.beginPath();
    ctx.arc(x + spread() * width(s), y + spread() * width(s) * 0.6, Math.random() * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${250 + Math.random() * 50},90%,90%,${(0.3 + Math.random() * 0.5) * (1 - s * 0.4)})`;
    ctx.fill();
  }
  for (let c = 0; c < w / 25; c++) {
    const s = Math.random();
    const [x0, y0] = at(s);
    const x = x0 + spread() * width(s) * 0.6;
    const y = y0 + spread() * width(s) * 0.4;
    const size = (8 + Math.random() * 20) * (1 - s * 0.5);
    const hue = 190 + Math.floor(Math.random() * 130);
    for (let i = 0; i < 25; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.pow(Math.random(), 0.7) * size;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 0.3 + Math.random() * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue},100%,${75 + Math.random() * 15}%,${0.3 + Math.random() * 0.35})`;
      ctx.fill();
    }
  }
}

/**
 * Just a glimpse of sky: a faint haze of dust stars and a violet stream of stars slanting down
 * through it on the right, where the banner's trail leaves and the launchpad's arrives.
 */
function drawGlimpse(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const spread = () => Math.random() + Math.random() + Math.random() - 1.5;
  for (let i = 0; i < w * 1.5; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${250 + Math.random() * 50},80%,90%,${0.15 + Math.random() * 0.4})`;
    ctx.fill();
  }
  // Slanting down to the right with a gentle bend, from the banner's trail toward the launchpad's
  const at = (s: number) => [w * (0.8 + 0.08 * s) - Math.sin(s * Math.PI) * Math.min(40, w * 0.05), -10 + s * (h + 20)];
  const width = Math.min(48, w * 0.06);

  // The band's violet glow, brighter toward its center line
  for (let s = 0; s <= 1; s += 0.01) {
    const [x, y] = at(s);
    const r = width * (1.6 + Math.random() * 0.8);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `hsla(${270 + Math.random() * 25},75%,68%,${0.05 + Math.random() * 0.05})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < h * 30; i++) {
    const [x, y] = at(Math.random());
    ctx.beginPath();
    ctx.arc(x + spread() * width, y + spread() * 8, Math.random() * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${250 + Math.random() * 50},90%,90%,${0.4 + Math.random() * 0.5})`;
    ctx.fill();
  }
  for (let c = 0; c < h / 5; c++) {
    const [x0, y0] = at(Math.random());
    const x = x0 + spread() * width * 0.6;
    const size = 8 + Math.random() * 16;
    const hue = 190 + Math.floor(Math.random() * 130);
    for (let i = 0; i < 25; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.pow(Math.random(), 0.7) * size;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * d, y0 + Math.sin(a) * d, 0.3 + Math.random() * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue},100%,${75 + Math.random() * 15}%,${0.35 + Math.random() * 0.4})`;
      ctx.fill();
    }
  }
}

export default function NightSky({ className = '', galaxy = 'diagonal', trail = false }: { className?: string; galaxy?: 'diagonal' | 'arch' | 'glimpse'; trail?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const milkyRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const milky = milkyRef.current;
    const live = liveRef.current;
    if (!wrap || !milky || !live) return;
    const mctx = milky.getContext('2d');
    const lctx = live.getContext('2d');
    if (!mctx || !lctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let glitter: Glitter[] = [];
    let shooters: Shooter[] = [];
    let sparks: Spark[] = [];

    const sizeTo = () => {
      const nw = wrap.clientWidth;
      const nh = wrap.clientHeight;
      if (!nw || !nh || (nw === w && nh === h)) return;
      w = nw;
      h = nh;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const [c, ctx] of [[milky, mctx], [live, lctx]] as const) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      ({ diagonal: drawMilkyWay, arch: drawArch, glimpse: drawGlimpse })[galaxy](mctx, w, h);
      if (trail) drawTrail(mctx, w, h);
      glitter = Array.from({ length: Math.round((500 * w * h) / (1440 * 900)) }, () => {
        const size = 0.6 + Math.random() * 0.6;
        return { x: Math.random() * w, y: Math.random() * h, size };
      });
      drawLive(true);
    };

    let lastGlitter = 0;
    const glitterLayer = document.createElement('canvas');
    const gctx = glitterLayer.getContext('2d')!;

    // Glitter is redrawn ten times a second into its own layer; shooting stars and sparks every frame.
    const drawLive = (refreshGlitter: boolean) => {
      if (refreshGlitter) {
        glitterLayer.width = live.width;
        glitterLayer.height = live.height;
        gctx.setTransform(live.width / w, 0, 0, live.height / h, 0, 0);
        for (const s of glitter) {
          gctx.beginPath();
          gctx.arc(s.x, s.y, Math.max(0.2, s.size + (Math.random() - 0.8) * 0.5), 0, Math.PI * 2);
          gctx.fillStyle = `hsla(${Math.floor(Math.random() * 160)},100%,85%,${Math.random() * 0.6})`;
          gctx.fill();
        }
      }
      lctx.save();
      lctx.setTransform(1, 0, 0, 1, 0, 0);
      lctx.clearRect(0, 0, live.width, live.height);
      lctx.drawImage(glitterLayer, 0, 0);
      lctx.restore();

      lctx.lineWidth = 1.2;
      lctx.lineCap = 'round';
      shooters = shooters.filter((s) => s.life > 0);
      for (const s of shooters) {
        s.life--;
        s.x += s.vx;
        s.y += s.vy;
        const half = SHOOTER_LIFE / 2;
        const age = Math.pow(1 - Math.abs(s.life - half) / half, 2);
        const ex = s.x - s.vx * 8 * age;
        const ey = s.y - s.vy * 8 * age;
        const g = lctx.createLinearGradient(s.x, s.y, ex, ey);
        g.addColorStop(0, '#fff');
        g.addColorStop(Math.min(age, 0.7), s.color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        lctx.strokeStyle = g;
        lctx.beginPath();
        lctx.moveTo(s.x, s.y);
        lctx.lineTo(ex, ey);
        lctx.stroke();
      }

      sparks = sparks.filter((p) => p.size > 0.05);
      lctx.fillStyle = TRAIL_COLOR;
      for (const p of sparks) {
        p.x += p.vx;
        p.y += p.vy;
        p.size -= 0.04;
        lctx.beginPath();
        lctx.moveTo(p.x, p.y);
        lctx.lineTo(p.x - p.size / 2, p.y + p.size / 2);
        lctx.lineTo(p.x, p.y + p.size);
        lctx.lineTo(p.x + p.size / 2, p.y + p.size / 2);
        lctx.closePath();
        lctx.fill();
      }
    };

    const shoot = (x = Math.random() * w, y = Math.random() * Math.min(150, h * 0.3)) => {
      shooters.push({
        x,
        y,
        vx: (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 11) * 0.5,
        vy: (2 + Math.random() * 6) * 0.5,
        life: SHOOTER_LIFE,
        color: SHOOTING_COLORS[Math.floor(Math.random() * SHOOTING_COLORS.length)],
      });
    };

    const observer = new ResizeObserver(sizeTo);
    observer.observe(wrap);
    sizeTo();

    if (reduce) return () => observer.disconnect();

    // Only animate while visible
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(wrap);

    let raf = 0;
    let nextShot = performance.now() + 1200;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || !w) return;
      if (now > nextShot) {
        shoot();
        nextShot = now + 1200 + Math.random() * 2300;
      }
      const refresh = now - lastGlitter > 100;
      if (refresh) lastGlitter = now;
      drawLive(refresh);
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > w || y > h) return;
      for (let i = 0; i < 5; i++) {
        sparks.push({ x, y, size: 0.8 + Math.random() * 2, vx: (Math.random() * 0.75 - 0.25) * 2, vy: (Math.random() * 0.75 - 0.25) * 2 });
      }
    };
    const onClick = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > w || y > h) return;
      shoot(x, y);
    };
    // Listen on the window so elements layered over the sky don't block the trail
    window.addEventListener('pointermove', onMove);
    wrap.parentElement?.addEventListener('click', onClick);

    return () => {
      observer.disconnect();
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      wrap.parentElement?.removeEventListener('click', onClick);
    };
  }, [galaxy, trail]);

  return (
    <div ref={wrapRef} aria-hidden className={className} style={{ background: BG }}>
      <canvas ref={milkyRef} className="absolute inset-0 w-full h-full" />
      <canvas ref={liveRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
