import type { CSSProperties, ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { NOTE_COLORS } from '@/lib/note-colors';

const inter = Inter({ subsets: ['latin'], weight: '900' });

/** A scattered wall of sticky notes in the guestbook's colors, as a tile. */
function notesTile() {
  let seed = 9;
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const notes: string[] = [];
  for (let i = 0; i < 46; i++) {
    const s = 26 + r() * 22;
    const x = r() * 220 - s / 2, y = r() * 220 - s / 2;
    const fill = NOTE_COLORS[Math.floor(r() * (NOTE_COLORS.length - 1))]; // skips the near-black note
    const rect = `<rect width='${s.toFixed(1)}' height='${s.toFixed(1)}' fill='${fill}' transform='rotate(${(r() * 24 - 12).toFixed(1)} ${(s / 2).toFixed(1)} ${(s / 2).toFixed(1)})'/>`;
    // Drawn again a tile over wherever it crosses an edge, so the tile repeats seamlessly.
    for (const dx of [0, -220, 220]) for (const dy of [0, -220, 220]) {
      if ((dx && x + dx > -s && x + dx < 220) || !dx) if ((dy && y + dy > -s && y + dy < 220) || !dy) notes.push(`<g transform='translate(${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)})'>${rect}</g>`);
    }
  }
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><rect width='220' height='220' fill='#f6d743'/>${notes.join('')}</svg>`)}")`;
}

/** What each section's title is filled with. Rockets and letters drift slowly (globals.css `.title-fill`); the rest hold still. */
const FILLS: Record<string, CSSProperties> = {
  rockets: {
    backgroundColor: '#3b2a9a',
    backgroundImage: [
      'radial-gradient(1.5px 1.5px at 10% 15%, #fff 50%, transparent 51%)',
      'radial-gradient(1px 1px at 45% 60%, #fff 50%, transparent 51%)',
      'radial-gradient(2px 2px at 75% 30%, #fff 50%, transparent 51%)',
      'radial-gradient(1px 1px at 30% 85%, #ffe9b0 50%, transparent 51%)',
      'radial-gradient(1.5px 1.5px at 90% 95%, #cfe6ff 50%, transparent 51%)',
      'radial-gradient(ellipse 30% 45% at 22% 40%, #ff5fa2 0%, transparent 70%)',
      'radial-gradient(ellipse 35% 50% at 70% 60%, #3fd0ff 0%, transparent 70%)',
      'radial-gradient(ellipse 30% 40% at 48% 25%, #a46bff 0%, transparent 70%)',
      'radial-gradient(ellipse 25% 40% at 90% 30%, #ff9a5f 0%, transparent 70%)',
      'linear-gradient(120deg, #2b1d7a, #6a2fd6 40%, #1e3fa8 75%, #4a1f8a)',
    ].join(','),
    // Sized in em, so every texture scales with the word on any screen.
    backgroundSize: '0.95em 0.95em, 0.95em 0.95em, 0.95em 0.95em, 0.95em 0.95em, 0.95em 0.95em, 140% 140%, 140% 140%, 140% 140%, 140% 140%, 100% 100%',
  },
  letters: {
    backgroundColor: '#2f55a4',
    backgroundImage: [
      // A red margin rule, then the page's ruled lines, over a wash of fountain-pen ink.
      'linear-gradient(90deg, transparent 0 7%, rgba(228,87,46,0.9) 7% calc(7% + 3px), transparent calc(7% + 3px))',
      'linear-gradient(180deg, transparent calc(100% - 2px), rgba(247,246,241,0.55) calc(100% - 2px))',
      'radial-gradient(ellipse 40% 60% at 20% 30%, #4b78d0 0%, transparent 70%)',
      'radial-gradient(ellipse 35% 55% at 75% 70%, #1c3a80 0%, transparent 70%)',
      'radial-gradient(ellipse 30% 50% at 55% 20%, #3a6bc4 0%, transparent 70%)',
    ].join(','),
    backgroundSize: '100% 100%, 100% 0.115em, 140% 140%, 140% 140%, 140% 140%',
  },
  christmas: {
    backgroundColor: '#d81f2a',
    // One stripe period is 0.38em; a -45° tile repeats seamlessly at that times √2.
    backgroundImage: 'repeating-linear-gradient(-45deg, #e11d2e 0 0.12em, #fff8f0 0.12em 0.19em, #1f9a45 0.19em 0.31em, #fff8f0 0.31em 0.38em)',
    backgroundSize: '0.5374em 0.5374em',
  },
  guestbook: {
    backgroundColor: '#f6d743',
    backgroundImage: notesTile(),
    backgroundSize: '1.05em 1.05em',
  },
  launchpad: {
    // Rocket exhaust: white-hot at the top of each letter, burning down through gold and orange to red.
    backgroundColor: '#f2541b',
    backgroundImage: [
      'radial-gradient(ellipse 18% 55% at 12% 100%, rgba(255,241,184,0.75) 0%, transparent 70%)',
      'radial-gradient(ellipse 16% 50% at 47% 100%, rgba(255,241,184,0.6) 0%, transparent 70%)',
      'radial-gradient(ellipse 18% 55% at 83% 100%, rgba(255,241,184,0.7) 0%, transparent 70%)',
      'linear-gradient(180deg, #fff3c4 0%, #ffd23f 22%, #ff9a1f 48%, #f2541b 72%, #c4201a 100%)',
    ].join(','),
  },
};

/**
 * A section's title: one huge, heavy lowercase word filled with what the section is (a galaxy, candy cane, ink,
 * sticky notes, rocket fire). Every section on /play uses this, so they read as one set.
 */
export default function SectionTitle({ fill, children, className = '' }: { fill: keyof typeof FILLS; children?: ReactNode; className?: string }) {
  return (
    <h2 className={`${inter.className} ${className} text-[17vw] md:text-[15vw] font-black lowercase leading-[0.8] tracking-[-0.06em] -ml-[0.04em] whitespace-nowrap`}>
      {/* Padded below so the fill reaches the descenders (it only paints inside the box), pulled back so spacing holds. */}
      <span className={`title-fill title-fill-${fill} inline-block pb-[0.22em] -mb-[0.14em] pr-[0.04em]`} style={FILLS[fill]}>
        {fill}
      </span>
      {children}
    </h2>
  );
}
