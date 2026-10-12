'use client';

import { useEffect, useRef } from 'react';
import { addGrain } from '@/lib/pencil';

/**
 * A canvas that runs `paint` (in CSS pixels) at device resolution, adds film grain, and repaints when
 * its size changes. `paint` should be a stable (module-level) function.
 */
export default function PaintedCanvas({
  paint,
  grain = 14,
  className = '',
}: {
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  grain?: number;
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
      const ctx = canvas.getContext('2d', { willReadFrequently: grain > 0 });
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint(ctx, w, h);
      if (grain > 0) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        addGrain(ctx, canvas.width, canvas.height, grain);
      }
    };
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    });
    observer.observe(canvas);
    draw();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [paint, grain]);

  return <canvas ref={ref} aria-hidden className={className} />;
}
