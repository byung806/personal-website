'use client';

import { useEffect } from 'react';

export default function CursorSpotlight() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Update CSS variables for cursor position
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Scrolling Tiled Background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: "url('/dominos.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "150px 100px",
          opacity: 0.15,
        }}
      />

      {/* Spotlight Overlay */}
      <div
        className="fixed inset-0 pointer-events-none -z-0"
        style={{
          background: `
            radial-gradient(
              circle 60px at var(--mouse-x, 50%) var(--mouse-y, 50%), 
              rgba(238,238,238,0) 0%, 
              rgba(238,238,238,0.95) 100%
            ), 
            rgba(238,238,238,0.2)
          `,
        }}
      />
    </>
  );
}
