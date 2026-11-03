import NightSky from '@/components/launchpad/night-sky';
import LettersSection from '@/components/letters/letters-section';
import MoonSurface from '@/components/letters/moon-surface';

/** The letters, laid out on a giant pencil moon under the night sky. Its planet on /play links here. */
export default function LettersPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0c0921]">
      <NightSky className="absolute inset-x-0 top-0 h-[100svh]" />
      <MoonSurface className="absolute inset-x-0 top-[200px] md:top-[230px] bottom-0" />
      <div className="relative">
        <LettersSection titleColor="#f0dfd2" />
      </div>
    </main>
  );
}
