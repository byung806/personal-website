'use client';

import { usePathname } from 'next/navigation';
import ContactSection from './contact-section';
import { useSnowfall } from './snowfall-provider';

export default function HeroSection() {
  const pathname = usePathname();
  const { isSnowing } = useSnowfall();
  const isHomePage = pathname === '/';
  const bgColor = isSnowing ? 'bg-[#F2F8FB]' : 'bg-[#FBF7F1]';

  // Only show hero section on homepage
  if (!isHomePage) {
    return null;
  }

  // Homepage hero section
  return (
    <section className={`w-full ${bgColor} transition-colors duration-500`}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Top padding for hero area - accounting for sticky navbar */}
        <div className="pt-20 sm:pt-24 pb-14 sm:pb-16">
          {/* 2. Large hero title */}
          <h1 className="text-center font-display font-normal text-[clamp(40px,9vw,56px)] sm:text-[clamp(52px,6vw,86px)] leading-[0.95] tracking-[-0.02em] text-[#111111]">
            Bryan Yung
          </h1>

          {/* 3. Subtitle / tagline - two lines */}
          <div className="text-center mt-4 sm:mt-5 max-w-[580px] mx-auto font-sans">
            {/* Primary line: values / philosophy */}
            <p className="text-sm sm:text-base font-normal leading-[1.45] text-black/55">
              building thoughtful systems for{' '}
              <span className="line-through text-black/25">users</span>{' '}
              <span className="text-black/75">humans</span> 🪴
            </p>
            
            {/* Secondary line: credentials / interests */}
            <p className="text-xs sm:text-sm font-normal leading-[1.5] text-black/40 tracking-wide mt-1.5 sm:mt-2">
              cs @ cmu · interested in{' '}
              <span className="text-[#FF6A3D]">AI</span>,{' '}
              <span className="text-[#FF6A3D]">HCI</span>,{' '}
              <span className="text-[#FF6A3D]">3D</span>
            </p>
          </div>

          {/* 4. Contact section */}
          <ContactSection />
        </div>
      </div>
    </section>
  );
}
