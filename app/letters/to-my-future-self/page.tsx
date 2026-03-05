import { readFileSync } from 'fs';
import { join } from 'path';
import LetterLayout from '@/components/letters/layout';
import { letters } from '@/content/letters';

export default function LetterToFutureSelf() {
  const letter = letters.find(l => l.slug === 'to-my-future-self')!;
  const content = readFileSync(join(process.cwd(), 'content/letters/to-my-future-self.mdx'), 'utf8');

  return <LetterLayout letter={letter} content={content} />;
}
