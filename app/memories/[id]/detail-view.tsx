'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MoreHorizontal, ArrowUp, Trash2 } from 'lucide-react';
import type { Author, CommentDTO, MemoryDTO } from '../types';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function displayName(author: Author): string {
  return author === 'bryan' ? 'Bryan' : 'Adela';
}

const TILT = [-4, 3, -2, 4, -3, 2];

function Avatar({ author, size = 28 }: { author: Author; size?: number }) {
  const bg = author === 'bryan' ? '#2F4B7C' : '#7C2F5B';
  return (
    <span
      className="flex flex-shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: bg, fontSize: size * 0.42 }}
    >
      {author === 'bryan' ? 'B' : 'A'}
    </span>
  );
}

export default function DetailView({ memoryId }: { memoryId: string }) {
  const router = useRouter();
  const [memory, setMemory] = useState<MemoryDTO | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [author, setAuthor] = useState<Author>('bryan');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadComments = useCallback(async () => {
    const res = await fetch(`/api/memories/${memoryId}/comments`, { cache: 'no-store' });
    if (res.ok) setComments(await res.json());
  }, [memoryId]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/memories/${memoryId}`, { cache: 'no-store' });
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (res.ok) setMemory(await res.json());
    })();
    loadComments();
  }, [memoryId, loadComments]);

  const handleSend = async () => {
    if (!body.trim() || isSending) return;
    setIsSending(true);
    await fetch(`/api/memories/${memoryId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, body: body.trim() }),
    });
    setBody('');
    await loadComments();
    setIsSending(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await fetch(`/api/memories/${memoryId}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/memories');
      router.refresh();
    } else {
      setIsDeleting(false);
      setConfirmDelete(false);
      setMenuOpen(false);
    }
  };

  if (notFound) {
    return (
      <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center gap-4 bg-timeline-bg px-6 text-center">
        <p className="text-[15px] text-timeline-text-secondary">This memory doesn’t exist.</p>
        <Link href="/memories" className="text-[15px] font-semibold text-timeline-accent-blue">
          Back to journal
        </Link>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-timeline-bg">
        <p className="text-[14px] text-timeline-text-secondary">Loading…</p>
      </div>
    );
  }

  const cover = memory.photos[0];

  return (
    <div className="min-h-[100dvh] w-full bg-timeline-bg">
      <div className="mx-auto max-w-[480px] pb-24 lg:max-w-5xl lg:px-6 lg:pb-16">
        {/* Wide banner hero */}
        <div className="relative aspect-[4/3] w-full bg-timeline-surface-2 lg:mt-6 lg:aspect-auto lg:h-[380px] lg:overflow-hidden lg:rounded-3xl">
          {cover && (
            <Image
              src={cover.url}
              alt={memory.title}
              fill
              sizes="(min-width: 1024px) 1024px, 480px"
              priority
              className="object-cover"
            />
          )}
          <div
            className="absolute inset-x-0 top-0 flex items-center justify-between px-4 lg:px-5"
            style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
          >
            <Link
              href="/memories"
              aria-label="Back"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65"
            >
              <ChevronLeft size={20} />
            </Link>
            <div className="relative">
              <button
                type="button"
                aria-label="More options"
                onClick={() => {
                  setMenuOpen((open) => !open);
                  setConfirmDelete(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65"
              >
                <MoreHorizontal size={20} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-11 z-10 w-44 overflow-hidden rounded-xl border border-timeline-bubble bg-timeline-surface shadow-xl">
                  {!confirmDelete ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-[14px] font-medium text-red-400 hover:bg-timeline-surface-2"
                    >
                      <Trash2 size={16} />
                      Delete memory
                    </button>
                  ) : (
                    <div className="px-4 py-3">
                      <p className="text-[13px] text-timeline-text-secondary">Delete this memory?</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="flex-1 rounded-lg bg-red-500 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50"
                        >
                          {isDeleting ? 'Deleting…' : 'Delete'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDelete(false);
                            setMenuOpen(false);
                          }}
                          className="flex-1 rounded-lg bg-timeline-surface-2 py-1.5 text-[13px] font-semibold text-timeline-text-primary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Centered content column under the banner */}
        <div className="lg:mx-auto lg:mt-8 lg:max-w-2xl">
          <div className="px-5 pt-5 lg:px-0 lg:pt-1">
            <h1 className="text-[26px] font-bold leading-tight text-timeline-text-primary lg:text-[32px]">
              {memory.title}
              {memory.emoji ? ` ${memory.emoji}` : ''}
            </h1>
            <p className="mt-2 text-[14px] text-timeline-text-secondary">
              {formatDate(memory.date)}
              {memory.location ? `  •  ${memory.location}` : ''}
            </p>

            {memory.body && (
              <p className="mt-4 whitespace-pre-wrap text-[16px] leading-[1.55] text-timeline-text-primary">
                {memory.body}
              </p>
            )}

            <div className="mt-5 flex items-center gap-2">
              <span className="text-[14px] text-timeline-text-secondary">Created by</span>
              <Avatar author={memory.author} size={24} />
              <span className="text-[14px] font-medium text-timeline-text-primary">
                {displayName(memory.author)}
              </span>
            </div>
          </div>

          {/* Photo gallery — horizontal scroll on mobile, wraps on desktop */}
          {memory.photos.length > 0 && (
            <div className="mt-6 flex gap-3 overflow-x-auto px-5 pb-2 lg:flex-wrap lg:gap-4 lg:overflow-visible lg:px-0">
              {memory.photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="relative h-[190px] w-[150px] flex-shrink-0 overflow-hidden rounded-2xl border border-black/40 shadow-lg lg:h-[220px] lg:w-[170px]"
                  style={{ transform: `rotate(${TILT[index % TILT.length]}deg)` }}
                >
                  <Image src={photo.url} alt="" fill sizes="170px" className="object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Comments — below the pics */}
          <div className="mt-8 flex flex-col gap-3 px-5 lg:px-0">
            {comments.length === 0 && (
              <p className="text-[14px] text-timeline-text-secondary">No comments yet.</p>
            )}
            {comments.map((comment) => {
              const mine = comment.author === 'bryan';
              return (
                <div
                  key={comment.id}
                  className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar author={comment.author} size={28} />
                  <div className="max-w-[75%] rounded-2xl bg-timeline-bubble px-4 py-2.5 text-[15px] text-timeline-text-primary">
                    {comment.body}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Composer — fixed on mobile, inline at the bottom of the column on desktop */}
          <div
            className="fixed inset-x-0 bottom-0 mx-auto max-w-[480px] bg-timeline-bg px-4 pt-2 lg:static lg:mx-0 lg:mt-6 lg:max-w-none lg:px-0"
            style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
          >
            <div className="mb-2 flex gap-2">
              {(['bryan', 'adela'] as Author[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAuthor(a)}
                  className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
                    author === a
                      ? 'bg-timeline-bubble text-timeline-text-primary'
                      : 'bg-timeline-surface text-timeline-text-secondary'
                  }`}
                >
                  {displayName(a)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-full bg-timeline-surface py-1.5 pl-5 pr-1.5">
              <input
                type="text"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                maxLength={500}
                placeholder="Write a comment"
                className="flex-1 bg-transparent text-[15px] text-timeline-text-primary placeholder:text-timeline-text-secondary focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending || !body.trim()}
                aria-label="Send comment"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black disabled:opacity-40"
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
