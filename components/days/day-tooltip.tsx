'use client';

import { createPortal } from 'react-dom';
import { METERS, scoreColor, type DayEntry } from '@/lib/days';
import { METER_ICONS } from './meter-icons';

type Props = { date: string; entry?: DayEntry; x: number; y: number };

/** Floating card over a hovered day: the date, its meters as tiny bars, and the note. */
export default function DayTooltip({ date, entry, x, y }: Props) {
  const [yr, mo, d] = date.split('-').map(Number);
  const label = new Date(yr, mo - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const rated = METERS.filter((m) => entry?.meters[m.key]);

  return createPortal(
    <div
      className="pointer-events-none fixed z-[60] max-w-[240px] rounded-xl border border-white/10 bg-[#111118]/95 px-3 py-2 text-[11px] text-white/75 shadow-xl backdrop-blur"
      style={{ left: x, top: y, transform: 'translate(-50%, calc(-100% - 10px))' }}
    >
      <div className="flex items-center gap-2 whitespace-nowrap">
        {entry?.score && (
          <span className="h-2 w-2 rounded-full" style={{ background: scoreColor(entry.score), boxShadow: `0 0 6px ${scoreColor(entry.score)}` }} />
        )}
        {label}
      </div>
      {rated.length > 0 && (
        <div className="mt-2 flex items-end gap-2">
          {rated.map((m) => {
            const v = entry!.meters[m.key]!;
            const Icon = METER_ICONS[m.key];
            return (
              <div key={m.key} className="flex flex-col items-center gap-1">
                <div className="relative h-6 w-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="absolute inset-x-0 bottom-0 rounded-full" style={{ height: `${v}%`, background: scoreColor(v) }} />
                </div>
                <Icon size={10} style={{ color: scoreColor(v) }} />
              </div>
            );
          })}
        </div>
      )}
      {entry?.note && <p className="mt-2 leading-snug text-white/60">{entry.note}</p>}
    </div>,
    document.body,
  );
}
