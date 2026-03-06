import Link from 'next/link';
import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Highlight from './highlight';
import type { Letter } from '@/content/letters';

const components = { Highlight };

export default function LetterLayout({
  letter,
  content,
}: {
  letter: Letter;
  content: string;
}) {
  return (
    <main className="w-full min-h-screen bg-white">
      <div className="mx-auto max-w-[640px] px-6 sm:px-8 py-16 md:py-24">

        <div className="mb-10 flex items-stretch gap-2">
          <div className="relative flex-1 overflow-hidden rounded-lg" style={{ aspectRatio: '3/2' }}>
            <Image src={letter.photo} alt={letter.to} fill className="object-cover" sizes="640px" />
          </div>
          {letter.photoCredit && (
            <div className="flex items-center justify-center">
              <p className="font-serif italic text-gray-400 text-xs whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{letter.photoCredit}</p>
            </div>
          )}
        </div>

        <div className="mb-12">
          <p className="font-serif italic text-gray-400 text-sm mb-10">{letter.date}</p>
          <h1 className="font-serif font-bold text-gray-900 text-4xl md:text-5xl leading-tight tracking-tight">
            <span className="italic font-normal text-gray-400">To </span>{letter.to}
          </h1>
        </div>

        <div className="font-serif text-gray-700 text-lg leading-[1.85] [&>p]:mb-6">
          <MDXRemote source={content} components={components} />
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100">
          <Link
            href="/letters"
            className="font-serif italic text-sm transition-opacity hover:opacity-70"
            style={{ color: '#81cc3e' }}
          >
            ← All Letters
          </Link>
        </div>
      </div>
    </main>
  );
}
