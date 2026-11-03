'use client';

import Launchpad from '@/components/launchpad/launchpad';
import DeepSpace from '@/components/launchpad/deep-space';
import RocketField, { useRockets } from '@/components/launchpad/rocket-field';

/**
 * Play: one long stretch of procedural, parallax space. Every guestbook signature is a rocket orbiting one
 * of its planets (two of which lead to the other pages), and at the bottom is the launchpad where you
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
        <RocketField rockets={rockets} justLaunchedId={justLaunchedId} />
      </div>

      <Launchpad id="launchpad" sign={sign} onGone={onGone} />
    </div>
  );
}
