'use client';

import Image from 'next/image';
import SocialRow from './social-row';

export default function HeroSection() {
  const interests = ['AI', 'HCI', '3D'];

  return (
    <section className="relative z-10 min-h-[75vh] flex items-center justify-center px-6 py-20">
      <div className="max-w-xl mx-auto text-center">
        {/* Avatar */}
        <div className="mb-6">
          <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden">
            <Image
              src="/me.JPG"
              alt="Bryan Yung"
              fill
              className="object-cover object-center"
            />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-bold text-text mb-4 leading-tight">
          Hey, I'm Bryan.
        </h1>

        {/* Subtext */}
        <p className="text-base md:text-lg text-subtext mb-10 font-normal">
          I'm a student at Carnegie Mellon University studying computer science.
          I like teaching, music, and competitive programming.
        </p>

        {/* Currently exploring */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-wide text-subtext/60 mb-3">Currently exploring</p>
          <div className="flex flex-wrap gap-4 justify-center text-3xl md:text-4xl font-bold">
            {interests.map((interest, index) => {
              const gradients = [
                'from-orange-500 via-red-500 to-pink-500',
                'from-purple-500 via-blue-500 to-cyan-500',
                'from-green-500 via-teal-500 to-blue-500',
              ];
              return (
                <span
                  key={interest}
                  className={`bg-gradient-to-r ${gradients[index]} bg-clip-text text-transparent`}
                >
                  {interest}
                </span>
              );
            })}
          </div>
        </div>

        {/* Social links */}
        <div className="flex justify-center">
          <SocialRow />
        </div>
      </div>
    </section>
  );
}
