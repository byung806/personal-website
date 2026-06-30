import { readFileSync } from 'fs';
import { join } from 'path';
import { MDXRemote } from 'next-mdx-remote/rsc';
import DadFlipCard from './flip-card';
import { Purple, Red, Blue } from '@/components/letters/colored-section';

const components = { Purple, Red, Blue };

export default function DadLetterPage() {
  const content = readFileSync(join(process.cwd(), 'content/letters/to-dad.mdx'), 'utf8');
  return (
    <DadFlipCard>
      <MDXRemote source={content} components={components} />
    </DadFlipCard>
  );
}
