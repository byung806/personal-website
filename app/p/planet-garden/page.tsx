'use client';

import { Josefin_Sans } from 'next/font/google';
import PlanetSky from '@/components/planet-garden/planet-sky';
import PlanetDrawer from '@/components/planet-garden/planet-drawer';
import { usePlanets } from '@/components/planet-garden/use-planets';

const sans = Josefin_Sans({ subsets: ['latin'], weight: ['400', '600'] });

export default function PlanetGardenPage() {
  const { planets, refresh } = usePlanets();

  return (
    <div className={`${sans.className} pb-24`}>
      <PlanetSky planets={planets}>
        <h1 className={`[font-family:var(--font-serif)] italic text-5xl md:text-[64px] leading-[1.1] text-[#fafafa]`}>
          Planet Garden
        </h1>
      </PlanetSky>
      <PlanetDrawer planets={planets} onLaunched={refresh} />
    </div>
  );
}
