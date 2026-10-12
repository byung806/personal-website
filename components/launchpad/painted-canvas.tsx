'use client';

import { useEffect, useRef } from 'react';
import { addGrain } from '@/lib/pencil';
import { whenIdle, whenNear } from '@/lib/idle';

/**
 * A canvas that runs `paint` (in CSS pixels) at device resolution, adds film grain, and repaints when
 * its size changes. `paint` should be a stable (module-level) function. It paints only once it's near
 * the screen, in an idle moment (so a page full of them doesn't freeze while loading), and fades in.
 */
export default function PaintedCanvas({
  paint,
  grain = 14,
  eager = false,
  className = '',
}: {
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  grain?: number;
  /** Paint right away and show without fading in, for small things that should just be there. */
  eager?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let raf = 0;
    let last = '';
    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const key = `${w}x${h}x${dpr}`;
      if (!w || !h || key === last) return;
      last = key;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint(ctx, w, h);
      if (grain > 0) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        addGrain(ctx, canvas.width, canvas.height, grain);
      }
    };
    let near = false;
    let cancelIdle = () => {};
    const schedule = () => {
      if (eager) return draw();
      if (!near) return;
      cancelIdle();
      cancelIdle = whenIdle(() => {
        draw();
        canvas.dataset.painted = '';
      });
    };
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(schedule);
    });
    observer.observe(canvas);
    const cancelNear = whenNear(canvas, () => {
      near = true;
      schedule();
    });
    return () => {
      observer.disconnect();
      cancelNear();
      cancelIdle();
      cancelAnimationFrame(raf);
    };
  }, [paint, grain, eager]);

  return <canvas ref={ref} aria-hidden className={`${eager ? '' : 'opacity-0 transition-opacity duration-700 data-[painted]:opacity-100'} ${className}`} />;
}
