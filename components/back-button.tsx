'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function StickyBackButton() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;

    const update = () => {
      const currentY = window.scrollY;
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop || currentY <= 80 || currentY < lastY) {
        setVisible(true);
      } else {
        setVisible(false);
      }
      lastY = currentY;
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      className={`fixed top-0 z-40 px-6 md:px-10 lg:px-16 py-6 md:py-8 pointer-events-none transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <Link
        href="/"
        className="flex items-center text-sm font-medium uppercase tracking-wide text-gray-900 hover:text-gray-600 transition-colors pointer-events-auto"
      >
        ← Projects
      </Link>
    </div>
  );
}
