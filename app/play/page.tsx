'use client';

import Launchpad from '@/components/launchpad/launchpad';
import DeepSpace from '@/components/launchpad/deep-space';
import RocketField, { PlanetLink, useRockets } from '@/components/launchpad/rocket-field';
import { PLANETS } from '@/components/launchpad/planet-paint';

/**
 * Play: one long stretch of procedural, parallax space. Every guestbook signature is a rocket floating in it, planets
 * among them lead to the other pages (each its own world), and at the bottom is the launchpad where you
 * build a rocket, sign it and launch it up to join the rest.
 */
export default function PlayPage() {
  const { rockets, sign, land, justLaunchedId } = useRockets();

  const onGone = () => {
    land();
    // Follow the rocket up to the top, where it arrives
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div className="relative overflow-x-clip">
      <DeepSpace className="fixed inset-0" />

      <div className="relative px-2 sm:px-6 lg:px-10 pt-24 md:pt-28 pb-16">
        <RocketField
          rockets={rockets}
          justLaunchedId={justLaunchedId}
          planets={[
            [1, <PlanetLink key="letters" href="/letters" look={PLANETS.letters} label="read my letters" seed={3} />],
            [15, <PlanetLink key="garden" href="/p/planet-garden" look={PLANETS.garden} label="draw a planet" seed={8} />, 'sm:col-start-3 lg:col-start-5'],
          ]}
        />
      </div>

      <Launchpad id="launchpad" sign={sign} onGone={onGone} />
    </div>
  );
}
