'use client';

import { Inter, UnifrakturCook } from 'next/font/google';
import SkyBanner from '@/components/launchpad/sky-banner';
import Launchpad from '@/components/launchpad/launchpad';
import SkyGlimpse from '@/components/launchpad/sky-glimpse';
import { useFleet } from '@/components/launchpad/ships';
import LettersSection from '@/components/letters/letters-section';
import Guestbook from '@/components/guestbook/guestbook';
import { InkRule, TornEdge, Dissolve } from '@/components/fun/barriers';

const inter = Inter({ subsets: ['latin'] });
const fraktur = UnifrakturCook({ subsets: ['latin'], weight: '700' });

const PAPER = '#f7f6f1';
const INK = '#2f55a4';

/**
 * Play: each section is its own world, split by hard barriers. Each title says what to do there; no subtitles.
 * Sky banner of ships, letters after bermawy.com (graph paper, typewriter ink), the wall after
 * dejiajetomobi.com (blackletter over a bare text grid), and a launchpad after tinycamp.site whose
 * rockets fly up to join the ships in the sky. (The planet drawer is parked, not deleted.)
 */
export default function PlayPage() {
  const { ships, launch, justLaunchedId } = useFleet();

  const onLaunch = (color: string) => {
    launch('rocket', color);
    // Follow the rocket up to the sky, where it joins the fleet
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div>
      {/* I. The Sky */}
      <SkyBanner id="sky" ships={ships} justLaunchedId={justLaunchedId} />

      <TornEdge color={PAPER} seed={11} />

      {/* II. Letters */}
      <section
        id="letters"
        style={{
          backgroundColor: PAPER,
          backgroundImage: `linear-gradient(rgba(47,85,164,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(47,85,164,0.07) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      >
        <LettersSection />
        <InkRule color={INK} />
      </section>

      {/* A glimpse of the sky between the papers, with the river of stars running down through it */}
      <TornEdge color={PAPER} below seed={4} />
      <SkyGlimpse className="h-44 md:h-56" />
      <TornEdge color="#fff" seed={23} />

      {/* III. The Wall */}
      <section id="wall" className={`${inter.className} bg-white text-black px-6 md:px-8 pt-12 md:pt-16 pb-28`}>
        <h2 className={`${fraktur.className} text-[12vw] md:text-[12.5vw] leading-[0.85] tracking-[-0.01em] -ml-[0.03em] whitespace-nowrap`}>
          Sign the Guestbook
        </h2>
        <div className="mt-12 md:mt-16">
          <Guestbook colorWall />
        </div>
      </section>

      {/* IV. Launchpad, which the white wall mists into */}
      <Dissolve />
      <Launchpad id="launchpad" onLaunch={onLaunch} />
    </div>
  );
}
