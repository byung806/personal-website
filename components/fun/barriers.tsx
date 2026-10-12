import { useCallback } from 'react';
import PaintedCanvas from '@/components/launchpad/painted-canvas';
import { rng } from '@/lib/pencil';

/** Hard visual barriers between themed sections. */

/**
 * Paints a torn paper edge at the canvas's real size (so it looks the same on phones and wide
 * screens). The edge wanders in long, slow curves, is ragged up close, and now and then has a bite
 * taken out. Along it runs the paper's white torn core, wider in some places than others, with loose
 * fibers, and a soft shadow on whatever the paper lies over. Paper fills below the edge; `flip` puts
 * it above instead.
 */
function paintTear(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, color: string, flip: boolean) {
  const r = rng(seed);
  if (flip) {
    ctx.translate(w, h);
    ctx.scale(-1, -1);
  }
  const STEP = 2;
  const waves = [0, 1, 2].map((i) => ({ amp: [h * 0.2, h * 0.09, 1.2][i] * (0.6 + r() * 0.8), len: [260, 90, 30][i] * (0.7 + r() * 0.6), phase: r() * 7 }));
  const edge: number[] = [];
  const core: number[] = [];
  let walk = 0;
  let bite = 0;
  let biteDepth = 0;
  let biteLen = 1;
  for (let x = 0; x <= w + STEP; x += STEP) {
    walk = walk * 0.85 + (r() - 0.5) * 2.4; // ragged up close
    if (bite <= 0 && r() < 0.008) {
      biteLen = 8 + Math.floor(r() * 16);
      bite = biteLen;
      biteDepth = (r() < 0.5 ? -1 : 1) * (3 + r() * 6);
    }
    const nip = bite > 0 ? Math.sin((Math.PI * bite--) / biteLen) * biteDepth : 0;
    let y = h * 0.55 + nip + walk;
    for (const v of waves) y += Math.sin(x / v.len + v.phase) * v.amp;
    edge.push(y);
    core.push(1 + 3.5 * (0.5 + 0.5 * Math.sin(x / (90 + seed * 7) + seed)) * (0.5 + r() * 0.5));
  }
  const shape = (offset: (i: number) => number) => {
    ctx.beginPath();
    ctx.moveTo(0, h + 2);
    edge.forEach((y, i) => ctx.lineTo(i * STEP, y - offset(i)));
    ctx.lineTo(w + STEP, h + 2);
    ctx.closePath();
  };

  // Shadow cast on what's beneath, just beyond the edge
  ctx.save();
  ctx.filter = 'blur(2.5px)';
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  shape((i) => core[i] + 1.5);
  ctx.fill();
  ctx.restore();

  // The white torn core, then loose fibers off it
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  shape((i) => core[i]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 0.6;
  for (let i = 0; i < edge.length; i += 1 + Math.floor(r() * 5)) {
    const x = i * STEP;
    const y = edge[i] - core[i];
    const a = -Math.PI / 2 + (r() - 0.5) * 1.6;
    const len = 1 + r() * 3.5;
    ctx.beginPath();
    ctx.moveTo(x, y + 0.5);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }

  // The paper, with a faint mottle so it isn't flat
  ctx.fillStyle = color;
  shape(() => 0);
  ctx.fill();
  ctx.save();
  ctx.clip();
  for (let i = 0; i < w / 3; i++) {
    ctx.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.035)' : 'rgba(255,255,255,0.05)';
    ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 1);
  }
  ctx.restore();
}

/**
 * Torn paper edge: the next section's paper ripped over the one above. `color` is the paper. It
 * overlaps the section above (clear past the tear), so that section shows through. `below` flips it:
 * the paper of the section above, torn along its bottom over the one below. Each `seed` tears
 * differently.
 */
export function TornEdge({ color, below = false, seed = 1 }: { color: string; below?: boolean; seed?: number }) {
  const paint = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => paintTear(ctx, w, h, seed, color, below),
    [seed, color, below],
  );
  return (
    <div aria-hidden className={`relative z-10 h-14 md:h-16 pointer-events-none ${below ? '-mb-14 md:-mb-16' : '-mt-14 md:-mt-16'}`}>
      {/* Runs a pixel past the paper side so no hairline shows against the section */}
      <PaintedCanvas paint={paint} grain={0} className={`absolute left-0 w-full h-[calc(100%_+_1px)] ${below ? '-top-px' : 'top-0'}`} />
    </div>
  );
}

/** Scratchy hand-inked double rule, like a fountain pen dragged across the page. */
export function InkRule({ color }: { color: string }) {
  return (
    <svg aria-hidden viewBox="0 0 1200 14" preserveAspectRatio="none" className="block w-full h-3.5">
      <filter id="ink-rule">
        <feTurbulence type="fractalNoise" baseFrequency="0.02 0.6" numOctaves="2" seed="4" />
        <feDisplacementMap in="SourceGraphic" scale="3" />
      </filter>
      <g filter="url(#ink-rule)" stroke={color} fill="none" strokeLinecap="round">
        <path d="M0 4 C300 3, 700 6, 1200 4" strokeWidth="2.2" />
        <path d="M0 10 C400 11, 800 8, 1200 10" strokeWidth="1.2" opacity="0.7" />
      </g>
    </svg>
  );
}

/** Dusk, top to bottom: white, peach, rose, lilac, then the indigo of the night sky (as [t, r, g, b, alpha]). */
const DUSK: [number, number, number, number, number][] = [
  [0, 255, 255, 255, 1], // the canvas starts up in the wall's white padding, so it can begin coloring at once
  [0.12, 252, 232, 220, 1],
  [0.28, 238, 196, 200, 1],
  [0.45, 186, 160, 210, 0.96],
  [0.63, 98, 82, 152, 0.82],
  [0.82, 32, 27, 72, 0.5],
  [1, 12, 9, 33, 0],
];

function duskAt(t: number) {
  let i = 1;
  while (i < DUSK.length - 1 && DUSK[i][0] < t) i++;
  const [t0, ...a] = DUSK[i - 1];
  const [t1, ...b] = DUSK[i];
  const k = Math.max(0, Math.min(1, (t - t0) / (t1 - t0)));
  const e = k * k * (3 - 2 * k);
  return a.map((v, j) => v + (b[j] - v) * e);
}

/**
 * Paints the dusk for `Dissolve`: white sky turning through peach, rose and lilac into night. It's a
 * wide dome, so the light lingers longest in the middle like the last glow over the horizon.
 * A fine grain keeps the gradient from banding.
 */
function paintDusk(ctx: CanvasRenderingContext2D) {
  const r = rng(23);
  const { width: cw, height: ch } = ctx.canvas;
  const img = ctx.createImageData(cw, ch);
  const d = img.data;
  for (let py = 0; py < ch; py++) {
    const y = py / ch;
    for (let px = 0; px < cw; px++) {
      const off = (px / cw - 0.5) * 2; // -1 at the left edge, 1 at the right
      const t = Math.pow(y, 1 + 0.25 * (1 - off * off)); // lingers in the middle (a dome), yet reaches 1 at the bottom everywhere
      const [cr, cg, cb, ca] = duskAt(t);
      const grain = (r() - 0.5) * 9;
      const i = (py * cw + px) * 4;
      d[i] = cr + grain;
      d[i + 1] = cg + grain;
      d[i + 2] = cb + grain;
      d[i + 3] = Math.max(0, Math.min(255, ca * 255 + grain * ca));
    }
  }
  ctx.putImageData(img, 0, 0);
}

/**
 * The white page above turning to night: laid over the top of the next section, a dusk sky fades
 * from white through sunset colors into it, with stars coming out. Place it between the two sections.
 */
export function Dissolve({ className = 'h-[280px] md:h-[360px]' }: { className?: string }) {
  return (
    <div aria-hidden className="relative z-10 h-0 pointer-events-none">
      {/* Starts up in the wall's bottom padding, in solid white, so the edge of the section below never shows */}
      <div className={`absolute inset-x-0 -top-24 ${className}`}>
        <PaintedCanvas paint={paintDusk} grain={0} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
}
