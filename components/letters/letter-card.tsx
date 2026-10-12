import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Courier_Prime } from 'next/font/google';
import type { Letter } from '@/content/letters';

const courier = Courier_Prime({ subsets: ['latin'], weight: ['400', '700'] });

/**
 * A letter as a black-and-white print with a rough white border and a typed caption. Published letters
 * link to the letter and come into color on hover; unsent ones are faded. `className`/`style` position it.
 * Expects an SVG filter with id "deckle" on the page (see LettersSection).
 */
export default function LetterCard({
  letter,
  sizes = '20vw',
  className = '',
  style,
}: {
  letter: Letter;
  sizes?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const active = letter.active ?? false;

  const print = (
    <>
      <div className="relative p-2.5 pb-3">
        <div aria-hidden className="absolute inset-0 bg-white shadow-[0_10px_22px_-14px_rgba(30,40,80,0.45)] [filter:url(#deckle)]" />
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
          <Image
            src={letter.photo}
            alt={letter.to}
            fill
            sizes={sizes}
            className={`object-cover ${active ? '' : 'grayscale contrast-[1.15] opacity-60'}`}
          />
        </div>
      </div>
      <p className={`${courier.className} mt-3 text-[15px] leading-snug ${active ? 'text-[#2f55a4] group-hover:underline underline-offset-4' : 'text-[#2f55a4]/60'}`}>
        to {letter.to}
      </p>
      <p className={`${courier.className} text-[13px] ${active ? 'text-[#2f55a4]/60' : 'text-[#2f55a4]/55'}`}>
        {active ? letter.date : 'not sent yet'}
      </p>
    </>
  );

  return active ? (
    <Link href={`/letters/${letter.slug}`} className={`group block ${className}`} style={style}>
      {print}
    </Link>
  ) : (
    <div className={className} style={style}>
      {print}
    </div>
  );
}
