'use client';

import { useState, useEffect, FormEvent } from 'react';
import Image from 'next/image';
import { Caveat } from 'next/font/google';
import Link from 'next/link';

const caveat = Caveat({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

// Update this to the plushie's name (compared case-insensitively)
const PASSWORD = 'derphy';

type Phase = 'locked' | 'unlocking' | 'idle' | 'open';

const blobs = [
  { left: '12vw', top: '18vh', blur: '38vmin', spread: '22vmin' },
  { left: '68vw', top: '8vh',  blur: '44vmin', spread: '28vmin' },
  { left: '85vw', top: '45vh', blur: '48vmin', spread: '24vmin' },
  { left: '32vw', top: '72vh', blur: '40vmin', spread: '30vmin' },
  { left: '5vw',  top: '52vh', blur: '46vmin', spread: '26vmin' },
  { left: '55vw', top: '38vh', blur: '36vmin', spread: '20vmin' },
  { left: '78vw', top: '78vh', blur: '50vmin', spread: '32vmin' },
  { left: '22vw', top: '5vh',  blur: '42vmin', spread: '24vmin' },
  { left: '92vw', top: '22vh', blur: '38vmin', spread: '22vmin' },
  { left: '45vw', top: '88vh', blur: '44vmin', spread: '28vmin' },
];

// Letter-stage is 460 × 595 (8.5/11 — the letter's fixed dimensions).
// `initial` translates the polaroid to letter-stage center.
const polaroids = [
  { src: '/letters/adela/img1.JPG',  pos: { top: -32, left: -130, width: 150 },     initial: { x: 285, y: 255 },   rotate: -8, delay: 1.8 },
  { src: '/letters/adela/img2.jpeg', pos: { top: -58, right: -110, width: 160 },    initial: { x: -260, y: 276 },  rotate: 6,  delay: 1.95 },
  { src: '/letters/adela/img3.jpeg', pos: { top: '38%', left: -150, width: 140 },   initial: { x: 310, y: -10 },   rotate: 7,  delay: 2.1 },
  { src: '/letters/adela/img4.jpeg', pos: { top: '30%', right: -135, width: 150 },  initial: { x: -290, y: -98 },  rotate: -6, delay: 2.25 },
  { src: '/letters/adela/img5.jpeg', pos: { bottom: 40, left: -120, width: 145 },   initial: { x: 278, y: -174 },  rotate: -4, delay: 2.4 },
  { src: '/letters/adela/img6.JPG',  pos: { bottom: 60, right: -125, width: 140 },  initial: { x: -285, y: -157 }, rotate: 5,  delay: 2.55 },
];

export default function FlipCard({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>('locked');
  const [pwInput, setPwInput] = useState('');
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [polaroidsSettled, setPolaroidsSettled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // After burst-out finishes, polaroids are "settled" — subsequent transitions
  // (zoom toggle) use fast timing instead of staggered emerge timing.
  useEffect(() => {
    if (phase === 'open') {
      const t = setTimeout(() => setPolaroidsSettled(true), 4500);
      return () => clearTimeout(t);
    }
    setPolaroidsSettled(false);
    setZoomed(false);
  }, [phase]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (pwInput.trim().toLowerCase() === PASSWORD) {
      setError(false);
      setPhase('unlocking');
      setTimeout(() => setPhase('idle'), 1200);
    } else {
      setError(true);
      setTimeout(() => setError(false), 700);
    }
  };

  const handleOpen = () => {
    if (phase !== 'idle') return;
    setPhase('open');
  };

  const handleToggleZoom = () => {
    if (phase !== 'open') return;
    setZoomed((z) => !z);
  };

  const isLocked = phase === 'locked';
  const isOpen = phase === 'open';
  const envelopeAtCenter = phase === 'unlocking' || phase === 'idle';

  // Dynamic letter dimensions — zoomed expands the letter to ~95vw for reading.
  const letterWidthExpr = isOpen && zoomed ? 'min(900px, 95vw)' : 'min(460px, 85vw)';
  const letterHeightExpr = `calc(${letterWidthExpr} * 11 / 8.5)`;

  return (
    <>
      <style>{`
        @keyframes adela-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-7px); }
          50% { transform: translateX(7px); }
          75% { transform: translateX(-5px); }
        }
      `}</style>

      <div
        className="fixed inset-0 z-40 bg-white overflow-hidden"
        style={{
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.7s linear',
        }}
      >
        {/* Sunset gradient + bokeh — invisible while locked, fades in with the envelope */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(160deg, #A3A1A6 45%, #DBCAAE 81%, #FDD597 89%)',
            opacity: isLocked ? 0 : 1,
            transition: 'opacity 1.2s linear',
          }}
        >
          {blobs.map((b, i) => (
            <div
              key={i}
              className="absolute w-px h-px rounded-full pointer-events-none"
              style={{
                left: b.left,
                top: b.top,
                boxShadow: `0 0 ${b.blur} ${b.spread} #f3ac94`,
              }}
            />
          ))}
        </div>

        {/* Title above (only when envelope is at center, before opening) */}
        <div
          className="absolute left-0 right-0 text-center z-[5] pointer-events-none flex-end"
          style={{
            top: 'clamp(2.5rem, 8vh, 5rem)',
            opacity: envelopeAtCenter ? 1 : 0,
            transform: envelopeAtCenter ? 'translateY(0)' : 'translateY(-16px)',
            transition: 'opacity 0.5s linear, transform 0.5s linear',
          }}
        >
          {/* <p
            className={`${caveat.className} m-0 font-semibold text-[#5a3a26]`}
            style={{ fontSize: 'clamp(28px, 4vw, 36px)' }}
          >
            happy 1 month
          </p> */}
          <p
            className={`${caveat.className} mt-20 mb-0 text-[18px] text-[#5c3d25]`}
          >
            tap the envelope to open ↓
          </p>
        </div>

        {/* PASSWORD PROMPT — floats directly on the page, no card */}
        <form
          onSubmit={handleSubmit}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[min(320px,82vw)] flex flex-col items-center"
          style={{
            opacity: isLocked ? 1 : 0,
            transition: 'opacity 0.55s linear',
            pointerEvents: isLocked ? 'auto' : 'none',
          }}
        >
          {/* Question */}
          <p
            className={`${caveat.className} text-center font-semibold mt-0 mb-4 relative z-[1] leading-tight text-[28px] text-[#7a3c22]`}
          >
            enter the password
          </p>

          {/* Plushie image */}
          <Image
            src="/letters/dino_smaller.png"
            alt="plushie"
            width={200}
            height={200}
            className="object-contain mx-auto mb-[1.4rem] block"
          />

          {/* Input */}
          <input
            type="text"
            value={pwInput}
            onChange={(e) => setPwInput(e.target.value)}
            autoFocus
            placeholder="what's his name?"
            autoComplete="off"
            spellCheck={false}
            className={`${caveat.className} w-full px-4 py-[0.6rem] outline-none text-center mb-3 box-border relative z-[1] font-medium text-[22px] text-[#5a3a26] border-[1.5px] border-[#d97a5b] bg-[rgba(255,250,235,0.65)]`}
            style={{
              animation: error ? 'adela-shake 0.5s linear' : undefined,
            }}
          />

          {/* Hint / error */}
          <p
            className="text-center m-0 relative z-[1] text-[13px]"
            style={{
              color: error ? '#c8323c' : '#a07d63',
              fontFamily: 'var(--font-serif), Georgia, serif',
              minHeight: 16,
            }}
          >
            {error ? "that's not it… try again" : 'press enter'}
          </p>
        </form>

        {/* Scroll container (letter) — hidden entirely while password is locked */}
        <div
          className="absolute inset-0 z-10 overflow-x-hidden"
          style={{
            overflowY: isOpen ? 'auto' : 'hidden',
            opacity: isLocked ? 0 : 1,
            transition: 'opacity 1.2s linear',
            pointerEvents: isLocked ? 'none' : undefined,
          }}
        >
          <div className="relative min-h-full flex flex-col justify-center items-center p-4">
            {/* "tap to zoom" hint — sits right above the letter */}
            <div
              className="text-center pointer-events-none"
              style={{
                width: letterWidthExpr,
                opacity: isOpen && !zoomed ? 1 : 0,
                transform: isOpen && !zoomed ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 0.5s linear 0.3s, transform 0.5s linear 0.3s, width 1.2s linear',
              }}
            >
              <p className={`${caveat.className} m-0 text-[18px] text-[#5c3d25]`}>
                tap the letter to zoom ↓
              </p>
            </div>

            {/* Letter stage — fixed at letter's full dimensions (8.5/11) */}
            <div
              className="relative flex items-center justify-center shrink-0"
              style={{
                width: letterWidthExpr,
                height: letterHeightExpr,
                margin: isOpen ? '6vh 0 0' : 0,
                transform: isLocked ? 'translateY(100vh)' : 'translateY(0)',
                transition:
                  'margin 1.2s linear 0.4s,' +
                  ' transform 1.2s linear,' +
                  ' width 1.2s linear,' +
                  ' height 1.2s linear',
              }}
            >
              {/* Polaroids — burst out from envelope center */}
              {polaroids.map((p, i) => (
                <Polaroid
                  key={i}
                  src={p.src}
                  pos={p.pos}
                  initial={p.initial}
                  rotate={p.rotate}
                  visible={isOpen && !zoomed}
                  settled={polaroidsSettled}
                  delay={p.delay}
                />
              ))}

              {/* Clipping wrapper — width is fixed at letter width; only height grows */}
              <div
                className="w-full overflow-hidden relative z-[1]"
                style={{
                  height: isOpen ? letterHeightExpr : 'min(320px, 58vw)',
                  transition: 'height 1.2s linear',
                  boxShadow:
                    '0 18px 50px rgba(80,40,20,0.22), 0 4px 12px rgba(60,30,15,0.08)',
                }}
              >
                {/* Letter image (always 8.5/11). Click to toggle zoom when open. */}
                <div
                  className="relative w-full aspect-[8.5/11]"
                  onClick={handleToggleZoom}
                  style={{
                    cursor: isOpen ? (zoomed ? 'zoom-out' : 'zoom-in') : 'default',
                  }}
                >
                  <Image
                    src="/letters/adela-letter.png"
                    alt="letter"
                    fill
                    sizes="(max-width: 540px) 95vw, 900px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Link below the letter (fades in last) */}
            <div
              className="mt-8"
              style={{
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 0.7s linear 2.7s, transform 0.7s linear 2.7s',
                pointerEvents: isOpen ? 'auto' : 'none',
              }}
            >
              <a
                href="/letters/adela-1month.png"
                download="adela-1month.png"
                className={`${caveat.className} text-[26px] text-[#c4623f] font-semibold underline decoration-[#d97a5b] decoration-2 underline-offset-[6px] hover:text-[#a8512f] transition-colors`}
              >
                download
              </a>
            </div>

            {/* MDX content (hidden — kept for future use) */}
            <div className="hidden">{children}</div>
          </div>
        </div>

        {/* AIRMAIL ENVELOPE
            - locked: below viewport
            - unlocking → idle: centered
            - open: falls back below */}
        <div
          onClick={handleOpen}
          className="fixed top-1/2 left-1/2 z-30 overflow-hidden bg-[#bcd66a]"
          style={{
            width: 'min(500px, 92vw)',
            height: 'min(340px, 62vw)',
            transform: envelopeAtCenter
              ? 'translate(-50%, -50%) rotate(-2deg)'
              : isOpen
                ? 'translate(-50%, calc(50vh + 280px)) rotate(9deg)'
                : 'translate(-50%, calc(50vh + 280px)) rotate(0deg)',
            transition: 'transform 1.2s linear',
            cursor: phase === 'idle' ? 'pointer' : 'default',
            pointerEvents: phase === 'idle' ? 'auto' : 'none',
            boxShadow:
              '0 22px 60px rgba(80,40,20,0.38), 0 8px 20px rgba(0,0,0,0.14)',
          }}
        >
          {/* Airmail diagonal stripe pattern (full bleed) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `repeating-linear-gradient(
                45deg,
                #e85a8e 0px,
                #e85a8e 11px,
                #fdf0f5 11px,
                #fdf0f5 20px,
                #f4a6c6 20px,
                #f4a6c6 31px,
                #fdf0f5 31px,
                #fdf0f5 40px
              )`,
            }}
          />

          {/* Inner cream — covers center, leaving stripes as a border */}
          <div
            className="absolute inset-[20px] flex flex-col items-center justify-center p-4"
            style={{
              gap: 14,
              background: 'linear-gradient(180deg, #ebcfac 0%, #ddb98e 100%)',
              boxShadow: 'inset 0 0 30px rgba(60,90,20,0.15)',
            }}
          >
            {/* <div
              className="absolute top-[38%] left-[8%] right-[8%] pointer-events-none"
              style={{
                height: 1.5,
                background:
                  'linear-gradient(90deg, transparent, rgba(139,74,47,0.22) 20%, rgba(139,74,47,0.22) 80%, transparent)',
              }}
            /> */}

            <span
              className={`${caveat.className} font-semibold text-[#4a5e1a] leading-none`}
              style={{
                fontSize: 'clamp(54px, 13vw, 78px)',
                transform: 'rotate(-1deg)',
                textShadow: '0 1px 0 rgba(255,250,240,0.4)',
              }}
            >
              to adela
            </span>
            {/* <span
              className={`${caveat.className} text-[18px] text-[#9c5e3e] font-medium opacity-90 tracking-[0.02em]`}
            >
              smile before u open ♡
            </span> */}
          </div>

          {/* Stamp in corner */}
          <div
            className="absolute top-[30px] right-[30px] flex items-center justify-center"
            style={{
              width: 64,
              height: 52,
              background:
                'repeating-linear-gradient(0deg, transparent 0, transparent 5px, rgba(122,60,34,0.18) 5px, rgba(122,60,34,0.18) 6px),' +
                ' linear-gradient(135deg, #d97a5b 0%, #c4623f 100%)',
              border: '2px dashed rgba(253,245,232,0.6)',
              transform: 'rotate(6deg)',
            }}
          >
            <Image
                src="/letters/dino_smaller.png"
                alt="stamp"
                width={50}
                height={50}
                className="object-contain block"
            />
            {/* <SunDoodle style={{ width: 26, color: '#fdf5e8' }} /> */}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- Doodles ---------- */

function SunDoodle({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 44 44" style={style} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="22" cy="22" r="6.5" />
      <line x1="22" y1="3" x2="22" y2="9" />
      <line x1="22" y1="35" x2="22" y2="41" />
      <line x1="3" y1="22" x2="9" y2="22" />
      <line x1="35" y1="22" x2="41" y2="22" />
      <line x1="8.5" y1="8.5" x2="12.7" y2="12.7" />
      <line x1="31.3" y1="31.3" x2="35.5" y2="35.5" />
      <line x1="35.5" y1="8.5" x2="31.3" y2="12.7" />
      <line x1="12.7" y1="31.3" x2="8.5" y2="35.5" />
    </svg>
  );
}

type PolaroidPos = {
  top?: number | string;
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
  width: number;
};

function Polaroid({
  src,
  pos,
  initial,
  rotate,
  visible,
  settled,
  delay,
}: {
  src: string;
  pos: PolaroidPos;
  initial: { x: number; y: number };
  rotate: number;
  visible: boolean;
  settled: boolean;
  delay: number;
}) {
  return (
    <div
      className="hidden md:block absolute z-0 bg-[#fffdf6] pt-[10px] px-[10px] pb-[32px]"
      style={{
        top: pos.top,
        bottom: pos.bottom,
        left: pos.left,
        right: pos.right,
        width: pos.width,
        boxShadow: '0 10px 24px rgba(80,40,20,0.22), 0 2px 6px rgba(0,0,0,0.08)',
        transform: visible
          ? `rotate(${rotate}deg)`
          : `translate(${initial.x}px, ${initial.y}px) rotate(${rotate}deg) scale(0.45)`,
        opacity: visible ? 1 : 0,
        transition: settled
          ? 'transform 0.5s linear, opacity 0.4s linear'
          : `transform 1.4s linear ${delay}s, opacity 0.9s linear ${delay}s`,
      }}
    >
      <div className="w-full aspect-square overflow-hidden bg-[#e8d9c5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="w-full h-full object-cover block"
        />
      </div>
    </div>
  );
}
