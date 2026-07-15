'use client';

import { Map, Plus } from 'lucide-react';

interface TimelineHeaderProps {
  onAddClick: () => void;
  onMapClick: () => void;
}

export default function TimelineHeader({ onAddClick, onMapClick }: TimelineHeaderProps) {
  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between bg-timeline-bg px-4 pb-3"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      <button
        type="button"
        aria-label="Memory locations"
        onClick={onMapClick}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-timeline-surface-2 text-timeline-text-primary transition-colors hover:bg-timeline-bubble"
      >
        <Map size={18} />
      </button>
      <h1 className="text-[20px] font-bold text-timeline-text-primary">Our Journal</h1>
      <button
        type="button"
        aria-label="Add memory"
        onClick={onAddClick}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-timeline-surface-2 text-timeline-text-primary transition-colors hover:bg-timeline-bubble"
      >
        <Plus size={20} />
      </button>
    </header>
  );
}
