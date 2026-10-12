// npx prisma studio

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NOTE_COLORS, inkOn, noteColor } from '@/lib/note-colors';
import { Playfair_Display, Space_Mono, DM_Serif_Display, Lora, Courier_Prime, Caveat } from 'next/font/google';

// Not preloaded: only the pastel cards (/p/guestbook) use these, so pages showing the color wall skip them
const playfair  = Playfair_Display({ subsets: ['latin'], preload: false, weight: ['400', '700'], style: ['normal', 'italic'] });
const spaceMono = Space_Mono({ subsets: ['latin'], preload: false, weight: ['400', '700'] });
const dmSerif   = DM_Serif_Display({ subsets: ['latin'], preload: false, weight: '400', style: ['normal', 'italic'] });
const lora      = Lora({ subsets: ['latin'], preload: false, weight: ['400', '600', '700'], style: ['normal', 'italic'] });
const courier   = Courier_Prime({ subsets: ['latin'], preload: false, weight: ['400', '700'], style: ['normal', 'italic'] });
const caveat    = Caveat({ subsets: ['latin'], preload: false, weight: ['400', '700'] });

interface GuestbookEntry {
    id: number;
    username: string;
    message: string;
    color?: string | null;
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
        footerClass: 'flex items-end justify-between gap-2',
        rotate: 1.2,
    },
    {
        bg: '#eef0f7', edge: '#c4cce8',
        msgFont: spaceMono.className,
        msgClass: 'text-[11.5px] leading-[1.85] text-gray-500',
        nameClass: `${spaceMono.className} text-[10px] text-gray-400`,
        footerClass: 'flex items-end justify-between gap-2',
        rotate: -1.8,
    },
    {
        bg: '#f5f0e8', edge: '#d4c8b4',
        msgFont: `${playfair.className}`,
        msgClass: 'text-lg italic leading-snug text-gray-800 text-center',
        nameClass: 'text-[10px] italic text-gray-400 text-center w-full',
        footerClass: 'flex items-end justify-center gap-2',
        rotate: 1.5,
    },
    {
        bg: '#f2f2f2', edge: '#d0d0d0',
        msgFont: '',
        msgClass: 'text-sm leading-relaxed text-gray-700',
        nameClass: 'text-[11px] font-semibold text-gray-500',
        footerClass: 'flex items-end justify-between gap-2',
        rotate: -0.8,
    },
    {
        bg: '#eaf4f0', edge: '#b0d4c8',
        msgFont: dmSerif.className,
        msgClass: 'text-[15px] leading-snug text-gray-900',
        nameClass: 'text-[10px] uppercase tracking-wider text-gray-400',
        footerClass: 'flex items-end justify-between gap-2',
        rotate: -2.2,
    },
    {
        bg: '#faf2d8', edge: '#dfc990',
        msgFont: lora.className,
        msgClass: 'text-sm italic leading-relaxed text-gray-700 text-center',
        nameClass: 'text-[10px] text-gray-400 text-center w-full',
        footerClass: 'flex items-end justify-center gap-2',
        rotate: 2.0,
    },
    {
        bg: '#f0eeeb', edge: '#c8c2ba',
        msgFont: courier.className,
        msgClass: 'text-[12px] leading-[1.75] text-gray-600',
        nameClass: `${courier.className} text-[10px] font-bold text-gray-400 uppercase`,
        footerClass: 'flex items-end justify-between gap-2',
        rotate: -1.4,
    },
    {
        bg: '#f5f0e8', edge: '#ccc0aa',
        msgFont: dmSerif.className,
        msgClass: 'text-2xl leading-[1.2] text-gray-900',
        nameClass: 'text-[10px] text-gray-400 tracking-wide',
        footerClass: 'flex items-end justify-between gap-2',
        rotate: -2.5,
    },
    {
        bg: '#eeeef8', edge: '#bbbce0',
        msgFont: lora.className,
        msgClass: 'text-sm font-bold leading-snug text-gray-900 text-center',
        nameClass: 'text-[10px] text-gray-400 uppercase tracking-widest text-center w-full',
        footerClass: 'flex items-end justify-center gap-2',
        rotate: 1.8,
    },
    {
        bg: '#f5f2eb', edge: '#cec4b4',
        msgFont: playfair.className,
        msgClass: 'text-[13px] leading-relaxed text-gray-700',
        nameClass: `${spaceMono.className} text-[9px] text-gray-400`,
        footerClass: 'flex items-end justify-between gap-2',
        rotate: 0.9,
    },
];

function burstConfetti(cx: number, cy: number) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d')!;
    const colors = ['#dfc990', '#b0d4c8', '#bbbce0', '#d9d0bf', '#c4cce8', '#81cc3e'];
    const particles = Array.from({ length: 14 }, () => ({
        x: cx, y: cy,
        vx: (Math.random() - 0.5) * 7,
        vy: (Math.random() - 1.8) * 5,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        w: Math.random() * 6 + 3,
        h: Math.random() * 4 + 2,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.18,
    }));
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        for (const p of particles) {
            p.x += p.vx; p.y += p.vy; p.vy += 0.18;
            p.alpha -= 0.022; p.rot += p.rotV;
            if (p.alpha > 0) {
                alive = true;
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            }
        }
        if (alive) requestAnimationFrame(draw); else canvas.remove();
    }
    requestAnimationFrame(draw);
}

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

/**
 * A note as a slip of colored paper, sized to its message, in the color its writer picked
 * (that choice is the idea taken from The Unsent Project). Each sits at its own small tilt.
 */
function WallNote({ id, name, message, color, date }: { id: number; name: string; message: string; color: string; date: string }) {
    const tilt = ((id * 37) % 7) - 3; // -3..3 degrees, stable per note
    return (
        <p
            title={date}
            className="inline-block max-w-[300px] px-3 py-2 text-[15px] leading-snug break-words [overflow-wrap:anywhere] shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
            style={{ background: color, color: inkOn(color), transform: `rotate(${tilt * 0.6}deg)` }}
        >
            {message}
            <span className="ml-2 whitespace-nowrap text-[12px] opacity-70">{name}</span>
        </p>
    );
}

/**
 * Guestbook form + masonry wall of notes. `colorWall` swaps the pastel cards for a wall of small
 * slips, each in a color its writer picked: underlined inputs, a color picker with a live preview.
 */
export default function Guestbook({ colorWall = false }: { colorWall?: boolean }) {
    const [entries, setEntries]         = useState<GuestbookEntry[]>([]);
    const [username, setUsername]       = useState('');
    const [message, setMessage]         = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted]      = useState(false);
    const [error, setError]             = useState('');
    const [color, setColor]             = useState(NOTE_COLORS[0]);
    const [isLoaded, setIsLoaded]       = useState(false);
    const [numCols, setNumCols]         = useState(2);
    const formRef                        = useRef<HTMLDivElement>(null);
    const messageRef                     = useRef<HTMLTextAreaElement>(null);

    // The wall's message box starts one line tall (so its underline hugs the placeholder) and grows as you type
    useEffect(() => {
        const box = messageRef.current;
        if (!box) return;
        box.style.height = 'auto';
        box.style.height = `${box.scrollHeight + box.offsetHeight - box.clientHeight}px`;
    }, [message]);

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

    // Start each visitor on a random color (after mount, so server and client render the same)
    useEffect(() => { setColor(NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)]); }, []);

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
                body: JSON.stringify(colorWall ? { username, message, color } : { username, message }),
            });
            if (res.ok) {
                setUsername(''); setMessage(''); fetchEntries();
                setSubmitted(true);
                setTimeout(() => setSubmitted(false), 3000);
                if (formRef.current) {
                    const r = formRef.current.getBoundingClientRect();
                    burstConfetti(r.left + r.width / 2, r.top + r.height / 2);
                }
            }
            else { const d = await res.json(); setError(d.error || 'Failed to submit'); }
        } catch { setError('Failed to submit'); }
        finally { setIsSubmitting(false); }
    };

    if (colorWall) {
        return (
            <div>
                <div ref={formRef} className="max-w-3xl">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <input
                            type="text"
                            placeholder="Your name"
                            aria-label="Your name"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            maxLength={50}
                            required
                            className="sm:w-56 bg-transparent border-b border-black/80 py-1.5 text-[16px] placeholder-black/35 focus:outline-none focus:border-b-2"
                        />
                        <textarea
                            ref={messageRef}
                            placeholder="Leave something small..."
                            aria-label="Message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={500}
                            required
                            rows={1}
                            className="resize-none bg-transparent border-b border-black/80 py-1.5 text-[16px] placeholder-black/35 focus:outline-none focus:border-b-2"
                        />
                        <fieldset>
                            <legend className="text-[14px] text-black/55 mb-2">Pick a color</legend>
                            <div className="flex flex-wrap gap-2">
                                {NOTE_COLORS.map((c) => (
                                    <label key={c} className="relative cursor-pointer">
                                        <input
                                            type="radio"
                                            name="note-color"
                                            value={c}
                                            checked={color === c}
                                            onChange={() => setColor(c)}
                                            className="peer sr-only"
                                        />
                                        <span
                                            aria-hidden
                                            className="block w-8 h-8 border-2 border-white outline outline-1 outline-black/15 transition-transform peer-checked:outline-[3px] peer-checked:outline-black peer-checked:scale-110 peer-focus-visible:outline-[3px] peer-focus-visible:outline-black/60"
                                            style={{ background: c }}
                                        />
                                        <span className="sr-only">{c}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                        <div className="flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || !username.trim() || !message.trim()}
                                className="rounded-[4px] bg-[#ececec] px-3 py-1 text-[15px] text-black transition-colors hover:bg-[#dcdcdc] disabled:opacity-40 disabled:hover:bg-[#ececec] focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
                            >
                                {isSubmitting ? 'Adding…' : 'Add'}
                            </button>
                            {error && <p className="text-[14px] text-red-600">{error}</p>}
                            {submitted && <p className="text-[14px] text-black/50">Added. Thanks for stopping by.</p>}
                        </div>
                    </form>

                    {/* What the note will look like */}
                    <div className="mt-6">
                        <WallNote
                            id={0}
                            name={username.trim() || 'your name'}
                            message={message.trim() || 'Your note shows up here.'}
                            color={color}
                            date="today"
                        />
                    </div>
                </div>

                {isLoaded && entries.length === 0 ? (
                    <p className="mt-16 text-[15px] text-black/45">No notes yet. Leave the first one.</p>
                ) : (
                    <div className="mt-14 md:mt-16 flex flex-wrap items-start gap-x-3 gap-y-4">
                        {entries.map((entry, index) => (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ duration: 0.5, delay: Math.min((index % 12) * 0.04, 0.5), ease: [0.22, 0.61, 0.36, 1] }}
                            >
                                <WallNote
                                    id={entry.id}
                                    name={entry.username}
                                    message={entry.message}
                                    color={noteColor(entry.id, entry.color)}
                                    date={formatDate(entry.createdAt)}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
                {/* Form */}
                <div ref={formRef} className="mb-6 max-w-xl mx-auto bg-white border border-gray-100 rounded-xl px-5 py-4">
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
                    <AnimatePresence>
                        {submitted && (
                            <motion.p
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                transition={{ duration: 0.35 }}
                                className={`${caveat.className} text-center text-base text-green-500 mt-2`}
                            >
                                your note was added :)
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Masonry wall */}
                {isLoaded && entries.length === 0 ? (
                    <p className="text-[13px] text-gray-400 py-20 text-center">No notes yet</p>
                ) : isLoaded ? (
                    <div className="flex gap-3 md:gap-4">
                        {distributeColumns(entries, numCols).map((col, ci) => {
                            const offsets = uOffsets(numCols, numCols <= 2 ? 32 : 72);
                            return (
                            <div key={ci} className="flex-1 min-w-0 flex flex-col gap-3 md:gap-4" style={{ paddingTop: offsets[ci] }}>
                                {col.map((entry) => {
                                    const index = entries.indexOf(entry);
                                    const p = PERSONALITIES[entry.id % PERSONALITIES.length];
                                    return (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ opacity: 0, y: 20, rotate: p.rotate }}
                                            whileInView={{ opacity: 1, y: 0, rotate: p.rotate }}
                                            viewport={{ once: true, margin: '-40px' }}
                                            transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.5), ease: [0.22, 0.61, 0.36, 1] }}
                                            whileHover={{
                                                rotate: [p.rotate, p.rotate + 2, p.rotate - 1.5, p.rotate],
                                                scale: 1.015,
                                                transition: { duration: 0.55, ease: 'easeInOut' },
                                            }}
                                            style={{ originX: 0.5, originY: 0.5 }}
                                        >
                                            <div
                                                className="px-3.5 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4 rounded-lg"
                                                style={{
                                                    backgroundColor: p.bg,
                                                    boxShadow: `0 0 0 0.5px ${p.edge}, 0 1px 3px rgba(0,0,0,0.04)`,
                                                }}
                                            >
                                                <p className={`${p.msgFont} ${p.msgClass} mb-3 break-words [overflow-wrap:anywhere]`}>
                                                    {entry.message}
                                                </p>
                                                <div className={p.footerClass}>
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
    );
}
