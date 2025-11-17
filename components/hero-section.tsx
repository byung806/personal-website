'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SocialRow from './social-row';

export default function HeroSection() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const showBackButton = pathname.startsWith('/p/');

  return (
    <section className={`sticky top-0 z-50 w-full px-4 sm:px-6 md:px-8 py-4 bg-white dark:bg-[#0F0F0F] transition-all duration-300 ${isHomePage ? 'mt-8' : ''}`}>
      <div className="max-w-[1800px] mx-auto">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Name and school */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm md:text-base">
            {showBackButton ? (
              <Link href="/" className="inline-flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100 hover:opacity-70 transition-opacity duration-100">
                <ArrowLeft className="w-4 h-4" />
                Bryan Yung
              </Link>
            ) : (
              <span className="font-bold text-gray-900 dark:text-gray-100">Bryan Yung</span>
            )}
            <span className={`text-gray-400 dark:text-gray-600 ${showBackButton ? 'hidden sm:inline' : ''}`}>·</span>
            <span className={`text-gray-600 dark:text-gray-400 ${showBackButton ? 'hidden sm:inline' : ''}`}>SCS @ CMU</span>
            <span className="text-gray-400 dark:text-gray-600 hidden sm:inline">·</span>
            <span className="text-gray-500 dark:text-gray-500 hidden sm:inline">exploring</span>
            <span className="font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent hidden sm:inline">AI</span>
            <span className="font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent hidden sm:inline">HCI</span>
            <span className="font-bold bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 bg-clip-text text-transparent hidden sm:inline">3D</span>
          </div>

          {/* Right: Social links */}
          <SocialRow />
        </div>
      </div>
    </section>
  );
}
