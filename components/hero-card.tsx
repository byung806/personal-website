'use client';

import Image from 'next/image';
import SocialRow from './social-row';

export default function HeroCard() {
  return (
    <div className="h-full relative p-6">
      {/* Main Content */}
      <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6 h-full">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative w-24 md:w-32 h-24 md:h-32 rounded-full overflow-hidden shadow-lg">
            <Image
              src="/me.JPG"
              alt="Bryan Yung"
              fill
              className="object-cover object-center"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text mb-2 leading-tight">
            Hey! I'm Bryan.
          </h1>

          <p className="text-sm md:text-base text-subtext mb-3 md:mb-4">
            I'm a student at Carnegie Mellon University studying computer science.
          </p>
          <p className="text-sm md:text-base text-subtext">
            I like teaching, music, and competitive programming.
          </p>
        </div>
      </div>

      {/* Contact links */}
      <div className="absolute bottom-6 right-6">
        <SocialRow />
      </div>
    </div>
  );
}