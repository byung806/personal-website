'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Silkscreen } from 'next/font/google';
import { letters } from '@/content/letters';

const silkscreen = Silkscreen({ subsets: ['latin'], weight: '400' });

// All positions in vw (baseline: 1440px wide)
const cardConfigs = [
  { offsetVw: -4.5,  top: '14%', rotation: -1.5, widthVw: 16,   widthMax: 230 },
  { offsetVw: -27.8, top: '22%', rotation: -4,   widthVw: 14.9, widthMax: 215 },
  { offsetVw: -15.6, top: '46%', rotation: 2.5,  widthVw: 13.5, widthMax: 195 },
  { offsetVw: -40.3, top: '32%', rotation: -3,   widthVw: 14.6, widthMax: 210 },
  { offsetVw: 8,     top: '42%', rotation: 3.5,  widthVw: 13.9, widthMax: 200 },
  { offsetVw: 17.7,  top: '18%', rotation: -2.5, widthVw: 15.3, widthMax: 220 },
  { offsetVw: 26.7,  top: '42%', rotation: 1.5,  widthVw: 14.6, widthMax: 210 },
];

const mobileRotations = [-2, 3, -1.5, 2.5, -3, 1, -2.5, 2, -1, 3.5];

export default function LettersPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const lock = () => {
      document.body.style.overflow = window.innerWidth >= 768 ? 'hidden' : 'auto';
    };
    lock();
    window.addEventListener('resize', lock);
    return () => {
      window.removeEventListener('resize', lock);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      {/* ── Mobile ── */}
      <main className={`md:hidden w-full bg-white px-4 py-8 transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="mb-6 select-none leading-none">
          <span className={silkscreen.className} style={{ fontSize: '15vw', color: '#81cc3e', lineHeight: 0.85, display: 'block' }}>DEAR</span>
          <span className={silkscreen.className} style={{ fontSize: '15vw', color: '#81cc3e', lineHeight: 0.85, display: 'block' }}>ANYONE</span>
          <span className={silkscreen.className} style={{ fontSize: '15vw', color: '#81cc3e', lineHeight: 0.85, display: 'block' }}>AT ALL</span>
        </div>
        <p className="font-serif text-gray-500 text-base mb-8">
          Welcome to my blog. I thought it would be more interesting if each entry was a letter.
        </p>
        <div className="grid grid-cols-2 gap-5">
          {letters.map((letter, i) => {
            const rotation = mobileRotations[i % mobileRotations.length];
            const active = letter.active ?? false;
            const card = (
              <div
                className={`relative overflow-hidden rounded-lg${active ? ' shadow-md' : ''}`}
                style={{ aspectRatio: '3/4', transform: `rotate(${rotation}deg)`, boxShadow: active ? '0 4px 18px rgba(0,0,0,0.1)' : '0 4px 18px rgba(0,0,0,0.07)' }}
              >
                <Image src={letter.photo} alt={letter.to} fill className={`object-cover${active ? '' : ' grayscale opacity-80'}`} sizes="45vw" />
                {active && (
                  <div className="absolute bottom-2 right-2">
                    <span className="font-serif text-sm font-bold text-white underline underline-offset-2" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>read →</span>
                  </div>
                )}
              </div>
            );
            return active ? (
              <Link key={letter.slug} href={`/letters/${letter.slug}`}>{card}</Link>
            ) : (
              <div key={letter.slug}>{card}</div>
            );
          })}
        </div>
      </main>

      {/* ── Desktop ── */}
      <main className={`hidden md:block relative w-full overflow-hidden bg-white transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`} style={{ height: 'calc(100dvh - 60px)' }}>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none select-none z-10 w-full px-4">
          <p className="font-serif text-gray-700 text-base leading-relaxed">
            Welcome to my blog. I thought it would be more interesting if each entry was a letter.
          </p>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <span className={silkscreen.className} style={{ fontSize: '11vw', color: '#81cc3e', lineHeight: 0.85 }}>DEAR ANYONE</span>
          <span className={silkscreen.className} style={{ fontSize: '11vw', color: '#81cc3e', lineHeight: 0.85 }}>AT ALL</span>
        </div>

        {letters.map((letter, i) => {
          const c = cardConfigs[i];
          const active = letter.active ?? false;
          const w = `clamp(90px, ${c.widthVw}vw, ${c.widthMax}px)`;
          const card = active ? (
            <div
              className="relative overflow-hidden rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_40px_12px_rgba(129,204,62,0.5)]"
              style={{ aspectRatio: '3/4', boxShadow: '0 4px 18px rgba(0,0,0,0.1)' }}
            >
              <Image src={letter.photo} alt={letter.to} fill className="object-cover" sizes="20vw" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(0,0,0,0.38)' }}>
                <p className="font-serif text-white/80 font-bold text-lg leading-tight">Letter to</p>
                <p className="font-serif text-white font-bold text-2xl leading-tight">{letter.to}</p>
              </div>
              <div className="absolute bottom-3 right-3">
                <span className="font-serif text-lg font-bold text-white underline underline-offset-2" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>read →</span>
              </div>
            </div>
          ) : (
            <div
              className="relative overflow-hidden rounded-lg"
              style={{ aspectRatio: '3/4', boxShadow: '0 4px 18px rgba(0,0,0,0.08)' }}
            >
              <Image src={letter.photo} alt={letter.to} fill className="object-cover grayscale opacity-80" sizes="20vw" />
            </div>
          );

          return active ? (
            <Link
              key={letter.slug}
              href={`/letters/${letter.slug}`}
              className="absolute group cursor-pointer"
              style={{ left: `calc(50% + ${c.offsetVw}vw)`, top: c.top, width: w, transform: `rotate(${c.rotation}deg)`, zIndex: 20 + i }}
            >
              {card}
            </Link>
          ) : (
            <div
              key={letter.slug}
              className="absolute"
              style={{ left: `calc(50% + ${c.offsetVw}vw)`, top: c.top, width: w, transform: `rotate(${c.rotation}deg)`, zIndex: i }}
            >
              {card}
            </div>
          );
        })}
      </main>
    </>
  );
}
