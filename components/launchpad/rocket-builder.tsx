'use client';

import { useState } from 'react';
import { Dices } from 'lucide-react';
import { Patrick_Hand } from 'next/font/google';
import { RocketCanvas } from './rocket-field';
import { BODIES, FINS, NOSES, PAINTS, TRIMS, WINDOWS, randomRocket, type RocketDesign } from '@/lib/rocket';

const hand = Patrick_Hand({ subsets: ['latin'], weight: '400' });

type Part = 'nose' | 'body' | 'fins' | 'window';
const TABS: { key: Part | 'color'; label: string; options?: readonly string[] }[] = [
  { key: 'nose', label: 'Nose', options: NOSES },
  { key: 'body', label: 'Body', options: BODIES },
  { key: 'fins', label: 'Fins', options: FINS },
  { key: 'window', label: 'Window', options: WINDOWS },
  { key: 'color', label: 'Color' },
];

function Swatches({ colors, value, onPick, label }: { colors: string[]; value: number; onPick: (i: number) => void; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 shrink-0 text-[15px] text-[#f0dfd2]/60">{label}</span>
      <div className="flex flex-wrap gap-2">
        {colors.map((c, i) => (
          <button
            key={c}
            onClick={() => onPick(i)}
            aria-label={`${label} color ${i + 1}`}
            aria-pressed={value === i}
            className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${value === i ? 'ring-2 ring-[#f0dfd2] ring-offset-2 ring-offset-[#11142b]' : ''}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Builds the rocket on the pad: a tab per part, each showing the whole rocket with that part swapped
 * so you see what you'd get, a color tab, a shuffle, and the name and note that sign the guestbook.
 */
export default function RocketBuilder({
  design,
  onDesign,
  name,
  onName,
  message,
  onMessage,
  error,
  className = '',
}: {
  design: RocketDesign;
  onDesign: (d: RocketDesign) => void;
  name: string;
  onName: (v: string) => void;
  message: string;
  onMessage: (v: string) => void;
  error: string | null;
  className?: string;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('nose');
  const current = TABS.find((t) => t.key === tab)!;

  return (
    <div className={`${hand.className} rounded-3xl border border-[#f0dfd2]/20 bg-[#11142b]/70 p-4 sm:p-5 text-[#f0dfd2] backdrop-blur-sm ${className}`}>
      <div className="flex items-center gap-1">
        <div role="tablist" className="flex flex-1 flex-wrap gap-x-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-2 sm:px-2.5 py-1 text-[16px] sm:text-[18px] leading-none transition-colors ${tab === t.key ? 'bg-[#f0dfd2] text-[#3a1f28]' : 'text-[#f0dfd2]/65 hover:text-[#f0dfd2]'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => onDesign(randomRocket())}
          aria-label="Shuffle the rocket"
          title="Shuffle"
          className="rounded-full p-1.5 text-[#f0dfd2]/70 transition-transform hover:rotate-12 hover:scale-110 hover:text-[#f0dfd2] active:scale-95"
        >
          <Dices className="h-6 w-6" />
        </button>
      </div>

      <div className="mt-3 flex min-h-[84px] items-center">
        {current.options ? (
          <div className="grid w-full grid-cols-4 gap-2">
            {current.options.map((opt, i) => {
              const part = current.key as Part;
              const picked = design[part] === i;
              return (
                <button
                  key={opt}
                  onClick={() => onDesign({ ...design, [part]: i })}
                  aria-label={`${current.label}: ${opt}`}
                  aria-pressed={picked}
                  className={`group flex flex-col items-center rounded-2xl pt-1 transition-colors ${picked ? 'bg-[#f0dfd2]/15 ring-1 ring-[#f0dfd2]/60' : 'hover:bg-[#f0dfd2]/8'}`}
                >
                  <RocketCanvas design={{ ...design, [part]: i }} seed={7} eager flame={false} className="h-[72px] w-[72px] transition-transform group-hover:-translate-y-0.5" />
                  <span className={`pb-1 text-[14px] leading-none ${picked ? 'text-[#f0dfd2]' : 'text-[#f0dfd2]/55'}`}>{opt}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <Swatches label="body" colors={PAINTS} value={design.paint} onPick={(paint) => onDesign({ ...design, paint })} />
            <Swatches label="trim" colors={TRIMS} value={design.trim} onPick={(trim) => onDesign({ ...design, trim })} />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        <input
          value={name}
          onChange={(e) => onName(e.target.value)}
          maxLength={50}
          placeholder="your name"
          aria-label="Your name"
          className="w-full border-b border-[#f0dfd2]/35 bg-transparent px-1 py-1 text-[20px] text-[#f0dfd2] placeholder:text-[#f0dfd2]/40 focus:border-[#f0dfd2] focus:outline-none"
        />
        <input
          value={message}
          onChange={(e) => onMessage(e.target.value)}
          maxLength={500}
          placeholder="leave a note (optional)"
          aria-label="Leave a note"
          className="w-full border-b border-[#f0dfd2]/35 bg-transparent px-1 py-1 text-[18px] text-[#f0dfd2] placeholder:text-[#f0dfd2]/40 focus:border-[#f0dfd2] focus:outline-none"
        />
        {error && <p className="text-[16px] text-[#f2876b]">{error}</p>}
      </div>
    </div>
  );
}
