'use client';

import { Caveat } from 'next/font/google';
import Guestbook from '@/components/guestbook/guestbook';

const caveat = Caveat({ subsets: ['latin'], weight: ['400', '700'] });

export default function GuestbookPage() {
    return (
        <div className="min-h-screen bg-white pt-12 md:pt-16 pb-32 px-3 md:px-4">
            <p className={`${caveat.className} text-center text-2xl md:text-3xl text-gray-500 mb-12`}>
                Notes left by friends and strangers over time
            </p>
            <Guestbook />
        </div>
    );
}
