// Seeds the /memories "Our Journal" feature. Contains NO personal content itself:
// the entries come from prisma/journal-data.local.js and photo URLs from
// prisma/journal-photos.json — both gitignored, so nothing personal enters this public repo.
//
// Run:  npm run seed:memories   (wipes the memories tables and re-inserts from the local data)
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SEED_DIR = path.join(__dirname, '..', 'public', 'journal-seed');
const MANIFEST = path.join(__dirname, 'journal-photos.json');

// Personal entries (gitignored). Absent on a fresh checkout / CI → seed is a no-op.
let entries = [];
try {
  entries = require('./journal-data.local.js');
} catch {
  entries = [];
}

// Blob-URL manifest (gitignored), written by scripts/upload-journal-photos.js.
let manifest = {};
try {
  manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
} catch {
  manifest = {};
}

const ph = (text) =>
  `https://placehold.co/900x700/1f1f22/f2f2f2/png?text=${encodeURIComponent(text)}`;

// Photo source priority: (1) Vercel Blob URLs, (2) local files, (3) labeled placeholders.
const photosFor = (entry) => {
  const blobUrls = manifest[entry.slug];
  if (Array.isArray(blobUrls) && blobUrls.length > 0) {
    return { create: blobUrls.map((url, order) => ({ url, order })) };
  }

  let files = [];
  try {
    files = fs.readdirSync(path.join(SEED_DIR, entry.slug)).filter((f) => /\.jpg$/i.test(f));
  } catch {
    files = [];
  }
  files.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  if (files.length > 0) {
    return { create: files.map((f, order) => ({ url: `/journal-seed/${entry.slug}/${f}`, order })) };
  }

  return { create: (entry.labels || []).map((text, order) => ({ url: ph(text), order })) };
};

const commentsFor = (entry) =>
  entry.comments
    ? { create: entry.comments.map(([author, body]) => ({ author, body })) }
    : undefined;

async function main() {
  if (entries.length === 0) {
    console.log('No prisma/journal-data.local.js found — nothing to seed.');
    return;
  }

  await prisma.memory.deleteMany({});

  for (const entry of entries) {
    await prisma.memory.create({
      data: {
        author: entry.author,
        type: entry.type,
        title: entry.title,
        date: new Date(entry.date),
        location: entry.location ?? null,
        body: entry.body,
        photos: photosFor(entry),
        ...(commentsFor(entry) ? { comments: commentsFor(entry) } : {}),
      },
    });
  }

  const count = await prisma.memory.count();
  console.log(`Seeded ${count} memories.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
