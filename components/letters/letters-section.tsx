import { Special_Elite } from 'next/font/google';
import { letters } from '@/content/letters';
import LetterCard from './letter-card';

const typewriter = Special_Elite({ subsets: ['latin'], weight: '400' });

const rotations = [-1.5, 1, -0.5, 2, -2, 0.5, 1.5];
/** Staggered drops so the prints read as laid down by hand, not gridded. */
const drops = [0, 40, 12, 56, 4, 32, 18];

/** The letters as photo prints on graph paper, under a typewritten "read my letters". */
export default function LettersSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 md:px-12 pt-20 md:pt-28 pb-24 md:pb-32">
      {/* Rough paper edge for the prints (applied to their white mounts only) */}
      <svg aria-hidden className="absolute w-0 h-0">
        <filter id="deckle">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="2" />
          <feDisplacementMap in="SourceGraphic" scale="7" />
        </filter>
      </svg>

      <h2 className={`${typewriter.className} text-[#2f55a4] text-5xl sm:text-6xl md:text-[84px] leading-[0.95]`}>
        read my letters
      </h2>

      <div className="mt-14 md:mt-20 grid grid-cols-2 gap-x-6 gap-y-12 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-10 md:gap-x-14 sm:gap-y-16">
        {letters.map((letter, i) => (
          <LetterCard
            key={letter.slug}
            letter={letter}
            sizes="(min-width: 640px) 200px, 45vw"
            className="sm:w-[180px] md:w-[210px] sm:[margin-top:var(--drop)]"
            style={{ rotate: `${rotations[i % rotations.length]}deg`, ['--drop' as string]: `${drops[i % drops.length]}px` }}
          />
        ))}
      </div>
    </section>
  );
}
