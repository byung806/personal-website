'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Inter } from 'next/font/google';
import SkyBanner from '@/components/launchpad/sky-banner';
import Launchpad from '@/components/launchpad/launchpad';
import { useFleet } from '@/components/launchpad/ships';
import Guestbook from '@/components/guestbook/guestbook';
import { Dissolve, TornEdge } from '@/components/fun/barriers';
import AsciiTree from '@/components/fun/ascii-tree';
import SectionTitle from '@/components/fun/section-title';
import { encodeRocket, PAINTS, type RocketDesign } from '@/lib/rocket';

const inter = Inter({ subsets: ['latin'] });

const PAPER = '#f7f6f1';
const INK = '#2f55a4';
// Every section title sits the same distance in from the left and down from the section's top (clear of the torn edges).
const TITLE_SPACING = 'px-6 md:px-8 pt-20 md:pt-24';

/**
 * Play: each section is its own world, split by hard barriers, and titled with one huge word filled
 * with what it is (SectionTitle), the same for every section; no subtitles. Sky banner of ships, a link to the letters (their own page) on graph paper, an ASCII
 * Christmas tree, the wall after dejiajetomobi.com (blackletter over a wall of colored notes), and a launchpad after
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
      <SkyBanner id="sky" ships={ships} justLaunchedId={justLaunchedId}>
        <SectionTitle fill="rockets" className={TITLE_SPACING} />
      </SkyBanner>

      <TornEdge color={PAPER} seed={11} />

      {/* II. Letters, which live on their own page */}
      <section
        id="letters"
        className="min-h-[55svh] pb-16 md:pb-20"
        style={{
          backgroundColor: PAPER,
          backgroundImage: `linear-gradient(rgba(47,85,164,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(47,85,164,0.07) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      >
        <Link href="/letters" className="group block w-fit" aria-label="Read my letters">
          <SectionTitle fill="letters" className={TITLE_SPACING}>
            {/* Diagonal: it opens its own page */}
            <ArrowUpRight
              aria-hidden
              strokeWidth={3}
              className="inline-block ml-[0.02em] h-[0.42em] w-[0.42em] align-top transition-transform duration-300 group-hover:-translate-y-2 group-hover:translate-x-2"
              style={{ color: INK }}
            />
          </SectionTitle>
        </Link>
      </section>
      <TornEdge color={PAPER} below seed={4} />

      {/* III. A Christmas tree, grown character by character */}
      <AsciiTree className="h-[max(100svh,640px)] bg-[#070b12]">
        <SectionTitle fill="christmas" className={TITLE_SPACING} />
      </AsciiTree>

      {/* IV. The Wall, its white paper torn over the night */}
      <TornEdge color="#ffffff" seed={23} />
      <section id="wall" className={`${inter.className} bg-white text-black pb-28`}>
        <SectionTitle fill="guestbook" className={TITLE_SPACING} />
        <div className="mt-12 md:mt-16 px-6 md:px-8">
          <Guestbook colorWall />
        </div>
      </section>

      {/* V. Launchpad, which the white wall mists into */}
      <Dissolve />
      <Launchpad id="launchpad" onLaunch={onLaunch}>
        <SectionTitle fill="launchpad" className={TITLE_SPACING} />
      </Launchpad>
    </div>
  );
}
