'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { startSnow, type Snow } from './engine';
import { BLOW_MS, useSnow } from './snow-provider';

const FADE_MS = 900;

/// Snow falling over the viewport and piling on the [data-ledge] elements inside `rootId`, while the snowflake button has it on.
/// Turning it off blows it all away.
export default function Snowfall({ rootId }: { rootId: string }) {
  const { isSnowing } = useSnow();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snow = useRef<Snow | null>(null);
  // Stays mounted while the snow blows away and fades out after it's turned off.
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (isSnowing) {
      snow.current?.resume();
      setMounted(true);
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(raf);
    }
    snow.current?.blowAway();
    const fade = setTimeout(() => setShown(false), snow.current ? BLOW_MS : 0);
    const unmount = setTimeout(() => setMounted(false), (snow.current ? BLOW_MS : 0) + FADE_MS);
    return () => {
      clearTimeout(fade);
      clearTimeout(unmount);
    };
  }, [isSnowing]);

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!mounted || !root || !canvasRef.current) return;
    const started = startSnow(root, canvasRef.current);
    snow.current = started;
    return () => {
      started.stop();
      snow.current = null;
    };
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
