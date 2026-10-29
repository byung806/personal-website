'use client';

import { useEffect, useRef, useState } from 'react';
import { startSnow } from './engine';

/// On when NEXT_PUBLIC_SNOW=1; `?snow=1` / `?snow=0` overrides it for a single visit.
function snowEnabled() {
  const param = new URLSearchParams(window.location.search).get('snow');
  if (param !== null) return param !== '0';
  return process.env.NEXT_PUBLIC_SNOW === '1';
}

/// Snow falling over the viewport and piling on the [data-ledge] elements inside `rootId`.
export default function Snowfall({ rootId }: { rootId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(snowEnabled() && !matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!enabled || !root || !canvasRef.current) return;
    return startSnow(root, canvasRef.current);
  }, [enabled, rootId]);

  if (!enabled) return null;
  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-20 h-screen w-screen" />;
}
