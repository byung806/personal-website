// npx prisma studio

'use client';

import { useState, useEffect } from 'react';
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
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            const res = await fetch('/api/guestbook');
            if (res.ok) {
                const data = await res.json();
                setEntries(data);
                setIsLoaded(true);
            }
        } catch (err) {
            console.error('Failed to fetch entries:', err);
            setIsLoaded(true);
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
        <div className="min-h-screen bg-white dark:bg-[#0A0A0A] pt-28 pb-32 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header - Quiet invitation */}
                <div className="text-center mb-20">
                    <h1 className="text-[26px] font-medium tracking-tight text-gray-900 dark:text-gray-100 mb-2.5">
                        Guestbook
                    </h1>
                    <p className="text-[13px] text-gray-500 dark:text-gray-500 tracking-wide">
                        Notes left by friends and strangers over time
                    </p>
                </div>

                {/* Signing area - softened, integrated */}
                <div className="mb-20 max-w-xl mx-auto">
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-stretch">
                        <input
                            type="text"
                            placeholder="Your name"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            maxLength={50}
                            required
                            className="flex-shrink-0 w-full sm:w-32 px-3.5 py-2 text-[13px] bg-transparent border border-gray-200/50 dark:border-[#2A2A2A]/50 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-400/70 dark:placeholder-gray-600/70 focus:outline-none focus:border-gray-300/70 dark:focus:border-[#3A3A3A]/70 transition-colors"
                        />
                        <input
                            type="text"
                            placeholder="Leave something small..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={500}
                            required
                            className="flex-1 px-3.5 py-2 text-[13px] bg-transparent border border-gray-200/50 dark:border-[#2A2A2A]/50 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-400/70 dark:placeholder-gray-600/70 focus:outline-none focus:border-gray-300/70 dark:focus:border-[#3A3A3A]/70 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || !username.trim() || !message.trim()}
                            className="flex-shrink-0 px-5 py-2 text-[13px] font-medium tracking-tight text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-[#2A2A2A]/50 rounded-md hover:border-gray-300 dark:hover:border-[#3A3A3A] hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? '...' : 'Add'}
                        </button>
                    </form>
                    {error && (
                        <p className="text-[11px] text-red-600/80 dark:text-red-400/80 mt-2 text-center">{error}</p>
                    )}
                </div>

            {/* Memory Wall */}
            <div>
                {isLoaded && entries.length === 0 ? (
                    <p className="text-[13px] text-gray-400 dark:text-gray-600 py-20 text-center tracking-wide">
                        No notes yet
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-5 auto-rows-min">
                        <AnimatePresence>
                            {isLoaded && entries.map((entry, index) => {
                                // Premium paper tones with subtle variations
                                const paperTones = [
                                    { bg: '#fdfcf8', edge: '#f5f3ed' }, // warm off-white
                                    { bg: '#fefaf0', edge: '#f7f2e3' }, // pale butter
                                    { bg: '#faf8fc', edge: '#f0edf5' }, // soft lavender
                                    { bg: '#f7faf9', edge: '#ecf3f0' }, // desaturated mint
                                    { bg: '#f8f9fc', edge: '#edf0f5' }, // light blue-gray
                                ];
                                
                                const tone = paperTones[index % paperTones.length];
                                
                                // Note size variation: most regular, some wide for anchoring
                                // Avoid stacking wide notes by checking previous entries
                                let sizeClass = 'col-span-1';
                                let heightClass = 'min-h-[140px]';
                                
                                const prevIsWide = index > 0 && (index - 1) % 13 === 0;
                                
                                if (index % 13 === 0 && !prevIsWide) {
                                    // Rare wide note to anchor rows
                                    sizeClass = 'col-span-1 sm:col-span-2';
                                    heightClass = 'min-h-[140px]';
                                } else if (index % 8 === 0) {
                                    // Some slightly shorter
                                    heightClass = 'min-h-[130px]';
                                }
                                
                                // Gentle irregularity: tiny offsets, broken rows
                                const offsetX = ((index * 11) % 7) - 3; // ±3px horizontal
                                const offsetY = ((index * 19) % 13) - 6; // ±6px vertical
                                
                                // Break first row alignment
                                const firstRowVariation = index < 6 ? ((index * 5) % 9) - 4 : 0;
                                
                                return (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                                        animate={{ 
                                            opacity: 1, 
                                            y: 0,
                                            filter: 'blur(0px)',
                                        }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ 
                                            duration: 0.5, 
                                            delay: index * 0.06,
                                            ease: [0.22, 0.61, 0.36, 1]
                                        }}
                                        className={`${sizeClass} group relative`}
                                        style={{
                                            transform: `translate(${offsetX}px, ${offsetY + firstRowVariation}px)`,
                                        }}
                                    >
                                        <div
                                            className={`relative ${heightClass} px-5 pt-4 pb-4 rounded-lg transition-all duration-300 ease-out hover:-translate-y-[2px] hover:scale-[1.002] flex flex-col`}
                                            style={{
                                                backgroundColor: tone.bg,
                                                boxShadow: `
                                                    0 1px 2px rgba(0, 0, 0, 0.03),
                                                    0 0 0 0.5px ${tone.edge},
                                                    inset 0 -1px 0 rgba(0, 0, 0, 0.015)
                                                `,
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.boxShadow = `
                                                    0 3px 9px rgba(0, 0, 0, 0.06),
                                                    0 0 0 0.5px ${tone.edge},
                                                    inset 0 -1px 0 rgba(0, 0, 0, 0.015)
                                                `;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.boxShadow = `
                                                    0 1px 2px rgba(0, 0, 0, 0.03),
                                                    0 0 0 0.5px ${tone.edge},
                                                    inset 0 -1px 0 rgba(0, 0, 0, 0.015)
                                                `;
                                            }}
                                        >
                                            {/* Subtle paper texture */}
                                            <div 
                                                className="absolute inset-0 rounded-lg opacity-[0.02] dark:opacity-[0.035] pointer-events-none"
                                                style={{
                                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
                                                }}
                                            />
                                            
                                            {/* Name - always at top, human anchor */}
                                            <div className="relative mb-3">
                                                <span className="text-[14px] text-gray-900 dark:text-gray-50 font-semibold tracking-wide leading-tight">
                                                    {entry.username}
                                                </span>
                                            </div>
                                            
                                            {/* Message - main body */}
                                            <p className="relative text-[13.5px] leading-[1.65] text-gray-700 dark:text-gray-300 mb-auto break-words flex-1" style={{ textWrap: 'pretty' }}>
                                                {entry.message}
                                            </p>
                                            
                                            {/* Date - faint, secondary */}
                                            <div className="relative mt-3">
                                                <span className="text-[10px] text-gray-400 dark:text-gray-600 font-mono tracking-wide opacity-50">
                                                    {new Date(entry.createdAt).toLocaleDateString('en-US', { 
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        year: new Date(entry.createdAt).getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    </div>
    );
}
