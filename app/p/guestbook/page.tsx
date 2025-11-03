'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CaseStudyLayout from '@/components/case-study-layout';

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

    const sidebarContent = (
        <div className="space-y-6 text-sm">
            <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Stack</p>
                <p className="text-gray-700 dark:text-gray-300">PostgreSQL, Prisma, Next.js API Routes</p>
            </div>
            <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Features</p>
                <p className="text-gray-700 dark:text-gray-300">Real-time updates, input validation, persistent storage</p>
            </div>
        </div>
    );

    return (
        <CaseStudyLayout
            title="Guestbook"
            subtitle="INTERACTIVE"
            tagline="Leave a message and say hi!"
            sidebarContent={sidebarContent}
        >
            {/* Form */}
            <form onSubmit={handleSubmit} className="mb-12">
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        placeholder="Name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        maxLength={50}
                        required
                        className="flex-shrink-0 w-24 sm:w-32 px-3 py-2 text-sm bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#2A2A2A] rounded text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700 transition-colors"
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
            <div>
                {entries.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-500 py-12">
                        No entries yet. Be the first to sign!
                    </p>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence initial={false}>
                            {entries.map((entry, index) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="text-sm leading-relaxed"
                                >
                                    <span className="text-xs text-gray-400 dark:text-gray-600 font-mono mr-3">
                                        {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{entry.username}</span>
                                    <span className="text-gray-700 dark:text-gray-300">{': '}</span>
                                    <span className="text-gray-700 dark:text-gray-300 break-words">{entry.message}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </CaseStudyLayout>
    );
}
