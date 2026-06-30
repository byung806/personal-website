'use client';

import { useState, useEffect, FormEvent } from 'react';
import Image from 'next/image';
import { Caveat } from 'next/font/google';

const caveat = Caveat({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export type PolaroidDef = {
  src: string;
  pos: {
    top?: number | string;
    bottom?: number | string;
    left?: number | string;
    right?: number | string;
    width: number;
  };
  initial: { x: number; y: number };
  rotate: number;
  delay: number;
};

export type FlipCardConfig = {
  // Password gate — omit entirely for no gate
  password?: string;
  passwordImage?: string;
  passwordQuestion?: string;
  passwordPlaceholder?: string;

  // Envelope appearance
  envelopeLabel: string;
  envelopeBg: string;
  envelopeStripes: string;
  envelopeInnerBg: string;
  envelopeLabelColor: string;
  envelopeLabelShadow?: string;
  stampSrc?: string;

  // Background
  backgroundGradient: string;
  blobColor: string;

  // Letter — provide an image src for image mode, or omit for text mode (children rendered as prose)
  letterSrc?: string;

  // Polaroids (optional)
  polaroids?: PolaroidDef[];
  polaroidImageAspect?: string; // e.g. '4/3' for landscape; default '1/1' (square)

  // Download link (optional)
  download?: {
    src: string;
    label?: string;
    color?: string;
  };
};

const DEFAULT_BLOBS = [
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

type Phase = 'locked' | 'unlocking' | 'idle' | 'open';

export default function FlipCard({
  config,
  children,
}: {
  config: FlipCardConfig;
  children?: React.ReactNode;
}) {
  const hasPassword = !!config.password;
  const initialPhase: Phase = hasPassword ? 'locked' : 'idle';

  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [pwInput, setPwInput] = useState('');
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [polaroidsSettled, setPolaroidsSettled] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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
    if (pwInput.trim().toLowerCase() === config.password) {
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
  const isTextMode = !config.letterSrc;

  const letterWidthExpr = isOpen && zoomed ? 'min(900px, 95vw)' : 'min(460px, 85vw)';
  const letterHeightExpr = `calc(${letterWidthExpr} * 11 / 8.5)`;
  const textWidthExpr = 'min(560px, 90vw)';

  const polaroids = config.polaroids ?? [];

  return (
    <>
      <style>{`
        @keyframes flipcard-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-7px); }
          50% { transform: translateX(7px); }
          75% { transform: translateX(-5px); }
        }
      `}</style>

      <div
        className="fixed inset-0 z-40 bg-white overflow-hidden"
        style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.7s linear' }}
      >
        {/* Background gradient + bokeh */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: config.backgroundGradient,
            opacity: isLocked ? 0 : 1,
            transition: 'opacity 1.2s linear',
          }}
        >
          {DEFAULT_BLOBS.map((b, i) => (
            <div
              key={i}
              className="absolute w-px h-px rounded-full pointer-events-none"
              style={{
                left: b.left,
                top: b.top,
                boxShadow: `0 0 ${b.blur} ${b.spread} ${config.blobColor}`,
              }}
            />
          ))}
        </div>

        {/* Title above envelope */}
        <div
          className="absolute left-0 right-0 text-center z-[5] pointer-events-none"
          style={{
            top: 'clamp(2.5rem, 8vh, 5rem)',
            opacity: envelopeAtCenter ? 1 : 0,
            transform: envelopeAtCenter ? 'translateY(0)' : 'translateY(-16px)',
            transition: 'opacity 0.5s linear, transform 0.5s linear',
          }}
        >
          <p className={`${caveat.className} mt-20 mb-0 text-[18px] text-[#5c3d25]`}>
            tap the envelope to open ↓
          </p>
        </div>

        {/* Password prompt */}
        {hasPassword && (
          <form
            onSubmit={handleSubmit}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[min(320px,82vw)] flex flex-col items-center"
            style={{
              opacity: isLocked ? 1 : 0,
              transition: 'opacity 0.55s linear',
              pointerEvents: isLocked ? 'auto' : 'none',
            }}
          >
            <p
              className={`${caveat.className} text-center font-semibold mt-0 mb-4 relative z-[1] leading-tight text-[28px] text-[#7a3c22]`}
            >
              {config.passwordQuestion ?? 'enter the password'}
            </p>

            {config.passwordImage && (
              <Image
                src={config.passwordImage}
                alt="hint"
                width={200}
                height={200}
                className="object-contain mx-auto mb-[1.4rem] block"
              />
            )}

            <input
              type="text"
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
              autoFocus
              placeholder={config.passwordPlaceholder ?? 'password'}
              autoComplete="off"
              spellCheck={false}
              className={`${caveat.className} w-full px-4 py-[0.6rem] outline-none text-center mb-3 box-border relative z-[1] font-medium text-[22px] text-[#5a3a26] border-[1.5px] border-[#d97a5b] bg-[rgba(255,250,235,0.65)]`}
              style={{ animation: error ? 'flipcard-shake 0.5s linear' : undefined }}
            />

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
        )}

        {/* Scroll container (letter) */}
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
            {/* Tap to zoom hint — image mode only */}
            {!isTextMode && (
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
            )}

            {/* Letter stage */}
            <div
              className={`relative flex justify-center shrink-0 ${isTextMode ? 'items-start' : 'items-center'}`}
              style={{
                width: isTextMode ? textWidthExpr : letterWidthExpr,
                height: isTextMode ? undefined : letterHeightExpr,
                margin: isOpen ? '6vh 0 0' : 0,
                transform: isLocked ? 'translateY(100vh)' : 'translateY(0)',
                transition:
                  'margin 1.2s linear 0.4s,' +
                  ' transform 1.2s linear,' +
                  ' width 1.2s linear,' +
                  (!isTextMode ? ' height 1.2s linear' : ''),
              }}
            >
              {/* Polaroids */}
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
                  imageAspect={config.polaroidImageAspect ?? '1/1'}
                />
              ))}

              {isTextMode ? (
                /* Text mode: white paper with prose */
                <div
                  className="w-full relative z-[1] bg-white overflow-hidden"
                  style={{
                    maxHeight: isOpen ? '1200px' : 'min(320px, 58vw)',
                    transition: 'max-height 1.2s linear',
                    boxShadow: '0 18px 50px rgba(80,40,20,0.22), 0 4px 12px rgba(60,30,15,0.08)',
                  }}
                >
                  <div className="px-8 py-7 sm:px-12 sm:py-9 font-serif text-gray-700 text-[1.05rem] leading-[1.7] [&>div]:mb-3 [&>div:last-child]:mb-0 [&>p]:mb-3">
                    {children}
                  </div>
                </div>
              ) : (
                /* Image mode: fixed aspect ratio, zoomable */
                <div
                  className="w-full overflow-hidden relative z-[1]"
                  style={{
                    height: isOpen ? letterHeightExpr : 'min(320px, 58vw)',
                    transition: 'height 1.2s linear',
                    boxShadow: '0 18px 50px rgba(80,40,20,0.22), 0 4px 12px rgba(60,30,15,0.08)',
                  }}
                >
                  <div
                    className="relative w-full aspect-[8.5/11]"
                    onClick={handleToggleZoom}
                    style={{ cursor: isOpen ? (zoomed ? 'zoom-out' : 'zoom-in') : 'default' }}
                  >
                    <Image
                      src={config.letterSrc!}
                      alt="letter"
                      fill
                      sizes="(max-width: 540px) 95vw, 900px"
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Download link */}
            {config.download && (
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
                  href={config.download.src}
                  download
                  className={`${caveat.className} text-[26px] font-semibold underline decoration-2 underline-offset-[6px] transition-colors`}
                  style={{
                    color: config.download.color ?? '#c4623f',
                    textDecorationColor: config.download.color ?? '#d97a5b',
                  }}
                >
                  {config.download.label ?? 'download'}
                </a>
              </div>
            )}

            {/* children used directly in text mode above */}
          </div>
        </div>

        {/* Envelope */}
        <div
          onClick={handleOpen}
          className="fixed top-1/2 left-1/2 z-30 overflow-hidden"
          style={{
            width: 'min(500px, 92vw)',
            height: 'min(340px, 62vw)',
            backgroundColor: config.envelopeBg,
            transform: envelopeAtCenter
              ? 'translate(-50%, -50%) rotate(-2deg)'
              : isOpen
                ? 'translate(-50%, calc(50vh + 280px)) rotate(9deg)'
                : 'translate(-50%, calc(50vh + 280px)) rotate(0deg)',
            transition: 'transform 1.2s linear',
            cursor: phase === 'idle' ? 'pointer' : 'default',
            pointerEvents: phase === 'idle' ? 'auto' : 'none',
            boxShadow: '0 22px 60px rgba(80,40,20,0.38), 0 8px 20px rgba(0,0,0,0.14)',
          }}
        >
          {/* Airmail stripes */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: config.envelopeStripes }}
          />

          {/* Inner panel */}
          <div
            className="absolute inset-[20px] flex flex-col items-center justify-center p-4"
            style={{
              gap: 14,
              background: config.envelopeInnerBg,
              boxShadow: 'inset 0 0 30px rgba(60,90,20,0.15)',
            }}
          >
            <span
              className={`${caveat.className} font-semibold leading-none`}
              style={{
                fontSize: 'clamp(54px, 13vw, 78px)',
                transform: 'rotate(-1deg)',
                color: config.envelopeLabelColor,
                textShadow: config.envelopeLabelShadow,
              }}
            >
              {config.envelopeLabel}
            </span>
          </div>

          {/* Stamp */}
          {config.stampSrc && (
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
              <Image src={config.stampSrc} alt="stamp" width={50} height={50} className="object-contain block" />
            </div>
          )}
        </div>
      </div>
    </>
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
  imageAspect,
}: {
  src: string;
  pos: PolaroidPos;
  initial: { x: number; y: number };
  rotate: number;
  visible: boolean;
  settled: boolean;
  delay: number;
  imageAspect: string;
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
      <div className="w-full overflow-hidden bg-[#e8d9c5]" style={{ aspectRatio: imageAspect }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="w-full h-full object-cover block" />
      </div>
    </div>
  );
}
