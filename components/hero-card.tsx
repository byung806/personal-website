'use client';

import Image from 'next/image';
import SocialRow from './social-row';

export default function HeroCard() {
  return (
    <div className="h-full relative p-6">
      {/* Main Content */}
      <div className="flex items-center gap-6 h-full">
        {/* Avatar - Bigger and centered vertically */}
        <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg">
          <Image
            src="/me.JPG"
            alt="Bryan Yung"
            fill
            className="object-cover object-center"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name as clear headline */}
          <h1 className="text-3xl md:text-4xl font-bold text-text mb-2 leading-tight">
            Hey! I'm Bryan.
          </h1>

          {/* Carnegie Mellon with styling */}
          {/* <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm">
              Carnegie Mellon University
            </span>
          </div> */}

          <p className="text-sm md:text-base text-subtext mb-4">
            I'm a student at Carnegie Mellon University studying computer science.
          </p>
          <p className="text-sm md:text-base text-subtext">
            I like teaching, music, and competitive programming.
          </p>
        </div>
      </div>

      {/* Contact links in bottom right corner */}
      <div className="absolute bottom-6 right-6">
        <SocialRow />
      </div>
    </div>
  );
}