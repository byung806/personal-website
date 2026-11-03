'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Inter, Special_Elite, UnifrakturCook } from 'next/font/google';
import SkyBanner from '@/components/launchpad/sky-banner';
import Launchpad from '@/components/launchpad/launchpad';
import { useFleet } from '@/components/launchpad/ships';
import Guestbook from '@/components/guestbook/guestbook';
import { Dissolve, TornEdge } from '@/components/fun/barriers';
import { encodeRocket, PAINTS, type RocketDesign } from '@/lib/rocket';

const inter = Inter({ subsets: ['latin'] });
const fraktur = UnifrakturCook({ subsets: ['latin'], weight: '700' });
const typewriter = Special_Elite({ subsets: ['latin'], weight: '400' });

const PAPER = '#f7f6f1';
const INK = '#2f55a4';

/**
 * Play: each section is its own world, split by hard barriers. Each title says what to do
 * there; no subtitles. Sky banner of ships, a link to the letters (their own page) on graph paper, the
 * wall after dejiajetomobi.com (blackletter over a wall of colored notes), and a launchpad after
 * tinycamp.site where you build a rocket that flies up to join the ships in the sky.
 * (The planet drawer is parked, not deleted.)
 */
export default function PlayPage() {
  const { ships, launch, justLaunchedId } = useFleet();

  const onLaunch = (design: RocketDesign) => {
    launch('rocket', PAINTS[design.paint], encodeRocket(design));
    // Follow the rocket up to the sky, where it joins the fleet
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div>
      {/* I. The Sky */}
      <SkyBanner id="sky" ships={ships} justLaunchedId={justLaunchedId} />

      <TornEdge color={PAPER} seed={11} />

      {/* II. Letters, which live on their own page */}
      <section
        id="letters"
        className="px-6 md:px-12 py-16 md:py-24"
        style={{
          backgroundColor: PAPER,
          backgroundImage: `linear-gradient(rgba(47,85,164,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(47,85,164,0.07) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      >
        <Link
          href="/letters"
          className={`${typewriter.className} group mx-auto block max-w-6xl text-5xl sm:text-6xl md:text-[84px] leading-[0.95] underline-offset-[10px] decoration-2 hover:underline`}
          style={{ color: INK }}
        >
          read my letters{' '}
          {/* Diagonal: it opens its own page */}
          <ArrowUpRight
            aria-hidden
            strokeWidth={2.5}
            className="inline-block -ml-[0.12em] h-[1.05em] w-[1.05em] align-[-0.17em] transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:translate-x-1.5"
          />
        </Link>
      </section>
      <TornEdge color={PAPER} below seed={4} />

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
