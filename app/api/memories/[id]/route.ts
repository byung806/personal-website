import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const memory = await prisma.memory.findUnique({
      where: { id: params.id },
      include: {
        photos: { orderBy: { order: 'asc' } },
        _count: { select: { comments: true } },
      },
    });

    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    const { _count, ...rest } = memory;
    return NextResponse.json({
      ...rest,
      commentCount: _count.comments,
      photoCount: memory.photos.length,
    });
  } catch (error) {
    console.error('Error in GET /api/memories/[id]:', error);
    return NextResponse.json({ error: 'Failed to fetch memory' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const memory = await prisma.memory.findUnique({
      where: { id: params.id },
      include: { photos: true },
    });

    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    // Best-effort cleanup of any photos stored in Vercel Blob (ignore external/seed URLs).
    const blobUrls = memory.photos
      .map((photo) => photo.url)
      .filter((url) => url.includes('.public.blob.vercel-storage.com'));
    if (blobUrls.length > 0) {
      try {
        await del(blobUrls);
      } catch (blobError) {
        console.error('Blob cleanup failed (continuing):', blobError);
      }
    }

    // Cascade removes the memory's photos and comments (onDelete: Cascade in the schema).
    await prisma.memory.delete({ where: { id: params.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in DELETE /api/memories/[id]:', error);
    return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 });
  }
}
