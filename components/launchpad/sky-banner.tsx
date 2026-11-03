'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import NightSky from './night-sky';
import { Fleet, type Ship } from './ships';

/** The night sky as a short banner of drifting ships. The sky itself is screen-height and centered in it. */
export default function SkyBanner({ id, ships, justLaunchedId }: { id?: string; ships: Ship[]; justLaunchedId: number | null }) {
  // Parallax: the sky and its ships drift down at a third of the scroll speed, hanging back as background.
  // What it uncovers is always above the screen.
  const { scrollY } = useScroll();
  const skyY = useTransform(scrollY, (v) => v / 3);
  const reduce = useReducedMotion();

  return (
    <div id={id} className="relative overflow-hidden bg-[#0c0f24]" style={{ height: 'max(44vh, 340px)' }}>
      <motion.div className="absolute inset-0" style={{ y: reduce ? 0 : skyY }}>
        <NightSky trail className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[100svh]" />
        <Fleet ships={ships} justLaunchedId={justLaunchedId} />
      </motion.div>
    </div>
  );
}
