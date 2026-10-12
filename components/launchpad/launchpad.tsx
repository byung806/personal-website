'use client';

import { useCallback, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { SHIP_COLORS, ShipCanvas } from './ships';
import PaintedCanvas from './painted-canvas';
import NightSky from './night-sky';
import { Patrick_Hand } from 'next/font/google';
import { paintLaunchSite, paintPencilButton, paintSmokePuff, paintTower } from './paint';

const hand = Patrick_Hand({ subsets: ['latin'], weight: '400' });

type Phase = 'ready' | 'liftoff' | 'gone';

type Puff = { id: number; x: number; y: number; size: number; dx: number; rise: number; duration: number; delay: number };

/** One launch, randomized so no two look alike. Times in seconds, distances in px. */
type Flight = { id: number; ignite: number; climb: number; drift: number; lean: number; puffs: Puff[] };

const ALTITUDE = 1500;
/** How much further the ground travels than the sky while the section scrolls into view, in px. */
const PARALLAX = 140;
/** How far the sky lags behind the page over the same scroll, in px (so the dusk above slides over it). */
const SKY_LAG = 150;

/** Px of extra ground under the scene (more on phones).
 *  Keep in sync with the section height and scene `bottom` classes below. */
const groundBelow = (w: number) => (w < 640 ? 150 : 80);
const paintSite = (ctx: CanvasRenderingContext2D, w: number, h: number) => paintLaunchSite(ctx, w, h, groundBelow(w));

function planFlight(id: number): Flight {
  const ignite = 0.45 + Math.random() * 0.55; // rumble on the pad before it lifts
  const climb = 2 + Math.random() * 1.1;
  const drift = (Math.random() - 0.5) * 300;
  const puffs: Puff[] = [];
  // Exhaust from the flame trench: a few puffs as the engine lights, then a heavy billow
  // rolling out along the ground on both sides while it lifts off
  const billow = 16 + Math.floor(Math.random() * 6);
  for (let i = 0; i < billow; i++) {
    const side = i % 2 ? 1 : -1;
    const k = i / billow; // later puffs are bigger and roll further out
    puffs.push({
      id: i,
      x: side * Math.random() * 25,
      y: Math.random() * 14,
      size: 50 + k * 60 + Math.random() * 50,
      dx: side * (50 + k * 160 + Math.random() * 90),
      rise: 10 + Math.random() * 45 + k * 30,
      duration: 3 + Math.random() * 1.8,
      delay: 0.05 + k * (ignite + 1.1) + Math.random() * 0.15,
    });
  }
  // A column left behind as it climbs, puffed out when the rocket passes each height
  const trail = 16 + Math.floor(Math.random() * 5);
  for (let i = 0; i < trail; i++) {
    const h = 25 + (i / trail) * 420 + Math.random() * 15;
    const t = Math.sqrt(h / ALTITUDE); // rough time fraction to reach h while accelerating
    puffs.push({
      id: 100 + i,
      x: drift * Math.pow(h / ALTITUDE, 2.2) + (Math.random() - 0.5) * 12,
      y: h,
      size: 55 + Math.random() * 50 + (h / 420) * 30, // widens as it rises
      dx: (Math.random() - 0.5) * 70,
      rise: 20 + Math.random() * 50,
      duration: 2.4 + Math.random() * 1.2,
      delay: ignite + t * climb,
    });
  }
  return { id, ignite, climb, drift, lean: drift / 30, puffs };
}

/** A smoke puff that rises, swells and blurs as it fades in and out, like tinycamp's campfire smoke. */
function SmokePuff({ puff, seed }: { puff: Puff; seed: number }) {
  const paint = useCallback((ctx: CanvasRenderingContext2D, w: number) => paintSmokePuff(ctx, w, seed), [seed]);
  return (
    <motion.div
      aria-hidden
      className="absolute pointer-events-none"
      style={{ left: 100 + puff.x - puff.size / 2, bottom: 2 + puff.y - puff.size / 3, width: puff.size, height: puff.size }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 0.5, 0.95, 0.5, 0],
        scale: [0.45, 0.75, 1, 1.15, 1.3],
        x: [0, puff.dx * 0.35, puff.dx * 0.65, puff.dx * 0.85, puff.dx],
        y: [0, -puff.rise * 0.25, -puff.rise * 0.5, -puff.rise * 0.75, -puff.rise],
        filter: ['blur(0px)', 'blur(2px)', 'blur(4px)', 'blur(5px)', 'blur(7px)'],
      }}
      transition={{ duration: puff.duration, delay: puff.delay, ease: 'linear' }}
    >
      <PaintedCanvas paint={paint} grain={8} className="w-full h-full" />
    </motion.div>
  );
}

/**
 * Pencil-drawn night meadow with a launch tower under a living night sky, after tinycamp.site.
 * "Launch a rocket" lifts it off the pad;
 * `onLaunch` fires once it's out of sight (with its color) and a fresh rocket rolls out after.
 */
export default function Launchpad({ id, onLaunch }: { id?: string; onLaunch: (color: string) => void }) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [flight, setFlight] = useState<Flight | null>(null);
  const [colorIndex, setColorIndex] = useState(0);
  const color = SHIP_COLORS[colorIndex % SHIP_COLORS.length];

  // Parallax: the ground starts a little low and rises into place as you scroll down, so it moves faster
  // than the sky behind it. It lands exactly at the bottom of the page.
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end end'] });
  const reduce = useReducedMotion();
  const groundY = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : PARALLAX, 0]);
  // The sky hangs back the other way. It's taller than the section by SKY_LAG, and whatever it uncovers
  // at the bottom is behind the ground.
  const skyY = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : -SKY_LAG, 0]);

  const launch = () => {
    if (phase !== 'ready') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const plan = planFlight(Date.now());
    setFlight(reduce ? null : plan);
    setPhase('liftoff');
    setTimeout(() => {
      onLaunch(color);
      setPhase('gone');
      setTimeout(() => {
        setColorIndex((i) => i + 1);
        setPhase('ready');
      }, 1800);
    }, reduce ? 0 : (plan.ignite + plan.climb) * 1000);
  };

  return (
    <section
      ref={sectionRef}
      id={id}
      className="relative overflow-hidden h-[max(calc(70vh_+_400px),920px)] sm:h-[max(calc(70vh_+_420px),940px)]"
    >
      <motion.div className="absolute inset-x-0 bottom-0" style={{ top: -SKY_LAG, y: skyY }}>
        <NightSky galaxy="arch" className="absolute inset-0" />
      </motion.div>
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: groundY }}>
        <PaintedCanvas paint={paintSite} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* The scene itself, laid out above the extra ground */}
        <div className="absolute inset-x-0 top-0 bottom-[150px] sm:bottom-[80px]">

          {/* Launch tower, pad and rocket */}
          <div className="absolute bottom-[24%] left-[68%] -translate-x-1/2 md:left-[60%] w-[150px] h-[230px]">
            <PaintedCanvas paint={paintTower} grain={10} className="absolute inset-0 w-full h-full pointer-events-none" />

            {/* Rocket: rumbles on the pad, then climbs on its own randomized arc. Clipped at the deck so the
                flame burns down into the trench (out of sight) until the rocket clears the pad. */}
            <div className="absolute inset-0 pointer-events-none" style={{ clipPath: 'inset(-3000px -1000px 15px -1000px)' }}>
              <motion.div
                key={flight && phase === 'liftoff' ? flight.id : 'pad'}
                className="absolute left-[25px] bottom-[-22px] w-[150px] h-[150px]"
                initial={false}
                animate={
                  flight && phase === 'liftoff'
                    ? { y: [0, 0, -ALTITUDE], x: [0, 0, flight.drift], rotate: [0, 0, flight.lean], opacity: 1 }
                    : phase === 'gone'
                      ? { y: 0, x: 0, rotate: 0, opacity: 0 }
                      : { y: 0, x: 0, rotate: 0, opacity: 1 }
                }
                transition={
                  flight && phase === 'liftoff'
                    ? (() => {
                        const total = flight.ignite + flight.climb;
                        const times = [0, flight.ignite / total, 1];
                        return {
                          y: { duration: total, times, ease: ['linear', [0.45, 0, 0.85, 0.4]] },
                          // Sideways drift builds late, so the path bends instead of running straight
                          x: { duration: total, times, ease: ['linear', [0.7, 0, 1, 0.5]] },
                          rotate: { duration: total, times, ease: ['linear', [0.6, 0, 0.9, 0.6]] },
                        };
                      })()
                    : { duration: 0.8 }
                }
              >
                {phase === 'liftoff' && (
                  <span aria-hidden className="absolute left-1/2 -translate-x-1/2 bottom-3 w-10 h-12 rounded-full bg-[#f0846a] blur-xl opacity-70" />
                )}
                <motion.div
                  className="relative w-full h-full"
                  animate={flight && phase === 'liftoff' ? { x: [0, -1.4, 1.2, -1, 1.4, -0.8, 0.6, 0] } : { x: 0 }}
                  transition={{ duration: flight ? flight.ignite : 0, ease: 'linear' }}
                >
                  <ShipCanvas kind="rocket" color={color} seed={7 + colorIndex} flame={phase === 'liftoff'} className="w-full h-full" />
                </motion.div>
              </motion.div>
            </div>

            {/* Smoke (stays mounted after the flight so late puffs finish fading; done puffs are invisible) */}
            {flight && flight.puffs.map((p) => <SmokePuff key={`${flight.id}-${p.id}`} puff={p} seed={flight.id + p.id} />)}
          </div>

          {/* Centered under the pad (same spot as the tower box) */}
          <div className="absolute bottom-[15%] left-[68%] md:left-[60%] -translate-x-1/2 whitespace-nowrap">
            <button
              onClick={launch}
              disabled={phase !== 'ready'}
              className={`${hand.className} pointer-events-auto group relative px-7 py-2.5 text-[21px] leading-none text-[#3a1f28] transition-[transform,opacity] duration-200 -rotate-1 hover:rotate-1 hover:scale-[1.04] active:scale-[0.97] disabled:opacity-50 disabled:hover:-rotate-1 disabled:hover:scale-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0dfd2]`}
            >
              <span aria-hidden className="absolute inset-0 drop-shadow-[0_0_14px_rgba(240,132,106,0.35)]">
                <PaintedCanvas paint={paintPencilButton} grain={12} className="w-full h-full" />
              </span>
              <span className="relative">
                {phase === 'ready' ? 'Launch a rocket' : phase === 'liftoff' ? 'Liftoff' : 'Rolling out the next one'}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
