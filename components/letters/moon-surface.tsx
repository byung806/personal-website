'use client';

import PaintedCanvas from '@/components/launchpad/painted-canvas';
import { PLANETS } from '@/components/launchpad/planet-paint';
import { INK } from '@/components/launchpad/paint';
import { pencilFill, pencilOutline, rng, type Pt } from '@/lib/pencil';

/** How far the horizon dips at the sides, in px. */
const CURVE = 90;

/**
 * The ground of a giant moon filling a w×h box: its horizon bows across the top (highest in the
 * middle) and the hatched surface runs to the bottom, scattered with craters.
 */
function paintMoon(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const r = rng(17);
  const look = PLANETS.letters;
  const top = 6;
  const horizon = (x: number) => top + CURVE * ((x - w / 2) / (w / 2)) ** 2;
  const rim: Pt[] = Array.from({ length: 25 }, (_, i) => {
    const x = -10 + ((w + 20) * i) / 24;
    return [x, horizon(x)];
  });
  // Run the sides straight down in steps, so the smooth outline doesn't overshoot at the corners
  const side = (x: number): Pt[] => Array.from({ length: 6 }, (_, i) => [x, horizon(x) + ((h + 10 - horizon(x)) * (i + 1)) / 6]);
  pencilFill(ctx, r, [...rim, ...side(w + 10), ...side(-10).reverse()], look.wash, [
    { color: look.light, angle: -0.25, density: 1.6, len: [8, 18], width: 1 },
    { color: look.light, angle: -0.2, density: 6, len: [6, 14], width: 1, where: (x, y) => y < horizon(x) + 70 },
    { color: look.shade, angle: -0.3, density: 0.35, len: [5, 10], width: 0.8 },
  ], 1);

  // Craters, flattened since we see them nearly edge-on, more of them further down
  const n = Math.round((w * h) / 26000);
  for (let i = 0; i < n; i++) {
    const x = r() * w;
    const y = horizon(x) + 30 + Math.pow(r(), 0.8) * (h - horizon(x));
    const s = 6 + r() * 22 * Math.min(1, w / 900);
    const crater: Pt[] = Array.from({ length: 12 }, (_, k) => {
      const a = (k / 12) * Math.PI * 2;
      return [x + Math.cos(a) * s, y + Math.sin(a) * s * 0.42];
    });
    pencilFill(ctx, r, crater, `${look.shade}40`, [{ color: look.shade, angle: -2.6, density: 14, len: [3, 7], width: 0.8, where: (_, cy) => cy < y + s * 0.1 }], 1);
    pencilOutline(ctx, r, crater.slice(1, 6), `${look.light}`, 1.1);
  }

  pencilOutline(ctx, r, rim, INK.cream, 2);
}

/** The surface of the moon the letters sit on. `className` places it. */
export default function MoonSurface({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      {/* A faint glow of atmosphere over the horizon */}
      <div className="absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(ellipse_at_50%_100%,rgba(240,223,210,0.22),transparent_65%)]" />
      <PaintedCanvas paint={paintMoon} grain={14} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
