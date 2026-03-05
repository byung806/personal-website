// npx prisma studio

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Playfair_Display, Space_Mono, DM_Serif_Display, Lora, Courier_Prime } from 'next/font/google';

const playfair  = Playfair_Display({ subsets: ['latin'], weight: ['400', '700'], style: ['normal', 'italic'] });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'] });
const dmSerif   = DM_Serif_Display({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'] });
const lora      = Lora({ subsets: ['latin'], weight: ['400', '600', '700'], style: ['normal', 'italic'] });
const courier   = Courier_Prime({ subsets: ['latin'], weight: ['400', '700'], style: ['normal', 'italic'] });

interface GuestbookEntry {
    id: number;
    username: string;
    message: string;
    createdAt: string;
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    });
}

// Each personality = a distinct typographic character
const PERSONALITIES = [
    {
        bg: '#f5f2eb', edge: '#d9d0bf',
        msgFont: playfair.className,
        msgClass: 'text-xl font-bold leading-tight text-gray-900',
        nameClass: 'text-[10px] tracking-widest uppercase text-gray-400',
        rotate: 1.2,
    },
    {
        bg: '#eef0f7', edge: '#c4cce8',
        msgFont: spaceMono.className,
        msgClass: 'text-[11.5px] leading-[1.85] text-gray-500',
        nameClass: `${spaceMono.className} text-[10px] text-gray-400`,
        rotate: -1.8,
    },
    {
        bg: '#f5f0e8', edge: '#d4c8b4',
        msgFont: `${playfair.className}`,
        msgClass: 'text-lg italic leading-snug text-gray-800',
        nameClass: 'text-[10px] italic text-gray-400',
        rotate: 1.5,
    },
    {
        bg: '#f2f2f2', edge: '#d0d0d0',
        msgFont: '',
        msgClass: 'text-sm leading-relaxed text-gray-700',
        nameClass: 'text-[11px] font-semibold text-gray-500',
        rotate: -0.8,
    },
    {
        bg: '#eaf4f0', edge: '#b0d4c8',
        msgFont: dmSerif.className,
        msgClass: 'text-[15px] leading-snug text-gray-900',
        nameClass: 'text-[10px] uppercase tracking-wider text-gray-400',
        rotate: -2.2,
    },
    {
        bg: '#faf2d8', edge: '#dfc990',
        msgFont: lora.className,
        msgClass: 'text-sm italic leading-relaxed text-gray-700 text-center',
        nameClass: 'text-[10px] text-gray-400 text-center w-full',
        rotate: 2.0,
    },
    {
        bg: '#f0eeeb', edge: '#c8c2ba',
        msgFont: courier.className,
        msgClass: 'text-[12px] leading-[1.75] text-gray-600',
        nameClass: `${courier.className} text-[10px] font-bold text-gray-400 uppercase`,
        rotate: -1.4,
    },
    {
        bg: '#f5f0e8', edge: '#ccc0aa',
        msgFont: dmSerif.className,
        msgClass: 'text-2xl leading-[1.2] text-gray-900',
        nameClass: 'text-[10px] text-gray-400 tracking-wide',
        rotate: -2.5,
    },
    {
        bg: '#eeeef8', edge: '#bbbce0',
        msgFont: lora.className,
        msgClass: 'text-sm font-bold leading-snug text-gray-900',
        nameClass: 'text-[10px] text-gray-400 uppercase tracking-widest',
        rotate: 1.8,
    },
    {
        bg: '#f5f2eb', edge: '#cec4b4',
        msgFont: playfair.className,
        msgClass: 'text-[13px] leading-relaxed text-gray-700',
        nameClass: `${spaceMono.className} text-[9px] text-gray-400`,
        rotate: 0.9,
    },
];

// U-shape: outer columns start at top, center column starts lowest
function uOffsets(n: number, maxPx = 72): number[] {
    if (n <= 1) return [0];
    const center = (n - 1) / 2;
    return Array.from({ length: n }, (_, i) => {
        const t = 1 - Math.abs(i - center) / center;
        return Math.round(t * maxPx);
    });
}

function distributeColumns<T>(items: T[], numCols: number): T[][] {
    const cols: T[][] = Array.from({ length: numCols }, () => []);
    items.forEach((item, i) => cols[i % numCols].push(item));
    return cols;
}

export default function GuestbookPage() {
    const [entries, setEntries]         = useState<GuestbookEntry[]>([]);
    const [username, setUsername]       = useState('');
    const [message, setMessage]         = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError]             = useState('');
    const [isLoaded, setIsLoaded]       = useState(false);
    const [numCols, setNumCols]         = useState(2);

    useEffect(() => {
        const update = () => {
            const w = window.innerWidth;
            if (w >= 1024) setNumCols(5);
            else if (w >= 768) setNumCols(4);
            else if (w >= 640) setNumCols(3);
            else setNumCols(2);
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    useEffect(() => { fetchEntries(); }, []);

    const fetchEntries = async () => {
        try {
            const res = await fetch('/api/guestbook');
            if (res.ok) { setEntries(await res.json()); }
        } catch (err) { console.error(err); }
        finally { setIsLoaded(true); }
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
            if (res.ok) { setUsername(''); setMessage(''); fetchEntries(); }
            else { const d = await res.json(); setError(d.error || 'Failed to submit'); }
        } catch { setError('Failed to submit'); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="min-h-screen bg-white pt-12 md:pt-16 pb-32 px-6 md:px-10 lg:px-16">
            <div className="max-w-6xl mx-auto">
                <p className="text-center text-base md:text-lg text-gray-500 tracking-wide mb-12">
                    Notes left by friends and strangers over time
                </p>

                {/* Form */}
                <div className="mb-6 max-w-xl mx-auto border border-gray-100 rounded-xl px-5 py-4">
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-stretch">
                        <input
                            type="text"
                            placeholder="Your name"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            maxLength={50}
                            required
                            className="flex-shrink-0 w-full sm:w-32 px-3.5 py-2 text-[13px] bg-transparent border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
                        />
                        <input
                            type="text"
                            placeholder="Leave something small..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={500}
                            required
                            className="flex-1 px-3.5 py-2 text-[13px] bg-transparent border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || !username.trim() || !message.trim()}
                            className="flex-shrink-0 px-5 py-2 text-[13px] font-medium rounded-md transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed border"
                            style={
                                !isSubmitting && username.trim() && message.trim()
                                    ? { backgroundColor: '#81cc3e', borderColor: '#81cc3e', color: '#fff' }
                                    : { borderColor: '#e5e7eb', color: '#374151' }
                            }
                        >
                            {isSubmitting ? '...' : 'Add'}
                        </button>
                    </form>
                    {error && <p className="text-[11px] text-red-600 mt-2 text-center">{error}</p>}
                </div>

                {/* Masonry wall */}
                {isLoaded && entries.length === 0 ? (
                    <p className="text-[13px] text-gray-400 py-20 text-center">No notes yet</p>
                ) : isLoaded ? (
                    <div className="flex gap-3 md:gap-4">
                        {distributeColumns(entries, numCols).map((col, ci) => {
                            const offsets = uOffsets(numCols, numCols <= 2 ? 32 : 72);
                            return (
                            <div key={ci} className="flex-1 flex flex-col gap-3 md:gap-4" style={{ paddingTop: offsets[ci] }}>
                                {col.map((entry) => {
                                    const index = entries.indexOf(entry);
                                    const p = PERSONALITIES[entry.id % PERSONALITIES.length];
                                    return (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.7), ease: [0.22, 0.61, 0.36, 1] }}
                                        >
                                            <div
                                                className="px-5 pt-5 pb-4 rounded-lg transition-all duration-300 hover:shadow-md"
                                                style={{
                                                    backgroundColor: p.bg,
                                                    boxShadow: `0 0 0 0.5px ${p.edge}, 0 1px 3px rgba(0,0,0,0.04)`,
                                                    transform: `rotate(${p.rotate}deg)`,
                                                }}
                                                onMouseEnter={e => (e.currentTarget.style.transform = `rotate(${p.rotate}deg) translateY(-2px)`)}
                                                onMouseLeave={e => (e.currentTarget.style.transform = `rotate(${p.rotate}deg)`)}
                                            >
                                                <p className={`${p.msgFont} ${p.msgClass} mb-3 break-words`}>
                                                    {entry.message}
                                                </p>
                                                <div className="flex items-end justify-between gap-2">
                                                    <span className={p.nameClass}>— {entry.username}</span>
                                                    <span className="text-[9px] text-gray-300 font-mono tracking-wide shrink-0">
                                                        {formatDate(entry.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                            );
                        })}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
