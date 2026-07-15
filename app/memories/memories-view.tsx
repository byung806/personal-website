'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import TimelineHeader from './components/timeline-header';
import DateBadge from './components/date-badge';
import PhotoCard from './components/photo-card';
import MilestoneRow from './components/milestone-row';
import AddMemorySheet from './components/add-memory-sheet';
import LocationsModal from './components/locations-modal';
import type { MemoryDTO } from './types';

export default function MemoriesView() {
  const [memories, setMemories] = useState<MemoryDTO[] | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/memories', { cache: 'no-store' });
    const data: MemoryDTO[] = await res.json();
    setMemories(data);
  }, []);

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [refresh]);

  return (
    <div className="min-h-[100dvh] w-full bg-timeline-bg">
      <div className="mx-auto max-w-[480px] lg:max-w-5xl lg:px-4">
        <TimelineHeader
          onAddClick={() => setIsSheetOpen(true)}
          onMapClick={() => setIsMapOpen(true)}
        />
        <main className="px-4 pb-16 pt-3">
        {memories === null && (
          <div className="flex flex-col gap-7 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-6 lg:gap-y-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex animate-pulse items-start gap-3">
                <div className="h-[84px] w-[54px] flex-shrink-0 rounded-2xl bg-timeline-surface-2" />
                <div className="min-w-0 flex-1 overflow-hidden rounded-3xl bg-timeline-surface">
                  <div className="aspect-[4/3] w-full bg-timeline-surface-2" />
                  <div className="space-y-2 px-4 py-4">
                    <div className="h-4 w-2/3 rounded bg-timeline-surface-2" />
                    <div className="h-3 w-full rounded bg-timeline-surface-2" />
                    <div className="h-3 w-4/5 rounded bg-timeline-surface-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {memories !== null && memories.length === 0 && (
          <p className="pt-16 text-center text-[14px] text-timeline-text-secondary">
            Nothing here yet — add the first one.
          </p>
        )}
        <div className="flex flex-col gap-7 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-6 lg:gap-y-8">
          {memories?.map((memory) => (
            <div key={memory.id} className="flex items-start gap-3">
              <DateBadge date={memory.date} />
              <div className="min-w-0 flex-1">
                {memory.type === 'photo' ? (
                  <Link
                    href={`/memories/${memory.id}`}
                    className="block transition duration-200 hover:brightness-110 active:brightness-95"
                  >
                    <PhotoCard
                      title={memory.title}
                      emoji={memory.emoji}
                      body={memory.body}
                      photos={memory.photos}
                      commentCount={memory.commentCount}
                    />
                  </Link>
                ) : (
                  <MilestoneRow emoji={memory.emoji} title={memory.title} date={memory.date} />
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      </div>
      {isSheetOpen && (
        <AddMemorySheet
          onClose={() => setIsSheetOpen(false)}
          onSaved={() => {
            setIsSheetOpen(false);
            refresh();
          }}
        />
      )}
      {isMapOpen && (
        <LocationsModal memories={memories ?? []} onClose={() => setIsMapOpen(false)} />
      )}
    </div>
  );
}
