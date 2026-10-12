'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

import StickyBackButton from './back-button';

/**
 * Routes whose page starts with a dark, full-bleed hero: the header becomes a transparent overlay
 * with light text, and the page's hero runs underneath it.
 */
const OVERLAY_HEADER_ROUTES = ['/p/planet-garden', '/fun', '/play'];

export default function HeroSection() {
  const pathname = usePathname();
  if (pathname === '/memories' || pathname.startsWith('/memories/')) return null;
  const isWorkPage = pathname === '/' || pathname.startsWith('/p/');
  const isPlayPage = pathname === '/play' || pathname.startsWith('/letters/');
  const showBackButton = pathname.startsWith('/p/');
  const overlay = OVERLAY_HEADER_ROUTES.includes(pathname);

  const inactiveClass = overlay
    ? 'text-white/45 hover:text-white/80 transition-colors'
    : 'text-black/35 hover:text-black/70 transition-colors';
  const activeClass = overlay ? 'text-white' : 'text-black';

  return (
    <>
      {showBackButton && <StickyBackButton />}
      <header className={`w-full px-6 md:px-10 lg:px-16 pt-6 md:pt-8 pb-0 ${overlay ? 'absolute top-0 inset-x-0 z-30' : 'relative'}`}>
        {/* Nav: on mobile project pages hide main nav (back button only); desktop unchanged */}
        <nav className={`flex flex-row items-center justify-center md:justify-end gap-8 md:gap-12 text-sm font-medium uppercase tracking-wide ${showBackButton ? 'hidden md:flex' : ''}`}>
          <Link
            href="/"
            className={isWorkPage ? activeClass : inactiveClass}
          >
            Work
          </Link>
          <Link
            href="/play"
            className={isPlayPage ? activeClass : inactiveClass}
          >
            Play
          </Link>
        </nav>
      </header>
    </>
  );
}
