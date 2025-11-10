'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayPath, setDisplayPath] = useState(pathname);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    setDisplayPath(pathname);
    // After first render, disable initial load animation
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [pathname, isInitialLoad]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={displayPath}
        initial={{ opacity: isInitialLoad ? 0.7 : 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
