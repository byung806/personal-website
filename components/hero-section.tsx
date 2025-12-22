'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import SocialRow from './social-row';
import StickyBackButton from './sticky-back-button';
import { Leaf, Snowflake, Sun } from 'lucide-react';
import { useMemo } from 'react';
import SnowflakeButton from './snowflake-button';
import SeasonButton from './season-button';

export default function HeroSection() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const showBackButton = pathname.startsWith('/p/');

  const { AccentIcon, accentColor, season } = useMemo(() => {
    const now = new Date();
    const m = now.getMonth(); // 0-11
    let season: 'winter' | 'spring' | 'summer' | 'fall';
    if (m === 11 || m <= 1) season = 'winter';
    else if (m <= 4) season = 'spring';
    else if (m <= 7) season = 'summer';
    else season = 'fall';

    // Subtle, neutral palettes per season (light/dark friendly)
    const palette: Record<typeof season, string> = {
      winter: 'rgba(68, 88, 104, 0.45)',   // muted blue-grey
      spring: 'rgba(72, 112, 82, 0.45)',   // soft green
      summer: 'rgba(70, 110, 110, 0.45)',  // gentle teal-grey
      fall:   'rgba(120, 96, 72, 0.45)',   // warm neutral
    };

    const accentColor = palette[season];
    const AccentIcon = season === 'winter' ? Snowflake : season === 'spring' ? Leaf : Sun;
    return { AccentIcon, accentColor, season };
  }, []);

  return (
    <>
      {showBackButton && <StickyBackButton />}
      <section className={`w-full px-4 md:px-4 lg:px-6 py-8 bg-white dark:bg-[#0F0F0F] transition-all duration-300 ${isHomePage ? 'mt-0' : ''}`}>
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-start justify-between gap-12">
          {/* Left: Editorial text block (hidden on project pages) */}
          {!showBackButton && (
            <div className="max-w-[320px] text-[11px] uppercase tracking-wide leading-relaxed font-sans text-gray-900 dark:text-gray-100">
              Hi, I'm <span className="font-bold text-[#FF4500]">Bryan Yung</span>, a computer science student at{' '}
              <span className="underline decoration-1 underline-offset-2">Carnegie Mellon University</span>, currently exploring{' '}
              <span className="font-semibold">AI</span>, <span className="font-semibold">HCI</span>, and{' '}
              <span className="font-semibold">3D</span>.
            </div>
          )}

          {/* Spacer on project pages to push nav right */}
          {showBackButton && <div className="flex-1" />}

          {/* Center: Wordmark */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <div className="inline-flex items-center">
              <Link href="/" className="font-serif text-2xl text-gray-900 dark:text-gray-100 hover:opacity-70 transition-opacity inline-flex items-center">
                <span>Bryan</span>
                {season === 'winter' ? (
                  <span className="mx-1 inline-flex items-center" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    <SnowflakeButton />
                  </span>
                ) : (
                  <span className="mx-1 inline-flex items-center" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    <SeasonButton />
                  </span>
                )}
                <span>Yung</span>
              </Link>
            </div>
          </div>

          {/* Right: Navigation */}
          <SocialRow />
        </div>
      </div>
      </section>
    </>
  );
}
