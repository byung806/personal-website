'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import type { Planet } from './use-planets';

// The transforms also run during server render, where there's no window.
const vh = () => (typeof window === 'undefined' ? 800 : window.innerHeight);

/**
 * A drawn planet that drops out of the hero as you scroll, then stays pinned beside the page
 * all the way down, like a moon following you. Hidden on phones, where it would sit on content.
 */
export default function CompanionPlanet({ planet }: { planet?: Planet }) {
  const { scrollY } = useScroll();
  // Falls in over the first screen of scrolling, then holds still and slowly turns.
  const y = useTransform(scrollY, (v) => -0.35 * vh() * (1 - Math.min(v / vh(), 1)));
  const opacity = useTransform(scrollY, (v) => Math.min(Math.max((v / vh() - 0.15) / 0.4, 0), 1));
  const rotate = useTransform(scrollY, (v) => v * 0.04);

  if (!planet) return null;

  return (
    <motion.div
      aria-hidden
      className="hidden md:block fixed right-[3vw] top-[38vh] z-20 w-16 h-16 pointer-events-none"
      style={{ y, opacity, rotate }}
    >
      {/* Same glow treatment as the planets in the hero */}
      {/* eslint-disable-next-line @next/next/no-img-element -- data URL */}
      <img src={planet.drawingData} alt="" className="absolute inset-0 w-full h-full scale-150 opacity-70 [filter:blur(14px)_saturate(1.8)]" />
      {/* A dark rim + soft shadow keep light-colored drawings visible on the white page */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={planet.drawingData}
        alt=""
        className="relative w-full h-full [filter:drop-shadow(0_0_1px_rgba(0,0,0,0.55))_drop-shadow(0_4px_10px_rgba(0,0,0,0.25))]"
      />
    </motion.div>
  );
}
