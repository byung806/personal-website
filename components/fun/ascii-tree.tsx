'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NAME_MAX, ORNAMENTS, WISH_MAX, type HungOrnament, type OrnamentKind } from '@/lib/ornaments';

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

/**
 * A rotating ASCII Christmas tree, every needle, light and present a character in a terminal grid with a depth
 * buffer. Ported from Bryan's standalone "ASCII Christmas Tree" study, made more magical: everything is born white
 * and cools into its color, so the tree and its decorations glow into being like orbs from nothing; white sparkles
 * twinkle across it; and the colors are more vivid. It grows when scrolled into view and sleeps offscreen.
 *
 * Visitors hang ornaments on it: once it has built itself, everyone's ornaments glow on and a panel fades in to pick
 * one, sign it (with an optional wish) and click a spot on the tree. Hovering an ornament shows who hung it.
 */
/** `children` (the section title) sits over the top of the night, above the tree. */
export default function AsciiTree({ className = '', children }: { className?: string; children?: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nightRef = useRef<HTMLCanvasElement>(null);
  const treeRef = useRef<HTMLCanvasElement>(null);
  const handle = useRef<TreeHandle>();
  const [built, setBuilt] = useState(false);
  const [hover, setHover] = useState<{ ornament: HungOrnament; x: number; y: number } | null>(null);
  const [kind, setKind] = useState<OrnamentKind>('red');
  const [name, setName] = useState('');
  const [wish, setWish] = useState('');
  const [placing, setPlacing] = useState(false);
  const [status, setStatus] = useState<{ text: string; error?: boolean } | null>(null);
  // The form's latest values, for the click on the tree (which the tree reports through a hook set up once).
  const form = useRef({ kind, name, wish });
  form.current = { kind, name, wish };

  useEffect(() => {
    const wrap = wrapRef.current;
    const night = nightRef.current;
    const tree = treeRef.current;
    if (!wrap || !night || !tree) return;
    const h = startTree(wrap, night, tree, {
      onBuilt: () => setBuilt(true),
      onHover: (ornament, x, y) => setHover(ornament ? { ornament, x, y } : null),
      onPlace: async (height, angle) => {
        h?.setPlacing(false);
        setPlacing(false);
        setStatus({ text: 'hanging it...' });
        try {
          const res = await fetch('/api/ornaments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: form.current.name, wish: form.current.wish, kind: form.current.kind, height, angle }),
          });
          const body = await res.json();
          if (!res.ok) throw new Error(body.error || 'Something went wrong');
          h?.add([body]);
          setWish('');
          setStatus({ text: 'hung it! hover it to see it' });
        } catch (e) {
          setStatus({ text: e instanceof Error ? e.message : 'Something went wrong', error: true });
        }
      },
    });
    handle.current = h;
    fetch('/api/ornaments').then((r) => (r.ok ? r.json() : [])).then((list: HungOrnament[]) => h?.add(list)).catch(() => {});
    return () => h?.stop();
  }, []);

  const startPlacing = () => {
    if (!name.trim()) return setStatus({ text: 'put your name on it first', error: true });
    setStatus(null);
    setPlacing(true);
    handle.current?.setPlacing(true);
  };
  const cancelPlacing = () => {
    setPlacing(false);
    handle.current?.setPlacing(false);
  };
  // Escape backs out of placing, as the box's "esc" says.
  useEffect(() => {
    if (!placing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setPlacing(false);
      handle.current?.setPlacing(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [placing]);
  const swatch = ORNAMENTS.find((o) => o.id === kind)!;

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`}>
      {/* The night (sky, ground, snow) at 1x over the whole section; the tree at full resolution in just its own box. */}
      <canvas ref={nightRef} role="img" aria-label="An ASCII Christmas tree growing, decorating itself and sparkling, hung with visitors' ornaments" className="absolute inset-0 block h-full w-full" />
      <canvas ref={treeRef} aria-hidden className="pointer-events-none absolute block" />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ boxShadow: 'inset 0 0 130px 34px #060910bd' }} />
      {children && <div className="pointer-events-none relative">{children}</div>}

      {/* Who hung the ornament under the pointer */}
      {hover && (
        <div
          className="pointer-events-none absolute z-20 max-w-[220px] -translate-x-1/2 -translate-y-full rounded-lg border border-white/10 bg-[#0b1220]/90 px-3 py-2 text-[11px] leading-snug text-[#dce6df] shadow-xl"
          style={{ left: hover.x, top: hover.y - 14, fontFamily: MONO }}
        >
          <div style={{ color: ORNAMENTS.find((o) => o.id === hover.ornament.kind)?.swatch }}>{hover.ornament.username}</div>
          {hover.ornament.wish && <div className="mt-0.5 text-[#dce6df]/75">&ldquo;{hover.ornament.wish}&rdquo;</div>}
        </div>
      )}

      {/* Hang an ornament: fades in once the tree has built itself. Drawn as a little terminal box, in the tree's own
          characters, rather than a floating card. */}
      <div
        className={`absolute bottom-20 left-4 z-20 text-[12px] leading-[1.6] text-[#c9d6cf] transition-opacity duration-1000 md:bottom-auto md:left-[calc(50%+max(100svh,640px)*0.12)] md:top-[52%] ${built ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        style={{ fontFamily: MONO }}
      >
        <div className="w-[34ch] bg-[#070b12]/85">
          <Rule label="hang an ornament" />
          {placing ? (
            <Row>
              <span>
                <span style={{ color: swatch.swatch }}>{swatch.glyph}</span> click a spot on the tree
              </span>
              <button onClick={cancelPlacing} className="text-[#c9d6cf]/45 hover:text-[#c9d6cf]">esc</button>
            </Row>
          ) : (
            <>
              <Row>
                <span className="flex gap-[1ch]">
                  {ORNAMENTS.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setKind(o.id)}
                      aria-label={o.label}
                      aria-pressed={kind === o.id}
                      title={o.label}
                      className="font-bold"
                      style={kind === o.id ? { background: o.swatch, color: '#070b12' } : { color: o.swatch }}
                    >
                      [{o.glyph}]
                    </button>
                  ))}
                </span>
              </Row>
              <Row>
                <label className="flex w-full">
                  <span className="text-[#ffd95a]">name&gt;&nbsp;</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} maxLength={NAME_MAX} placeholder="________" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#c9d6cf]/25" />
                </label>
              </Row>
              <Row>
                <label className="flex w-full">
                  <span className="text-[#ffd95a]">wish&gt;&nbsp;</span>
                  <input value={wish} onChange={(e) => setWish(e.target.value)} maxLength={WISH_MAX} placeholder="(optional)" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#c9d6cf]/25" />
                </label>
              </Row>
              <Row>
                <button onClick={startPlacing} className="hover:bg-[#c9d6cf] hover:text-[#070b12]">[ hang it ]</button>
              </Row>
            </>
          )}
          {status && !placing && (
            <Row>
              <span className={status.error ? 'text-[#ff8a8a]' : 'text-[#c9d6cf]/60'}>{status.text}</span>
            </Row>
          )}
          <Rule />
        </div>
      </div>
    </div>
  );
}

/** A border line of the ornament box, `+-- label ----+`, filling its 34ch width. */
function Rule({ label }: { label?: string }) {
  const text = label ? `+-- ${label} ` : '+';
  return <div aria-hidden={!label} className="whitespace-pre text-[#c9d6cf]/50">{text + '-'.repeat(33 - text.length) + '+'}</div>;
}
/** A line inside the ornament box, between its side borders. */
function Row({ children }: { children: ReactNode }) {
  return (
    <div className="flex whitespace-pre">
      <span aria-hidden className="text-[#c9d6cf]/50">| </span>
      <span className="flex min-w-0 flex-1 items-center justify-between gap-[1ch]">{children}</span>
      <span aria-hidden className="text-[#c9d6cf]/50"> |</span>
    </div>
  );
}

const CYCLE = 20;
const TAU = Math.PI * 2;
const HEIGHT = 1.66;
const RADIUS = 0.66;
const GLYPHS = 'x+*:o%/=-.#@&';
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
  '#9c2a63', '#d6438f', '#ff6fae', '#ffb3d4', // pink 31..34 (visitors' ornaments)
  '#3d2a8a', '#6b4ad6', '#9b7bff', '#cbb8ff', // purple 35..38
];
/** Visitor ornaments use the same character alphabet as the tree, with no painted body. */
const ORNAMENT_LOOK: Record<string, { color: number; rows: [string, string, string] }> = {
  red: { color: 17, rows: ['  +  ', ' <#> ', ' /+\\ '] },
  gold: { color: 13, rows: [' \\|/ ', '--*--', ' /|\\ '] },
  silver: { color: 22, rows: ['  +  ', '<###>', '  +  '] },
  blue: { color: 26, rows: [' /+\\ ', '<@#@>', ' \\+/ '] },
  pink: { color: 33, rows: [' \\*/ ', '<%%%>', ' /*\\ '] },
  purple: { color: 37, rows: ['  +  ', ' /&\\ ', ' \\#/ '] },
};
/** When the tree has finished building and decorating itself: visitors' ornaments glow on after this. */
const BUILT_AT = 10.4;
const BUILD_SPEED = 2.6; // 10.4 simulated seconds in about four real seconds.
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

/**
 * Two canvases keep it cheap: the night (backdrop painted once, plus twinkling stars and falling snow) at 1x across the
 * whole section, and the tree, its lights and star at full resolution on a canvas only as big as the tree, so the
 * sharp, busy part of each frame covers a fraction of the screen.
 */
type TreeHooks = {
  /** The tree has finished building (once). */
  onBuilt: () => void;
  /** The pointer is over a visitor's ornament (null when it leaves one); x and y are in the section's pixels. */
  onHover: (ornament: HungOrnament | null, x: number, y: number) => void;
  /** While placing, the visitor clicked a spot on the tree. */
  onPlace: (height: number, angle: number) => void;
};
export type TreeHandle = {
  stop: () => void;
  /** Hangs ornaments: ones loaded together glow on one after another; a single new one glows on right away. */
  add: (ornaments: HungOrnament[]) => void;
  setPlacing: (placing: boolean) => void;
};

function startTree(wrap: HTMLElement, night: HTMLCanvasElement, canvas: HTMLCanvasElement, hooks: TreeHooks): TreeHandle | undefined {
  const bg = night.getContext('2d', { alpha: false });
  const ctx = canvas.getContext('2d');
  if (!ctx || !bg) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let simTime = reducedMotion ? 13.5 : 0, lastFrame = 0, lastDraw = 0, raf = 0, visible = false, started = false;
  let cw = 6.2, ch = 8.8, cols = 0, rows = 0, W = 0, H = 0, unit = 0, baseY = 0, dpr = 1;
  let boxX = 0, boxY = 0;
  // Glyph cells bucketed by (color, whiteness) each frame, so text is drawn one fill color at a time.
  let order = new Int32Array(0);
  const bucketStart = new Int32Array(COLORS.length * LEVELS + 1);
  let depthBuffer = new Float32Array(0), glyphBuffer = new Uint8Array(0), colorBuffer = new Uint8Array(0);
  let whiteBuffer = new Uint8Array(0), activeBuffer = new Uint8Array(0);
  const touched: number[] = [];
  let pointerX = 0;
  // Visitors' ornaments, when each glows on (sim time), where each was drawn last frame (for hovering), and placing.
  type Hung = { data: HungOrnament; born: number };
  const hung: Hung[] = [];
  const hits: { x: number; y: number; o: Hung }[] = [];
  let hovered: Hung | null = null;
  let placing = false;
  let built = false;
  // Caches that keep each frame cheap: the still sky and ground painted once, and soft glows as sprites instead of
  // fresh gradients.
  const backdrop = document.createElement('canvas');
  const glowSprites = new Map<string, HTMLCanvasElement>();

  // Stable, deterministic random values keep the tree's shape as it turns.
  const rng = mulberry32(7);
  const rand = (lo = 0, hi = 1) => lo + (hi - lo) * rng();
  const pick = <T,>(a: T[]) => a[(rng() * a.length) | 0];
  const growAt = (y: number) => unsmooth(0.1, 4.6, (y - 0.005) / HEIGHT);
  const decorAt = (share: number) => unsmooth(4.0, 9.8, share);

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
    night.width = Math.round(W); night.height = Math.round(H);
    const mobile = W < 650;
    ch = mobile ? 7.5 : 8.5; cw = mobile ? 5.1 : 5.8;
    cols = Math.ceil(W / cw); rows = Math.ceil(H / ch);
    depthBuffer = new Float32Array(cols * rows);
    glyphBuffer = new Uint8Array(cols * rows);
    colorBuffer = new Uint8Array(cols * rows);
    whiteBuffer = new Uint8Array(cols * rows);
    activeBuffer = new Uint8Array(cols * rows);
    order = new Int32Array(cols * rows);
    // Leaves room above the star for the section title over the top of the night.
    unit = Math.min(H * 0.3, W * 0.55);
    baseY = H * 0.88;
    // The tree's box: wide enough for the presents (with perspective) and the lights' glow, from above the star's glow
    // down past the presents nearest the viewer.
    const halfW = unit * 1.05 + 30;
    boxX = Math.max(0, Math.floor(W / 2 - halfW));
    boxY = Math.max(0, Math.floor(baseY - (HEIGHT + 0.055) * unit - Math.max(92, unit * 0.17)));
    const boxW = Math.min(W, Math.ceil(W / 2 + halfW)) - boxX;
    const boxH = Math.min(H, Math.ceil(baseY + unit * 0.25 + ch * 2)) - boxY;
    Object.assign(canvas.style, { left: `${boxX}px`, top: `${boxY}px`, width: `${boxW}px`, height: `${boxH}px` });
    canvas.width = Math.round(boxW * dpr); canvas.height = Math.round(boxH * dpr);
    paintBackdrop();
    render(simTime);
  }

  function paintBackdrop() {
    backdrop.width = night.width; backdrop.height = night.height;
    const c = backdrop.getContext('2d')!;
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
    const c = bg!;
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
    // Drawn in section coordinates, shifted into the tree's box.
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.setTransform(dpr, 0, 0, dpr, -boxX * dpr, -boxY * dpr);
    const grow = smooth(0.1, 4.6, t);
    const decorate = smooth(4.0, 9.8, t);
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
    // Visitors' ornaments, once the tree has built itself, each glowing on white like everything else on it.
    hits.length = 0;
    const ornaments: { x: number; y: number; rows: [string, string, string]; color: number; white: number; shade: number }[] = [];
    for (const o of hung) {
      if (t < o.born) continue;
      const look = ORNAMENT_LOOK[o.data.kind] ?? ORNAMENT_LOOK.red;
      const r = RADIUS * (1 - o.data.height) ** 0.92 * 1.06;
      const x = Math.cos(o.data.angle) * r, z = Math.sin(o.data.angle) * r, y = o.data.height * HEIGHT;
      const dz = z * cosA + x * sinA;
      if (dz < -0.12) continue;
      const white = Math.max(whiteness(t, o.born, DECOR_BIRTH), o === hovered ? 0.35 : 0);
      const p = project(x, y, z);
      if (dz > -0.02) ornaments.push({ x: p[0], y: p[1], rows: look.rows, color: look.color, white, shade: clamp(0.75 + dz * 0.4, 0.45, 1) });
      if (dz > 0) hits.push({ x: p[0], y: p[1], o });
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

    // Soft light behind the tree's own baubles, white-hot as they're born.
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
    // Counting sort by (color, whiteness), then one fillStyle per run.
    bucketStart.fill(0);
    for (const idx of touched) bucketStart[colorBuffer[idx] * LEVELS + whiteBuffer[idx] + 1]++;
    for (let k = 1; k < bucketStart.length; k++) bucketStart[k] += bucketStart[k - 1];
    for (const idx of touched) order[bucketStart[colorBuffer[idx] * LEVELS + whiteBuffer[idx]]++] = idx;
    let last = -1;
    for (let k = 0; k < touched.length; k++) {
      const idx = order[k];
      const key = colorBuffer[idx] * LEVELS + whiteBuffer[idx];
      if (key !== last) { c.fillStyle = SHADES[colorBuffer[idx]][whiteBuffer[idx]]; last = key; }
      c.fillText(GLYPHS[glyphBuffer[idx]], (idx % cols) * cw, ((idx / cols) | 0) * ch + ch * 0.8);
    }
    drawVisitorOrnaments(ornaments);
    drawSparkles(t, maxY);
    if (starPower > 0.01) drawStar(starPower, t);
  }
  /** Each visitor ornament is a three-line ASCII motif, scaled above the tree's single-cell lights. */
  function drawVisitorOrnaments(ornaments: { x: number; y: number; rows: [string, string, string]; color: number; white: number; shade: number }[]) {
    if (!ornaments.length) return;
    const c = ctx!;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = `bold ${Math.max(10, ch * 1.5)}px Menlo,Consolas,monospace`;
    for (const ornament of ornaments) {
      const level = Math.round(clamp(ornament.white) * (LEVELS - 1));
      c.globalAlpha = ornament.shade;
      c.fillStyle = SHADES[ornament.color][level];
      ornament.rows.forEach((row, i) => c.fillText(row, ornament.x, ornament.y + (i - 1) * ch * 1.55));
    }
    c.globalAlpha = 1;
    c.textAlign = 'left';
    c.textBaseline = 'alphabetic';
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
      if (phase > 0.22) continue;
      const k = Math.sin(phase / 0.22 * Math.PI);
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
    const pulse = 0.86 + 0.14 * Math.sin(t * 3.2);
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
  // Builds itself once, then just keeps turning (one turn every CYCLE seconds); it never starts over.
  function render(t: number) {
    skyAndSnow(t);
    tree(t);
  }
  function loop(now: number) {
    raf = requestAnimationFrame(loop);
    if (!lastFrame) lastFrame = now;
    // Real time even on a slow machine (capped only so a long stall, like a hidden tab, doesn't jump ahead).
    const dt = Math.min((now - lastFrame) / 1000, 0.25); lastFrame = now;
    if (!reducedMotion) simTime += dt * (built ? 1 : BUILD_SPEED);
    // Up to 30fps, enough for a soft terminal animation.
    if (now - lastDraw >= 32) { render(simTime); lastDraw = now; }
    if (!built && simTime >= BUILT_AT) { built = true; hooks.onBuilt(); }
  }

  /** Where on the tree a point in the section lands, as (height, angle), or null if it misses the tree. */
  function treeSpot(sx: number, sy: number) {
    let height = (baseY - sy) / (HEIGHT * unit), angle = 0;
    for (let k = 0; k < 4; k++) {
      if (height < 0.04 || height > 0.97) return null;
      const r = RADIUS * (1 - height) ** 0.92 * 1.06;
      const px = (sx - W / 2) / unit;
      // On the front of the tree, cos(angle + turn) is how far across it the point is.
      const c = px / r;
      if (Math.abs(c) > 1.08) return null;
      const front = Math.acos(clamp(c, -1, 1));
      const dz = r * Math.sin(front);
      const persp = 1 - 0.12 * dz;
      const across = clamp(px / persp / r, -1, 1);
      angle = Math.acos(across) - Math.atan2(sinA, cosA);
      height = (baseY + dz * unit * 0.14 - sy) / (HEIGHT * unit);
    }
    return { height: clamp(height, 0.04, 0.96), angle };
  }

  const onMove = (e: PointerEvent) => {
    const b = wrap.getBoundingClientRect();
    const x = e.clientX - b.left, y = e.clientY - b.top;
    pointerX = clamp(x / b.width * 2 - 1, -1, 1);
    if (placing) {
      night.style.cursor = treeSpot(x, y) ? 'crosshair' : '';
      return;
    }
    let best: Hung | null = null, bestD = 27 * 27, bx = 0, by = 0;
    for (const h of hits) {
      const d = (h.x - x) ** 2 + (h.y - y) ** 2;
      if (d < bestD) { bestD = d; best = h.o; bx = h.x; by = h.y; }
    }
    if (best !== hovered) {
      hovered = best;
      night.style.cursor = best ? 'pointer' : '';
      hooks.onHover(best?.data ?? null, bx, by);
    }
  };
  const onLeave = () => {
    pointerX = 0;
    if (hovered) { hovered = null; hooks.onHover(null, 0, 0); }
  };
  const onClick = (e: MouseEvent) => {
    if (!placing) return;
    const b = wrap.getBoundingClientRect();
    const spot = treeSpot(e.clientX - b.left, e.clientY - b.top);
    if (spot) hooks.onPlace(spot.height, spot.angle);
  };
  wrap.addEventListener('pointermove', onMove);
  wrap.addEventListener('pointerleave', onLeave);
  night.addEventListener('click', onClick);
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

  return {
    stop: () => {
      cancelAnimationFrame(raf);
      resizer.disconnect();
      watcher.disconnect();
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
      night.removeEventListener('click', onClick);
    },
    add: (ornaments) => {
      const start = Math.max(BUILT_AT + 0.2, simTime);
      // A batch (everyone's, on load) glows on one after another over about three seconds; one new one at once.
      const step = ornaments.length > 1 ? Math.min(0.08, 3 / ornaments.length) : 0;
      ornaments.forEach((data, i) => hung.push({ data, born: start + i * step }));
    },
    setPlacing: (p) => {
      placing = p;
      night.style.cursor = '';
      if (p && hovered) { hovered = null; hooks.onHover(null, 0, 0); }
    },
  };
}
