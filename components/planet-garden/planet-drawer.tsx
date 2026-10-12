'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, RotateCcw } from 'lucide-react';
import type { Planet } from './use-planets';

type Brush = 'core' | 'glow' | 'detail';

/** Film grain for the eclipse corona. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const COLORS = [
  '#c2a4f8', // nebula lavender
  '#f4845f', // mars coral
  '#f7c948', // gas giant gold
  '#7ec8e3', // ice blue
  '#5bba6f', // alien green
  '#e8e8e8', // moon white
];

type Point = { x: number; y: number };

/** Picks a launch spot (percent, 10–90) as far as possible from existing planets. */
function pickLaunchSpot(existing: Point[]): Point {
  let best = { x: 50, y: 50 };
  let bestDist = -1;
  for (let i = 0; i < 24; i++) {
    const c = { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 };
    const d = existing.reduce((m, p) => Math.min(m, Math.hypot(p.x - c.x, p.y - c.y)), Infinity);
    if (d > bestDist) { bestDist = d; best = c; }
  }
  return best;
}

const BRUSHES: { id: Brush; label: string; size: number }[] = [
  { id: 'core', label: 'Core', size: 18 },
  { id: 'glow', label: 'Glow', size: 32 },
  { id: 'detail', label: 'Detail', size: 5 },
];

/**
 * "Draw a planet" canvas + toolbar. Launches the drawing into the garden, then calls `onLaunched`.
 * `straddle` drops the heading and pulls the canvas up so it sits half over the hero above it,
 * styled as an eclipse (glowing rim, outlined toolbar). `prompt` replaces the "draw here" hint.
 */
export default function PlanetDrawer({
  planets,
  onLaunched,
  straddle = false,
  prompt,
}: {
  planets: Planet[];
  onLaunched: () => void;
  straddle?: boolean;
  prompt?: ReactNode;
}) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [currentBrush, setCurrentBrush] = useState<Brush>('core');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const brushPreviewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.lineCap = 'round';
        context.lineJoin = 'round';
        // Keep strokes inside the circle so every planet comes out round.
        const r = canvasRef.current.width / 2;
        context.beginPath();
        context.arc(r, r, r, 0, Math.PI * 2);
        context.clip();
        ctxRef.current = context;
      }
    }
  }, []);

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const applyBrush = (ctx: CanvasRenderingContext2D, brush: Brush) => {
    const b = BRUSHES.find((br) => br.id === brush)!;
    ctx.lineWidth = b.size;
    if (brush === 'glow') {
      ctx.globalAlpha = 0.25;
      ctx.shadowColor = currentColor;
      ctx.shadowBlur = 18;
    } else {
      ctx.globalAlpha = 1;
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    setIsDrawing(true);
    applyBrush(ctx, currentBrush);
    ctx.strokeStyle = currentColor;
    const { x, y } = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    // Leave a dot on a plain tap.
    ctx.lineTo(x + 0.01, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  // A dot in the current color and brush size that follows the pointer over the canvas.
  const moveBrushPreview = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const el = brushPreviewRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    el.style.transform = `translate(${e.clientX - rect.left}px, ${e.clientY - rect.top}px) translate(-50%, -50%)`;
    el.style.opacity = '1';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = ctxRef.current;
    if (!isDrawing || !ctx) return;
    ctx.strokeStyle = currentColor;
    applyBrush(ctx, currentBrush);
    const { x, y } = getCanvasPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const ctx = ctxRef.current;
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasDrawn(false);
  };

  const submitPlanet = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Skip blank canvases.
    const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    let drawn = false;
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 0) { drawn = true; break; }
    if (!drawn) {
      setError('Draw something first!');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      // Planets display at ~100px, so 200px keeps them sharp on retina while staying well under the size limit.
      const out = document.createElement('canvas');
      out.width = 200;
      out.height = 200;
      out.getContext('2d')!.drawImage(canvas, 0, 0, out.width, out.height);
      const drawingData = out.toDataURL('image/png');
      const { x, y } = pickLaunchSpot(planets);

      const res = await fetch('/api/planets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drawingData, x, y }),
      });

      if (res.ok) {
        clearCanvas();
        onLaunched();
        // Bring the new planet into view in the hero.
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? 'Launch failed, try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Launch failed, try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className={`px-6 md:px-16 flex flex-col items-center text-center overflow-x-clip ${
        straddle ? 'relative z-30 -mt-[145px] sm:-mt-[170px] md:-mt-[190px]' : 'pt-24 md:pt-32'
      }`}
    >
      {!straddle && (
        <>
          <h2 className={`[font-family:var(--font-serif)] italic text-4xl md:text-5xl leading-tight text-[#292826] dark:text-[#fafafa]`}>
            Draw a planet
          </h2>
          <p className="mt-4 text-lg md:text-xl text-[#292826]/60 dark:text-[#fafafa]/60">
            Sketch inside the circle, then launch it into the garden.
          </p>
        </>
      )}

      {/* Drawing surface: the canvas is the planet */}
      <div className={`group relative ${straddle ? '' : 'mt-16'} w-full max-w-[290px] sm:max-w-[340px] md:max-w-[380px] aspect-square`}>
        {straddle ? (
          // Eclipse corona: a soft grainy glow behind the black disc
          <div
            aria-hidden
            className="absolute -inset-[45%] rounded-full pointer-events-none opacity-80 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: 'radial-gradient(closest-side, rgba(225,225,235,0.55) 52%, rgba(200,200,215,0.16) 68%, rgba(180,180,200,0.05) 84%, transparent 100%)',
              maskImage: 'radial-gradient(closest-side, #000 60%, transparent 100%)',
            }}
          >
            <div className="absolute inset-0 rounded-full mix-blend-multiply opacity-60" style={{ backgroundImage: GRAIN }} />
          </div>
        ) : (
          // Slowly turning orbit with a little moon
          <div className="absolute -inset-5 md:-inset-7 rounded-full border border-dashed animate-[spin_40s_linear_infinite] pointer-events-none border-[#292826]/20 dark:border-white/20">
            <div className="absolute top-0 left-1/2 w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f8d78f]" />
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          onPointerDown={startDrawing}
          onPointerMove={(e) => { moveBrushPreview(e); draw(e); }}
          onPointerUp={stopDrawing}
          onPointerLeave={() => {
            stopDrawing();
            if (brushPreviewRef.current) brushPreviewRef.current.style.opacity = '0';
          }}
          className={`relative w-full h-full rounded-full cursor-none transition-shadow duration-300 ${
            straddle
              ? 'shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_0_18px_2px_rgba(255,255,255,0.45)] group-hover:shadow-[0_0_0_1px_rgba(255,255,255,0.6),0_0_26px_4px_rgba(255,255,255,0.6)]'
              : 'shadow-[0_25px_60px_-15px_rgba(0,0,0,0.55)] group-hover:shadow-[0_0_0_6px_rgba(248,215,143,0.35),0_25px_60px_-15px_rgba(0,0,0,0.55)]'
          }`}
          style={{ touchAction: 'none', background: straddle ? '#000' : 'radial-gradient(circle at 35% 30%, #23233a 0%, #0b0b12 55%, #000 100%)' }}
        />

        {/* Hint until the first stroke */}
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${hasDrawn ? 'opacity-0' : 'opacity-100'}`}
        >
          {prompt ?? <span className={`[font-family:var(--font-serif)] italic text-2xl text-white/35 animate-pulse`}>draw here</span>}
        </div>

        {/* Brush preview */}
        <div
          ref={brushPreviewRef}
          className="absolute left-0 top-0 rounded-full pointer-events-none transition-opacity duration-150 ring-1 ring-white/60"
          style={{
            width: `calc(${BRUSHES.find((b) => b.id === currentBrush)!.size} / 400 * 100%)`,
            aspectRatio: '1',
            backgroundColor: currentColor,
            filter: currentBrush === 'glow' ? 'blur(4px)' : undefined,
            opacity: 0,
          }}
        />
      </div>

      {/* Floating toolbar */}
      <div className={`${straddle ? 'mt-20 md:mt-24 bg-black/40 backdrop-blur-md border border-white/20' : 'mt-16 bg-white dark:bg-[#1e1e1e] border border-black/5 dark:border-white/10 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)]'} inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-3 rounded-3xl sm:rounded-full px-4 py-3`}>
        <div className="flex gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setCurrentColor(color)}
              aria-label={`Color ${color}`}
              className="w-7 h-7 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: color,
                boxShadow: currentColor === color ? `0 0 0 2px var(--tw-ring-offset-color, #fff), 0 0 0 4px ${color}` : 'inset 0 0 0 1px rgba(0,0,0,0.08)',
              }}
            />
          ))}
        </div>

        <div className="hidden sm:block w-px h-6 bg-black/10 dark:bg-white/10" />

        {/* Brushes, shown by size */}
        <div className="flex items-center gap-1">
          {[...BRUSHES].sort((a, b) => a.size - b.size).map((b) => (
            <button
              key={b.id}
              onClick={() => setCurrentBrush(b.id)}
              aria-label={`${b.label} brush`}
              title={b.label}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                currentBrush === b.id ? 'bg-black/[0.07] dark:bg-white/15' : 'hover:bg-black/[0.04] dark:hover:bg-white/5'
              }`}
            >
              <span
                className="rounded-full bg-[#292826] dark:bg-[#fafafa]"
                style={{
                  width: Math.max(4, b.size / 2),
                  height: Math.max(4, b.size / 2),
                  filter: b.id === 'glow' ? 'blur(2px)' : undefined,
                  opacity: b.id === 'glow' ? 0.6 : 1,
                }}
              />
            </button>
          ))}
        </div>

        <div className="hidden sm:block w-px h-6 bg-black/10 dark:bg-white/10" />

        <div className="flex items-center gap-2">
          <button
            onClick={clearCanvas}
            aria-label="Clear"
            title="Clear"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#292826]/60 dark:text-[#fafafa]/60 hover:bg-black/[0.04] dark:hover:bg-white/5 hover:text-[#292826] dark:hover:text-[#fafafa] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={submitPlanet}
            disabled={isSubmitting || !hasDrawn}
            className={
              straddle
                ? 'inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-white text-black text-[15px] font-semibold transition-shadow shadow-[0_0_28px_rgba(255,165,80,0.45)] hover:shadow-[0_0_36px_rgba(255,165,80,0.7)] disabled:opacity-40 disabled:shadow-none'
                : `[font-family:var(--font-serif)] italic inline-flex items-center gap-1.5 pl-5 pr-4 py-2 rounded-full bg-[#f8d78f] text-[#292826] text-lg transition-all hover:bg-[#fbe2ab] hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-[#f8d78f]`
            }
          >
            {isSubmitting ? 'Launching…' : 'Launch'}
            {!straddle && <ArrowUpRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="h-8 mt-4">
        <AnimatePresence>
          {showSuccess && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`[font-family:var(--font-serif)] italic text-[#c9a54e]`}
            >
              Launched ✦
            </motion.p>
          )}
        </AnimatePresence>
        {error && <p className="text-sm text-[#e0684a]">{error}</p>}
      </div>
    </section>
  );
}
