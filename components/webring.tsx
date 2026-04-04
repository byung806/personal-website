'use client';

import { useEffect, useState } from 'react';

interface Member {
  name: string;
  url: string;
}

export default function Webring() {
  const [prev, setPrev] = useState<Member | null>(null);
  const [current, setCurrent] = useState<Member | null>(null);
  const [next, setNext] = useState<Member | null>(null);
  const [fallback, setFallback] = useState<Member | null>(null);

  useEffect(() => {
    fetch('https://jaden.mov/webring.json')
      .then(r => r.json())
      .then((members: Member[]) => {
        const origin = window.location.origin;
        const idx = members.findIndex(m => m.url.replace(/\/$/, '') === origin.replace(/\/$/, ''));
        if (idx === -1) {
          setFallback(members[0] ?? null);
          return;
        }
        const n = members.length;
        setPrev(members[(idx - 1 + n) % n]);
        setCurrent(members[idx]);
        setNext(members[(idx + 1) % n]);
      })
      .catch(() => {});
  }, []);

  if (fallback) {
    return (
      <a
        href={fallback.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        visit the ring
      </a>
    );
  }

  if (!prev || !current || !next) return null;

  return (
    <div className="flex items-center gap-2.5 text-xs text-gray-400">
      <a
        href={prev.url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-gray-600 transition-colors"
        title={prev.name}
      >
        ←
      </a>
      <span className="tracking-wide">{current?.name}</span>
      <a
        href={next.url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-gray-600 transition-colors"
        title={next.name}
      >
        →
      </a>
    </div>
  );
}
