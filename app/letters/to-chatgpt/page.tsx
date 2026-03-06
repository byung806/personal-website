import { readFileSync } from 'fs';
import { join } from 'path';
import LetterLayout from '@/components/letters/layout';
import { letters } from '@/content/letters';

export default function LetterToChatGPT() {
  const letter = letters.find(l => l.slug === 'to-chatgpt')!;
  const content = readFileSync(join(process.cwd(), 'content/letters/to-chatgpt.mdx'), 'utf8');

  return <LetterLayout letter={letter} content={content} />;
}
