'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Author, MemoryType } from '../types';

const EMOJI_OPTIONS = ['❤️', '🇫🇷', '✈️', '🎉', '📸', '🏖️', '🎂', '💍', '🌟', '🍕', '🎄', '🐶'];

interface AddMemorySheetProps {
  onClose: () => void;
  onSaved: () => void;
}

const inputClass =
  'mt-1 w-full rounded-xl bg-timeline-surface-2 px-3 py-2 text-[15px] text-timeline-text-primary placeholder:text-timeline-text-secondary focus:outline-none focus:ring-1 focus:ring-timeline-bubble';

export default function AddMemorySheet({ onClose, onSaved }: AddMemorySheetProps) {
  const [author, setAuthor] = useState<Author | null>(null);
  const [type, setType] = useState<MemoryType>('photo');
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('');
  const [body, setBody] = useState('');
  const [location, setLocation] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
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
    if (type === 'photo' && files.length === 0) {
      setError('Add at least one photo.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const uploadedPhotos: { url: string; order: number }[] = [];
      for (let index = 0; index < files.length; index += 1) {
        const formData = new FormData();
        formData.append('file', files[index]);
        const uploadRes = await fetch('/api/memories/upload', { method: 'POST', body: formData });
        if (!uploadRes.ok) throw new Error('Photo upload failed.');
        const { url } = await uploadRes.json();
        uploadedPhotos.push({ url, order: index });
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
          emoji: emoji || null,
          photos: uploadedPhotos,
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
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl bg-timeline-surface p-5"
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
            placeholder={type === 'milestone' ? 'Flight to Paris' : 'Trip to Paris'}
          />
        </label>

        <div className="mt-3 flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setEmoji(option === emoji ? '' : option)}
              className={`rounded-lg px-2 py-1 text-lg ${
                emoji === option ? 'bg-white/15 ring-1 ring-white' : 'bg-timeline-surface-2'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

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

            <div
              className="mt-4 rounded-xl border border-dashed border-timeline-bubble p-4 text-center text-[13px] text-timeline-text-secondary"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addFiles(e.dataTransfer.files);
              }}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                id="memory-photo-input"
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
              <label htmlFor="memory-photo-input" className="cursor-pointer">
                Tap to select photos or drag them here ({files.length} selected)
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
