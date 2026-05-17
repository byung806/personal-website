import { readFileSync } from 'fs';
import { join } from 'path';
import { MDXRemote } from 'next-mdx-remote/rsc';
import FlipCard from './flip-card';

export default function AdelaLetterPage() {
  const content = readFileSync(join(process.cwd(), 'content/letters/to-adela.mdx'), 'utf8');
  return (
    <FlipCard>
      <MDXRemote source={content} />
    </FlipCard>
  );
}
