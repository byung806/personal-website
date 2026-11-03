'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { startSnow } from './engine';
import { useSnow } from './snow-provider';

const FADE_MS = 900;

/// Snow falling over the viewport and piling on the [data-ledge] elements inside `rootId`, while the snowflake button has it on.
export default function Snowfall({ rootId }: { rootId: string }) {
  const { available, isSnowing } = useSnow();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Stays mounted through the fade-out after the snow is turned off.
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const on = available && isSnowing;

  useEffect(() => {
    if (on) {
      setMounted(true);
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    const timer = setTimeout(() => setMounted(false), FADE_MS);
    return () => clearTimeout(timer);
  }, [on]);

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!mounted || !root || !canvasRef.current) return;
    return startSnow(root, canvasRef.current);
  }, [mounted, rootId]);

  if (!mounted) return null;
  // In the body, positioned against the document: the engine slides it along with the scroll and sizes it.
  return createPortal(
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-20 transition-opacity ease-out"
      style={{ opacity: shown ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
    />,
    document.body,
  );
}
