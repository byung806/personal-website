'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SnowflakeButton from './snowflake-button';
import { useSnowfall } from './snowfall-provider';

export default function Navbar() {
  const pathname = usePathname();
  const { isSnowing } = useSnowfall();

  // Check if we're on a project page (but not guestbook)
  const isProjectPage = pathname.startsWith('/p/') && pathname !== '/p/guestbook';

  const navLinks = [
    { href: '/', label: 'Work', active: pathname === '/', showArrow: isProjectPage },
    { href: '/p/guestbook', label: 'Guestbook', active: pathname === '/p/guestbook', showArrow: false },
  ];

  return (
    <nav className="sticky top-4 sm:top-6 z-50 flex justify-center mt-4 sm:mt-6 overflow-x-auto scrollbar-hide">
      <div className={`relative inline-flex items-center gap-3 sm:gap-4 px-3 sm:px-3.5 py-2 rounded-full border-2 shadow-[0_8px_24px_rgba(0,0,0,0.06)] ${
        isSnowing 
          ? 'bg-white/65 backdrop-blur-[10px] border-[#A3D5FF]' 
          : 'bg-white border-[#ffc080]'
      }`}>
        {/* Optional: Small logo/monogram */}
        <div className="hidden sm:flex items-center">
          <div className="w-8 h-8 rounded-full border border-black/8 flex items-center justify-center">
            <span className="text-xs font-semibold text-black/70">BY</span>
          </div>
          <div className="w-px h-[18px] bg-black/12 mx-2.5" />
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-4 sm:gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm sm:text-[15px] font-medium transition-colors relative flex items-center gap-1.5 ${
                link.active
                  ? 'text-black/90'
                  : 'text-black/55 hover:text-black/85'
              }`}
            >
              {link.showArrow && <ArrowLeft className="w-3.5 h-3.5" />}
              {link.label}
              {link.active && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black/20 rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* Divider before snowflake */}
        <div className="w-px h-[18px] bg-black/12 mx-1 sm:mx-2.5" />

        {/* Snowflake button */}
        <div className="flex items-center">
          <SnowflakeButton />
        </div>
      </div>
    </nav>
  );
}

