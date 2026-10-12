'use client';

import { Josefin_Sans } from 'next/font/google';
import PlanetSky from '@/components/planet-garden/planet-sky';
import PlanetDrawer from '@/components/planet-garden/planet-drawer';
import CompanionPlanet from '@/components/planet-garden/companion-planet';
import { usePlanets } from '@/components/planet-garden/use-planets';
import LettersSection from '@/components/letters/letters-section';
import Guestbook from '@/components/guestbook/guestbook';

const sans = Josefin_Sans({ subsets: ['latin'], weight: ['400', '600'] });

/** Planet garden hero, then the letters, then the guestbook. */
export default function FunPage() {
  const { planets, refresh } = usePlanets();

  return (
    <div className={sans.className}>
      <PlanetSky planets={planets}>
        {/* Bottom margin keeps the title clear of the drawing planet sitting on the hero's edge */}
        <div className="mb-[160px] sm:mb-[190px] md:mb-[210px]">
          <h1 className="[font-family:var(--font-serif)] italic text-5xl md:text-[64px] leading-[1.1] text-[#fafafa]">
            Planet Garden
          </h1>
        </div>
      </PlanetSky>

      {/* Half in space, half on the page */}
      <PlanetDrawer planets={planets} onLaunched={refresh} straddle />

      {/* The newest planet follows you down the page */}
      <CompanionPlanet planet={planets[planets.length - 1]} />

      <LettersSection />

      <section className="px-3 md:px-4 pt-8 pb-20 md:pb-32">
        <Guestbook />
      </section>
    </div>
  );
}
