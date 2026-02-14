'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

const FADE_DURATION = 0.35;

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayPath, setDisplayPath] = useState(pathname);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    setDisplayPath(pathname);
  }, [pathname]);

  // Only flip isInitialLoad after the first fade finishes, so we don't re-render mid-animation
  useEffect(() => {
    if (!hasAnimatedRef.current && isInitialLoad) {
      hasAnimatedRef.current = true;
      const t = setTimeout(() => setIsInitialLoad(false), FADE_DURATION * 1000);
      return () => clearTimeout(t);
    }
  }, [isInitialLoad]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={displayPath}
        initial={{ opacity: isInitialLoad ? 0 : 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 1 }}
        transition={{ duration: FADE_DURATION, ease: 'linear' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
