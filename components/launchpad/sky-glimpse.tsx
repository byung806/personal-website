'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import NightSky from './night-sky';

/** How far the sky drifts each way as the strip scrolls past, in px. */
const DRIFT = 70;

/**
 * A narrow window onto the night sky between two paper sections. The sky behind it is taller than
 * the window and drifts slower than the page, like the other skies.
 */
export default function SkyGlimpse({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], useReducedMotion() ? [0, 0] : [-DRIFT, DRIFT]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div className="absolute inset-x-0" style={{ top: -DRIFT, bottom: -DRIFT, y }}>
        <NightSky galaxy="glimpse" className="absolute inset-0" />
      </motion.div>
    </div>
  );
}
