import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LAUNCH_KINDS, SHIP_COLORS, SKY_LAUNCHES, pickSpread, type Launch, type LaunchStats } from '@/lib/launches';
import { PAINTS, decodeRocket } from '@/lib/rocket';

export const dynamic = 'force-dynamic';

const FIELDS = { id: true, kind: true, color: true, design: true, createdAt: true } as const;

const toJSON = (l: { id: number; kind: string; color: string; design: string | null; createdAt: Date }) =>
  ({ ...l, createdAt: l.createdAt.toISOString() }) as Launch;

async function stats(): Promise<LaunchStats> {
  const [groups, all] = await Promise.all([
    prisma.launch.groupBy({ by: ['kind'], _count: { _all: true } }),
    prisma.launch.findMany({ orderBy: { createdAt: 'asc' }, select: { id: true } }),
  ]);
  const ids = pickSpread(all.map((l) => l.id), SKY_LAUNCHES);
  const sky = await prisma.launch.findMany({ where: { id: { in: ids } }, orderBy: { createdAt: 'asc' }, select: FIELDS });
  return {
    total: groups.reduce((n, g) => n + g._count._all, 0),
    counts: Object.fromEntries(groups.map((g) => [g.kind, g._count._all])),
    sky: sky.map(toJSON),
  };
}

export async function GET() {
  try {
    return NextResponse.json(await stats());
  } catch (error) {
    console.error('Error in GET /api/launches:', error);
    return NextResponse.json({ error: 'Failed to fetch launches' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { kind, color, design } = await request.json();

    if (!LAUNCH_KINDS.includes(kind)) {
      return NextResponse.json({ error: 'Unknown ship kind!' }, { status: 400 });
    }
    // A built rocket's color is its body paint
    if (!SHIP_COLORS.includes(color) && !PAINTS.includes(color)) {
      return NextResponse.json({ error: 'Unknown ship color!' }, { status: 400 });
    }

    if (design !== undefined && !decodeRocket(design)) {
      return NextResponse.json({ error: "That rocket won't fly!" }, { status: 400 });
    }

    const launch = await prisma.launch.create({ data: { kind, color, design }, select: FIELDS });
    return NextResponse.json(toJSON(launch), { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/launches:', error);
    return NextResponse.json({ error: 'Failed to launch' }, { status: 500 });
  }
}
