'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Download } from 'lucide-react';
import StickyBackButton from './sticky-back-button';

export default function HeroSection() {
  const pathname = usePathname();
  const isWorkPage = pathname === '/' || (pathname.startsWith('/p/') && pathname !== '/p/guestbook');
  const isGuestbookPage = pathname === '/p/guestbook';
  const showBackButton = pathname.startsWith('/p/') && pathname !== '/p/guestbook';

  const inactiveClass = 'text-black/35 hover:text-black/70 transition-colors';
  const activeClass = 'text-black';

  return (
    <>
      {showBackButton && <StickyBackButton />}
      <header className="w-full px-6 md:px-10 lg:px-16 py-6 md:py-8 relative">
        {/* Nav: on mobile project pages hide main nav (back button only); desktop unchanged */}
        <nav className={`flex flex-row items-center justify-center md:justify-end gap-8 md:gap-12 text-sm font-medium uppercase tracking-wide ${showBackButton ? 'hidden md:flex' : ''}`}>
          <Link
            href="/"
            className={isWorkPage ? activeClass : inactiveClass}
          >
            Work
          </Link>
          <Link
            href="/p/guestbook"
            className={isGuestbookPage ? activeClass : inactiveClass}
          >
            Guestbook
          </Link>
          <a
            href="/Bryan_Yung_Resume.pdf"
            download
            className={`group relative inline-block ${inactiveClass}`}
          >
            Resume
            <Download
              className="absolute left-full top-1/2 -translate-y-1/2 ml-1 size-3.5 shrink-0 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
              aria-hidden
            />
          </a>
        </nav>
      </header>
    </>
  );
}
