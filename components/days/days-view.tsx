'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { dayKey, scoreColor } from '@/lib/days';
import TodayBox from './today-box';

const KEY_STORAGE = 'days-key';
const BG = '#07070b';

/**
 * A wordless daily self-evaluation log: a GitHub-style grid of past days, ending in one big box for
 * today that you fill by dragging up. Pass ?key=<DAYS_KEY> once; it is remembered in localStorage.
 */
export default function DaysView() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [key, setKey] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [draft, setDraft] = useState<number | null>(null);

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
      .then((days: { date: string; score: number }[]) => {
        setKey(k);
        setScores(Object.fromEntries(days.map((d) => [d.date, d.score])));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const today = new Date();
  const todayKey = dayKey(today);
  const value = draft ?? scores[todayKey] ?? null;

  const commit = (score: number) => {
    setDraft(null);
    if (!key) return;
    const prev = scores[todayKey];
    setScores((s) => ({ ...s, [todayKey]: score }));
    fetch('/api/days', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-days-key': key },
      body: JSON.stringify({ date: todayKey, score }),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }).catch(() => {
      setScores((s) => {
        const next = { ...s };
        if (prev === undefined) delete next[todayKey];
        else next[todayKey] = prev;
        return next;
      });
    });
  };

  const small = width < 640;
  const cell = small ? 11 : 14;
  const gap = small ? 3 : 4;
  const todaySize = 7 * cell + 6 * gap;
  const split = gap * 4;
  const weeks = Math.max(4, Math.min(53, Math.floor((width - todaySize - split + gap) / (cell + gap))));

  // Columns are weeks (Sunday on top); the last column is this week, up to yesterday
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() - 7 * (weeks - 1));
  const columns = Array.from({ length: weeks }, (_, c) =>
    Array.from({ length: 7 }, (_, r) => {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + c * 7 + r);
      return d < new Date(today.getFullYear(), today.getMonth(), today.getDate()) ? dayKey(d) : null;
    }),
  );

  // Month names sit over the first week of each month, GitHub-style; a label crowded by the next is dropped
  const months = columns
    .map((_, c) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + c * 7))
    .map((d, c, all) => (c === 0 || d.getMonth() !== all[c - 1].getMonth() ? { c, d } : null))
    .filter((m): m is { c: number; d: Date } => m !== null)
    .filter((m, i, all) => !all[i + 1] || all[i + 1].c - m.c >= 3);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 transition-[background] duration-700"
      style={{
        backgroundColor: BG,
        backgroundImage: value
          ? `radial-gradient(ellipse at 80% 60%, ${scoreColor(value, 0.06 + value / 900)}, transparent 60%)`
          : undefined,
      }}
    >
      <div ref={wrapRef} className="w-full max-w-[1000px] flex justify-center">
        {width > 0 && (
          <div className="flex items-end" style={{ gap: split }}>
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
                    {col.map((date, r) =>
                      date ? (
                        <motion.div
                          key={date}
                          initial={{ opacity: 0, scale: 0.4 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: (weeks - c) * 0.014 + r * 0.01, duration: 0.4, ease: 'easeOut' }}
                          whileHover={{ scale: 1.35 }}
                          style={{
                            width: cell,
                            height: cell,
                            borderRadius: cell * 0.3,
                            background: scores[date] ? scoreColor(scores[date]) : 'rgba(255, 255, 255, 0.05)',
                            boxShadow: scores[date] ? `0 0 ${scores[date] / 12}px ${scoreColor(scores[date], 0.45)}` : undefined,
                          }}
                        />
                      ) : (
                        <div key={r} style={{ width: cell, height: cell }} />
                      ),
                    )}
                  </div>
                ))}
              </div>
            </div>
            <TodayBox size={todaySize} day={today.getDate()} value={value} editable={!!key} onDraft={setDraft} onCommit={commit} />
          </div>
        )}
      </div>
    </div>
  );
}
