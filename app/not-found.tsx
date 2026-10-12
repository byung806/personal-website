import Link from 'next/link';
import NightSky from '@/components/launchpad/night-sky';

/** Lost in space: the night sky from /play, full screen (over the site header), with a way home. */
export default function NotFound() {
  return (
    <div data-not-found className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 text-white">
      <NightSky trail className="absolute inset-0" />
      <h1 className="relative text-8xl md:text-9xl font-bold tracking-tight">404</h1>
      <Link href="/" className="relative text-sm text-white/60 hover:text-white transition-colors">
        Return home
      </Link>
    </div>
  );
}
