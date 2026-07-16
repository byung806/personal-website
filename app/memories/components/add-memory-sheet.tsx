'use client';

import { useEffect, useState } from 'react';
import { Reorder } from 'framer-motion';
import { X, Plus, Star } from 'lucide-react';
import type { Author, MemoryType } from '../types';

interface AddMemorySheetProps {
  onClose: () => void;
  onSaved: () => void;
}

interface PickedPhoto {
  id: string;
  file: File;
  url: string;
}

const inputClass =
  'mt-1 w-full rounded-xl bg-timeline-surface-2 px-3 py-2 text-[15px] text-timeline-text-primary placeholder:text-timeline-text-secondary focus:outline-none focus:ring-1 focus:ring-timeline-bubble';

export default function AddMemorySheet({ onClose, onSaved }: AddMemorySheetProps) {
  const [author, setAuthor] = useState<Author | null>(null);
  const [type, setType] = useState<MemoryType>('photo');
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Revoke object URLs when the sheet unmounts.
  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) }));
    setPhotos((prev) => [...prev, ...next]);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const makeCover = (id: string) => {
    setPhotos((prev) => {
      const found = prev.find((p) => p.id === id);
      if (!found) return prev;
      return [found, ...prev.filter((p) => p.id !== id)];
    });
  };

  const toggleClass = (active: boolean) =>
    `flex-1 rounded-xl px-3 py-2 text-[14px] font-semibold ${
      active ? 'bg-white text-black' : 'bg-timeline-surface-2 text-timeline-text-secondary'
    }`;

  const handleSave = async () => {
    if (!author) {
      setError('Pick who is posting.');
      return;
    }
    if (!title.trim() || !date) {
      setError('Title and date are required.');
      return;
    }
    if (type === 'photo' && photos.length === 0) {
      setError('Add at least one photo.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const uploaded: { url: string; order: number }[] = [];
      for (let index = 0; index < photos.length; index += 1) {
        const formData = new FormData();
        formData.append('file', photos[index].file);
        const uploadRes = await fetch('/api/memories/upload', { method: 'POST', body: formData });
        if (!uploadRes.ok) throw new Error('Photo upload failed.');
        const { url } = await uploadRes.json();
        uploaded.push({ url, order: index });
      }

      const createRes = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author,
          type,
          title: title.trim(),
          body: type === 'photo' ? body.trim() || null : null,
          location: type === 'photo' ? location.trim() || null : null,
          date,
          emoji: null,
          photos: uploaded,
        }),
      });

      if (!createRes.ok) {
        const { error: message } = await createRes.json();
        throw new Error(message ?? 'Failed to save memory.');
      }

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60 lg:items-center" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl bg-timeline-surface p-5 lg:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-timeline-text-primary">Add to journal</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-timeline-text-secondary">
            <X size={22} />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => setAuthor('bryan')} className={toggleClass(author === 'bryan')}>
            Bryan
          </button>
          <button type="button" onClick={() => setAuthor('adela')} className={toggleClass(author === 'adela')}>
            Adela
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => setType('photo')} className={toggleClass(type === 'photo')}>
            Photo memory
          </button>
          <button type="button" onClick={() => setType('milestone')} className={toggleClass(type === 'milestone')}>
            Milestone
          </button>
        </div>

        <label className="mt-4 block text-[13px] font-medium text-timeline-text-secondary">
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputClass} [color-scheme:dark]`} />
        </label>

        <label className="mt-4 block text-[13px] font-medium text-timeline-text-secondary">
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className={inputClass}
            placeholder={type === 'milestone' ? 'Flight to Paris' : 'First date'}
          />
        </label>

        {type === 'photo' && (
          <>
            <label className="mt-4 block text-[13px] font-medium text-timeline-text-secondary">
              Description
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={1000}
                rows={3}
                className={inputClass}
              />
            </label>

            <label className="mt-4 block text-[13px] font-medium text-timeline-text-secondary">
              Location
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={200}
                className={inputClass}
                placeholder="Phipps, Pittsburgh (optional)"
              />
            </label>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-timeline-text-secondary">Photos</span>
                {photos.length > 0 && (
                  <span className="text-[12px] text-timeline-text-secondary">
                    Drag to reorder · first is the cover
                  </span>
                )}
              </div>

              {photos.length > 0 && (
                <Reorder.Group
                  as="div"
                  axis="x"
                  values={photos}
                  onReorder={setPhotos}
                  className="mt-2 flex gap-2 overflow-x-auto pb-1"
                >
                  {photos.map((photo, index) => (
                    <Reorder.Item
                      as="div"
                      key={photo.id}
                      value={photo}
                      className="relative aspect-[3/4] w-[84px] flex-shrink-0 cursor-grab overflow-hidden rounded-xl active:cursor-grabbing"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.url} alt="" draggable={false} className="h-full w-full object-cover" />
                      {index === 0 ? (
                        <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          <Star size={10} className="fill-white" />
                          Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => makeCover(photo.id)}
                          className="absolute bottom-1 left-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white"
                        >
                          Cover
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label="Remove photo"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => removePhoto(photo.id)}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                      >
                        <X size={12} />
                      </button>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}

              <input
                type="file"
                accept="image/*"
                multiple
                id="memory-photo-input"
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = '';
                }}
              />
              <label
                htmlFor="memory-photo-input"
                className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-timeline-bubble py-3 text-[14px] font-medium text-timeline-text-secondary"
              >
                <Plus size={16} />
                {photos.length > 0 ? 'Add more photos' : 'Add photos'}
              </label>
            </div>
          </>
        )}

        {error && <p className="mt-3 text-[13px] text-red-400">{error}</p>}

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="mt-5 w-full rounded-xl bg-white py-3 text-[15px] font-semibold text-black disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Add to journal'}
        </button>
      </div>
    </div>
  );
}
