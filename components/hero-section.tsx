'use client';

import SocialRow from './social-row';

export default function HeroSection() {
  return (
    <section className="w-full px-4 sm:px-8 md:px-16 lg:px-32 xl:px-48 pt-12 pb-4">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Name and school */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm md:text-base">
            <span className="font-bold text-gray-900 dark:text-gray-100">Bryan Yung</span>
            <span className="text-gray-400 dark:text-gray-600">·</span>
            <span className="text-gray-600 dark:text-gray-400">SCS @ CMU</span>
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
