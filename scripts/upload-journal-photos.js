// Uploads public/journal-seed/<slug>/*.jpg to Vercel Blob and writes prisma/journal-photos.json
// (a manifest of { slug: [blobUrl, ...] } in cover-first order). Run once after adding photos:
//   node scripts/upload-journal-photos.js
// Requires BLOB_READ_WRITE_TOKEN in the environment (.env.local).
const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');

// Load BLOB_READ_WRITE_TOKEN from .env.local / .env without extra deps.
for (const file of ['.env.local', '.env']) {
  try {
    for (const line of fs.readFileSync(path.join(__dirname, '..', file), 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    /* file may not exist */
  }
}

const SEED_DIR = path.join(__dirname, '..', 'public', 'journal-seed');
const MANIFEST = path.join(__dirname, '..', 'prisma', 'journal-photos.json');

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('Missing BLOB_READ_WRITE_TOKEN (add it to .env.local first).');
    process.exit(1);
  }

  const slugs = fs
    .readdirSync(SEED_DIR)
    .filter((d) => fs.statSync(path.join(SEED_DIR, d)).isDirectory());

  const manifest = {};
  for (const slug of slugs) {
    const files = fs
      .readdirSync(path.join(SEED_DIR, slug))
      .filter((f) => /\.jpg$/i.test(f))
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    manifest[slug] = [];
    for (const file of files) {
      const data = fs.readFileSync(path.join(SEED_DIR, slug, file));
      const blob = await put(`journal/${slug}/${file}`, data, {
        access: 'public',
        contentType: 'image/jpeg',
        addRandomSuffix: true, // unguessable URL
      });
      manifest[slug].push(blob.url);
      console.log(`  ${slug}/${file} -> ${blob.url}`);
    }
    console.log(`${slug}: ${manifest[slug].length} uploaded`);
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\nWrote manifest -> ${MANIFEST}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
