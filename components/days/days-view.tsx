'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PenLine } from 'lucide-react';
import { METERS, dayScore, dayKey, scoreColor, type DayEntry, type MeterKey, type Meters } from '@/lib/days';
import TodayBox from './today-box';
import Meter from './meter';
import DayTooltip from './day-tooltip';

const KEY_STORAGE = 'days-key';
const BG = '#07070b';

/**
 * A daily self-evaluation log: a GitHub-style grid of past days (hover one for its meters and note),
 * ending in one big box for today that fills with the average of today's meters.
 * Pass ?key=<DAYS_KEY> once; it is remembered in localStorage.
 */
export default function DaysView() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [key, setKey] = useState<string | null>(null);
  const [days, setDays] = useState<Record<string, DayEntry>>({});
  const [draft, setDraft] = useState<{ key: MeterKey; value: number } | null>(null);
  const [pulse, setPulse] = useState(0);
  const [tip, setTip] = useState<{ date: string; x: number; y: number } | null>(null);
  const [note, setNote] = useState('');

  const today = new Date();
  const todayKey = dayKey(today);
  const todayEntry = days[todayKey];

  useEffect(() => {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get('key');
    if (fromUrl) {
      try { localStorage.setItem(KEY_STORAGE, fromUrl); } catch {}
      url.searchParams.delete('key');
      window.history.replaceState(null, '', url.pathname + url.search);
    }
    let k = fromUrl;
    if (!k) try { k = localStorage.getItem(KEY_STORAGE); } catch {}
    if (!k) return;
    fetch('/api/days', { headers: { 'x-days-key': k } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((entries: DayEntry[]) => {
        setKey(k);
        setDays(Object.fromEntries(entries.map((d) => [d.date, d])));
        setNote(entries.find((d) => d.date === todayKey)?.note ?? '');
      })
      .catch(() => {});
  }, [todayKey]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const save = (patch: { meters?: Meters; note?: string }) => {
    if (!key) return;
    const prev = days[todayKey];
    const base: DayEntry = prev ?? { date: todayKey, score: null, meters: {}, note: null };
    const meters = { ...base.meters, ...patch.meters };
    const optimistic: DayEntry = {
      ...base,
      meters,
      score: dayScore(meters) ?? base.score,
      note: patch.note === undefined ? base.note : patch.note.trim() || null,
    };
    setDays((d) => ({ ...d, [todayKey]: optimistic }));
    fetch('/api/days', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-days-key': key },
      body: JSON.stringify({ date: todayKey, ...patch }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((saved: DayEntry) => setDays((d) => ({ ...d, [todayKey]: saved })))
      .catch(() => setDays((d) => {
        const next = { ...d };
        if (prev) next[todayKey] = prev;
        else delete next[todayKey];
        return next;
      }));
  };

  const commitMeter = (meter: MeterKey, value: number) => {
    setDraft(null);
    save({ meters: { [meter]: value } });
    setPulse(Date.now());
  };

  // While a meter is being dragged, today's box follows the would-be average live
  const liveMeters: Meters = { ...todayEntry?.meters, ...(draft ? { [draft.key]: draft.value } : {}) };
  const value = dayScore(liveMeters) ?? todayEntry?.score ?? null;

  const small = width < 640;
  // Today and its meters are the centerpiece: a big box and fat pills that are easy to grab
  const todaySize = small ? 150 : 220;
  const pillWidth = small ? 40 : 46;
  const pillGap = small ? 14 : 16;
  // The history grid sits underneath as a smaller strip
  const cell = small ? 9 : 12;
  const gap = 3;
  const weeks = Math.max(4, Math.min(53, Math.floor((Math.min(width, 900) + gap) / (cell + gap))));

  // Columns are weeks (Sunday on top); the last column is this week, ending with today
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() - 7 * (weeks - 1));
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const columns = Array.from({ length: weeks }, (_, c) =>
    Array.from({ length: 7 }, (_, r) => {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + c * 7 + r);
      return d <= midnight ? dayKey(d) : null;
    }),
  );

  // Month names sit over the first week of each month, GitHub-style; a label crowded by the next is dropped
  const months = columns
    .map((_, c) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + c * 7))
    .map((d, c, all) => (c === 0 || d.getMonth() !== all[c - 1].getMonth() ? { c, d } : null))
    .filter((m): m is { c: number; d: Date } => m !== null)
    .filter((m, i, all) => !all[i + 1] || all[i + 1].c - m.c >= 3);

  const showTip = (date: string, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const x = Math.min(window.innerWidth - 130, Math.max(130, r.left + r.width / 2));
    setTip({ date, x, y: r.top });
  };

  const meters = METERS.map((m) => (
    <Meter
      key={m.key}
      meter={m}
      width={pillWidth}
      height={small ? 150 : todaySize - 26}
      value={draft?.key === m.key ? draft.value : todayEntry?.meters[m.key] ?? null}
      editable={!!key}
      onDraft={(v) => setDraft({ key: m.key, value: v })}
      onCommit={(v) => commitMeter(m.key, v)}
    />
  ));

  const noteInput = key && (
    <label
      className="flex w-full max-w-sm items-center gap-2 rounded-xl border bg-white/[0.04] px-3 py-2 transition-colors focus-within:bg-white/[0.07]"
      style={{ borderColor: value ? scoreColor(value, 0.4) : 'rgba(255, 255, 255, 0.14)' }}
    >
      <PenLine size={13} className="shrink-0 text-white/45" />
      <input
        value={note}
        maxLength={280}
        placeholder="One line about today"
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => note.trim() !== (todayEntry?.note ?? '') && save({ note })}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        className="w-full bg-transparent text-sm text-white/85 outline-none placeholder:text-white/30"
      />
    </label>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 transition-[background] duration-700"
      style={{
        backgroundColor: BG,
        backgroundImage: value
          ? `radial-gradient(ellipse at 50% 40%, ${scoreColor(value, 0.06 + value / 900)}, transparent 60%)`
          : undefined,
      }}
      onClick={() => setTip(null)}
    >
      <div ref={wrapRef} className="w-full max-w-[1100px] flex flex-col items-center gap-12">
        {width > 0 && (
          <>
            <div className="flex flex-col items-center gap-8">
              <div className={`flex items-end ${small ? 'flex-col items-center gap-8' : 'gap-12'}`}>
                <TodayBox size={todaySize} date={today} value={value} editable={!!key} pulse={pulse} />
                <div className="flex" style={{ gap: pillGap }}>{meters}</div>
              </div>
              {noteInput}
            </div>
            <div className="flex flex-col" style={{ gap: gap * 2 }}>
              <div className="relative h-3 text-[10px] leading-3 text-white/30 select-none">
                {months.map(({ c, d }) => (
                  <span key={c} className="absolute" style={{ left: c * (cell + gap) }}>
                    {d.toLocaleString('en-US', { month: 'short' })}
                  </span>
                ))}
              </div>
              <div className="flex" style={{ gap }}>
                {columns.map((col, c) => (
                  <div key={c} className="flex flex-col" style={{ gap }}>
                    {col.map((date, r) => {
                      if (!date) return <div key={r} style={{ width: cell, height: cell }} />;
                      // Today's dot follows the meters live and wears a ring, tying the grid to the box above
                      const isToday = date === todayKey;
                      const score = isToday ? value : days[date]?.score;
                      return (
                        <motion.div
                          key={date}
                          initial={{ opacity: 0, scale: 0.4 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: (weeks - c) * 0.014 + r * 0.01, duration: 0.4, ease: 'easeOut' }}
                          whileHover={{ scale: 1.35 }}
                          onPointerEnter={(e) => showTip(date, e.currentTarget)}
                          onPointerLeave={() => setTip(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            showTip(date, e.currentTarget);
                          }}
                          style={{
                            width: cell,
                            height: cell,
                            borderRadius: cell * 0.3,
                            background: score ? scoreColor(score) : 'rgba(255, 255, 255, 0.05)',
                            boxShadow: [
                              score ? `0 0 ${score / 12}px ${scoreColor(score, 0.45)}` : '',
                              isToday ? `0 0 0 1.5px ${BG}, 0 0 0 2.5px rgba(255, 255, 255, 0.7)` : '',
                            ].filter(Boolean).join(', ') || undefined,
                          }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      {tip && <DayTooltip date={tip.date} entry={days[tip.date]} x={tip.x} y={tip.y} />}
    </div>
  );
}
