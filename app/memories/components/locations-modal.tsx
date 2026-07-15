'use client';

import { X, MapPin, ExternalLink } from 'lucide-react';
import type { MemoryDTO } from '../types';

interface LocationsModalProps {
  memories: MemoryDTO[];
  onClose: () => void;
}

export default function LocationsModal({ memories, onClose }: LocationsModalProps) {
  const located = memories.filter((m) => m.location && m.location.trim().length > 0);

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60 lg:items-center" onClick={onClose}>
      <div
        className="max-h-[80vh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl bg-timeline-surface p-5 lg:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-timeline-text-primary">Memory locations</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-timeline-text-secondary">
            <X size={22} />
          </button>
        </div>

        {located.length === 0 ? (
          <p className="mt-6 text-center text-[14px] text-timeline-text-secondary">
            No locations pinned yet — add a location when you create a photo memory.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {located.map((memory) => (
              <a
                key={memory.id}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(memory.location as string)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl bg-timeline-surface-2 px-4 py-3 transition-colors hover:bg-timeline-bubble"
              >
                <MapPin size={18} className="flex-shrink-0 text-timeline-text-secondary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-timeline-text-primary">
                    {memory.title}
                  </p>
                  <p className="truncate text-[13px] text-timeline-text-secondary">{memory.location}</p>
                </div>
                <ExternalLink size={16} className="flex-shrink-0 text-timeline-text-secondary" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
