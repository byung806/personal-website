'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface GuestbookEntry {
  id: number;
  username: string;
  message: string;
  createdAt: string;
}

export default function GuestbookPage() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/guestbook');
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error('Failed to fetch entries:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, message }),
      });

      if (res.ok) {
        setUsername('');
        setMessage('');
        fetchEntries();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit');
      }
    } catch (err) {
      setError('Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F0F] px-4 sm:px-8 md:px-16 lg:px-32 xl:px-48 py-12">
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Guestbook
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Leave a message and say hi!
          </p>
        </div>

        {/* Form - Horizontal bar */}
        <form onSubmit={handleSubmit} className="mb-8 max-w-[600px]">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={50}
              required
              className="flex-shrink-0 w-32 px-3 py-2 text-sm bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#2A2A2A] rounded text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700 transition-colors"
            />
            <input
              type="text"
              placeholder="Leave a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              required
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#2A2A2A] rounded text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700 transition-colors"
            />
            <button
              type="submit"
              disabled={isSubmitting || !username.trim() || !message.trim()}
              className="flex-shrink-0 px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '...' : 'Sign'}
            </button>
          </div>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
          )}
        </form>

        {/* Entries */}
        <div className="max-w-[600px]">
          {entries.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-500 py-12">
              No entries yet. Be the first to sign!
            </p>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                  >
                    <span className="text-xs text-gray-400 dark:text-gray-600 font-mono mr-3">
                      {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{entry.username}</span>
                    {': '}
                    {entry.message}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
