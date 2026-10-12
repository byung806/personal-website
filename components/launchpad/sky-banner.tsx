'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import NightSky from './night-sky';
import { Fleet, type Ship } from './ships';

/**
 * The night sky as a short banner of drifting ships. The grabber on its bottom edge pulls it open to
 * fill the screen; Esc or the grabber closes it again. The sky itself is always screen-height and
 * centered, so opening reveals more of it instead of redrawing it.
 */
export default function SkyBanner({ id, ships, justLaunchedId }: { id?: string; ships: Ship[]; justLaunchedId: number | null }) {
  const [expanded, setExpanded] = useState(false);
  // Parallax: the sky and its ships drift down at a third of the scroll speed, hanging back as background.
  // What it uncovers is always above the screen.
  const { scrollY } = useScroll();
  const skyY = useTransform(scrollY, (v) => v / 3);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setExpanded(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // not a click on the sky (which sends a shooting star)
    setExpanded((v) => !v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      id={id}
      className="relative overflow-hidden bg-[#0c0f24] transition-[height] duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] motion-reduce:transition-none"
      style={{ height: expanded ? '100svh' : 'max(44vh, 340px)' }}
    >
      <motion.div className="absolute inset-0" style={{ y: reduce ? 0 : skyY }}>
        <NightSky trail className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[100svh]" />
        <Fleet ships={ships} justLaunchedId={justLaunchedId} />
      </motion.div>

      {/* Grabber: pull the sky open */}
      <button
        onClick={toggle}
        aria-expanded={expanded}
        aria-label={expanded ? 'Close the sky' : 'Open the sky'}
        className="group absolute bottom-7 md:bottom-9 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 px-6 pt-3 pb-1 rounded-full focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/60"
      >
        <span className="block w-12 h-1 rounded-full bg-[#f0dfd2]/45 shadow-[0_0_12px_rgba(240,223,210,0.45)] transition-all duration-300 group-hover:w-16 group-hover:bg-[#f0dfd2]/80" />
        <ChevronDown className={`w-4 h-4 text-[#f0dfd2]/50 transition-transform duration-500 group-hover:text-[#f0dfd2]/90 ${expanded ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
}
