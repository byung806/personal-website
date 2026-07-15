import { MessageCircle, Images } from 'lucide-react';
import FadeInImage from './fade-in-image';
import type { PhotoDTO } from '../types';

interface PhotoCardProps {
  title: string;
  emoji: string | null;
  body: string | null;
  photos: PhotoDTO[];
  commentCount: number;
}

export default function PhotoCard({ title, emoji, body, photos, commentCount }: PhotoCardProps) {
  const cover = photos[0];

  return (
    <div className="overflow-hidden rounded-3xl bg-timeline-surface">
      <div className="relative aspect-[4/3] w-full bg-timeline-surface-2">
        {cover && (
          <FadeInImage src={cover.url} alt={title} fill sizes="480px" className="object-cover" />
        )}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-timeline-overlay-badge px-3 py-1.5 text-[13px] font-medium text-white backdrop-blur-sm">
            <MessageCircle size={14} />
            {commentCount}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-timeline-overlay-badge px-3 py-1.5 text-[13px] font-medium text-white backdrop-blur-sm">
            <Images size={14} />
            {photos.length}
          </span>
        </div>
      </div>
      <div className="px-4 py-4">
        <p className="text-[18px] font-semibold text-timeline-text-primary">
          {title}
          {emoji ? ` ${emoji}` : ''}
        </p>
        {body && (
          <p className="mt-1.5 line-clamp-2 text-[15px] leading-[1.4] text-timeline-text-secondary">
            {body}
          </p>
        )}
      </div>
    </div>
  );
}
