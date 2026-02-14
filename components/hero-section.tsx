'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import StickyBackButton from './sticky-back-button';

export default function HeroSection() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isGuestbookPage = pathname === '/p/guestbook';
  const showBackButton = pathname.startsWith('/p/') && pathname !== '/p/guestbook';

  return (
    <>
      {showBackButton && <StickyBackButton />}
      <header className="w-full px-6 md:px-10 lg:px-16 pt-6 md:pt-8 pb-4 relative">
        {/* Nav: top right — active dark, others reduced opacity */}
        <nav className="flex flex-row items-center justify-end gap-10 md:gap-12 text-sm font-medium uppercase tracking-wide">
          <Link
            href="/"
            className={isHomePage ? 'text-black' : 'text-black/50 hover:text-black transition-colors'}
          >
            Work
          </Link>
          <Link
            href="/p/guestbook"
            className={isGuestbookPage ? 'text-black' : 'text-black/50 hover:text-black transition-colors'}
          >
            Guestbook
          </Link>
          <a
            href="/Bryan_Yung_Resume.pdf"
            download
            className="text-black/50 hover:text-black transition-colors"
          >
            Resume
          </a>
        </nav>
      </header>
    </>
  );
}
