'use client';

import { Patrick_Hand } from 'next/font/google';
import { BODIES, FINS, NOSES, PAINTS, TRIMS, WINDOWS, type RocketDesign } from '@/lib/rocket';

const hand = Patrick_Hand({ subsets: ['latin'], weight: '400' });

/**
 * Where the rocket sits in the tower's 150×230 box (see launchpad.tsx): a 150px square whose left edge
 * is 25px in and whose top is 102px down. The rocket is drawn in 72 units across that square.
 */
const ROCKET = { left: 25, top: 102, unit: 150 / 72 };
/**
 * Where the callouts' column starts and how far apart rows are, in px of the tower box. Keep in sync with the
 * column's classes below (h-7 rows + gap-1.5 = 34px). On phones there's no room beside the rocket, so the
 * column stacks in the sky above it instead, without leader lines.
 */
const COLUMN = { left: 156, top: 74, gap: 34 };

type Part = 'nose' | 'body' | 'fins' | 'window';
type Row =
  | { kind: 'part'; part: Part; options: readonly string[]; noun: string; at: [number, number] }
  | { kind: 'color'; part: 'paint' | 'trim'; colors: string[]; noun: string; at: [number, number] };

/** One row per thing you can change, top to bottom, each pointing at a spot on the rocket (in its 72 units). */
const ROWS: Row[] = [
  { kind: 'part', part: 'nose', options: NOSES, noun: 'nose', at: [38, 11] },
  { kind: 'color', part: 'trim', colors: TRIMS, noun: 'trim', at: [41, 17] },
  { kind: 'part', part: 'window', options: WINDOWS, noun: 'window', at: [41, 30] },
  { kind: 'part', part: 'body', options: BODIES, noun: 'body', at: [46, 38] },
  { kind: 'color', part: 'paint', colors: PAINTS, noun: 'paint', at: [46, 45] },
  { kind: 'part', part: 'fins', options: FINS, noun: 'fins', at: [54, 52] },
];

const rowY = (i: number) => COLUMN.top + i * COLUMN.gap;

function Arrow({ dir, label, onClick }: { dir: -1 | 1; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid h-7 w-7 place-items-center rounded-full text-[22px] leading-none text-[#f0dfd2]/60 transition-[color,transform] hover:scale-125 hover:text-[#f0dfd2] active:scale-95"
    >
      {dir < 0 ? '‹' : '›'}
    </button>
  );
}

/**
 * The rocket on the pad, annotated like a pencil sketch: a callout for each part with a leader line to it,
 * where ‹ › swap that part and dots pick its colors. Lives inside the tower's box, beside the rocket.
 */
export default function RocketCallouts({ design, onDesign, hidden }: { design: RocketDesign; onDesign: (d: RocketDesign) => void; hidden: boolean }) {
  const cycle = (part: Part, n: number, by: number) => onDesign({ ...design, [part]: (design[part] + by + n) % n });

  return (
    <div
      className={`${hand.className} absolute inset-0 transition-opacity duration-500 ${hidden ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      aria-hidden={hidden}
    >
      {/* Leader lines from each callout to its part */}
      <svg aria-hidden className="pointer-events-none absolute left-0 top-0 hidden overflow-visible sm:block" width="1" height="1">
        {ROWS.map((row, i) => {
          const x = ROCKET.left + row.at[0] * ROCKET.unit;
          const y = ROCKET.top + row.at[1] * ROCKET.unit;
          const ey = rowY(i) + 14;
          return (
            <g key={row.part} stroke="#f0dfd2" strokeOpacity={0.6} strokeWidth={1.2} fill="none" strokeLinecap="round">
              <path d={`M ${x} ${y} C ${x + 30} ${y}, ${COLUMN.left - 34} ${ey}, ${COLUMN.left - 6} ${ey}`} strokeDasharray="2 4" />
              <circle cx={x} cy={y} r={2.2} fill="#f0dfd2" fillOpacity={0.9} stroke="none" />
            </g>
          );
        })}
      </svg>

      <div className="absolute flex flex-col gap-1.5 max-sm:left-1/2 max-sm:top-[-200px] max-sm:-translate-x-[62%] sm:left-[156px] sm:top-[74px]">
        {ROWS.map((row) => (
          <div key={row.part} className="pointer-events-auto flex h-7 items-center whitespace-nowrap">
            {row.kind === 'part' ? (
              <>
                <Arrow dir={-1} label={`Previous ${row.noun}`} onClick={() => cycle(row.part, row.options.length, -1)} />
                <span className="min-w-[7.5em] px-0.5 text-center text-[18px] leading-none text-[#f0dfd2]">
                  {row.options[design[row.part]]} {row.noun}
                </span>
                <Arrow dir={1} label={`Next ${row.noun}`} onClick={() => cycle(row.part, row.options.length, 1)} />
              </>
            ) : (
              <>
                <span className="w-12 pl-1 text-[16px] leading-none text-[#f0dfd2]/55">{row.noun}</span>
                <div className="flex gap-1.5">
                  {row.colors.map((c, k) => (
                    <button
                      key={c}
                      onClick={() => onDesign({ ...design, [row.part]: k })}
                      aria-label={`${row.noun} color ${k + 1}`}
                      aria-pressed={design[row.part] === k}
                      className={`h-4 w-4 rounded-full transition-transform hover:scale-125 ${design[row.part] === k ? 'ring-[1.5px] ring-[#f0dfd2] ring-offset-2 ring-offset-[#0a2133]' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
