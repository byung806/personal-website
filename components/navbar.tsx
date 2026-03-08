'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

import StickyBackButton from './back-button';

export default function HeroSection() {
  const pathname = usePathname();
  const isWorkPage = pathname === '/' || (pathname.startsWith('/p/') && pathname !== '/p/guestbook');
  const isGuestbookPage = pathname === '/p/guestbook';
  const isLettersPage = pathname === '/letters' || pathname.startsWith('/letters/');
  const showBackButton = pathname.startsWith('/p/') && pathname !== '/p/guestbook';

  const inactiveClass = 'text-black/35 hover:text-black/70 transition-colors';
  const activeClass = 'text-black';

  return (
    <>
      {showBackButton && <StickyBackButton />}
      <header className="w-full px-6 md:px-10 lg:px-16 pt-6 md:pt-8 pb-0 relative">
        {/* Nav: on mobile project pages hide main nav (back button only); desktop unchanged */}
        <nav className={`flex flex-row items-center justify-center md:justify-end gap-8 md:gap-12 text-sm font-medium uppercase tracking-wide ${showBackButton ? 'hidden md:flex' : ''}`}>
          <Link
            href="/"
            className={isWorkPage ? activeClass : inactiveClass}
          >
            Work
          </Link>
          <Link
            href="/letters"
            className={isLettersPage ? activeClass : inactiveClass}
          >
            Letters
          </Link>
          <Link
            href="/p/guestbook"
            className={isGuestbookPage ? activeClass : inactiveClass}
          >
            Guestbook
          </Link>
          <a
            href="/Bryan_Yung_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={inactiveClass}
          >
            Resume
          </a>
        </nav>
      </header>
    </>
  );
}
