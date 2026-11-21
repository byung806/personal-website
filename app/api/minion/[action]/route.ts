import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const backend = process.env.MINION_API_URL || 'https://jolly-emptier-reliance.ngrok-free.dev';
const privateHeaders = { 'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff' };

async function proxy(request: NextRequest, { params }: { params: { action: string } }) {
  const action = params.action;
  if (!['login', 'logout', 'messages'].includes(action) || (request.method === 'GET' && action !== 'messages')) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404, headers: privateHeaders });
  }
  if (request.method === 'POST' && !['https://bryan-yung.com', 'https://www.bryan-yung.com',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:3008'] : [])].includes(request.headers.get('origin') || '')) {
    return NextResponse.json({ error: 'Request origin is not allowed.' }, { status: 403, headers: privateHeaders });
  }
  try {
    const body = request.method === 'POST' ? await request.text() : undefined;
    if (body && Buffer.byteLength(body) > 20000) {
      return NextResponse.json({ error: 'Message is too large.' }, { status: 413, headers: privateHeaders });
    }
    const url = new URL(`/dashboard/${action}`, backend);
    if (action === 'messages') url.searchParams.set('after', request.nextUrl.searchParams.get('after') || '0');
    const session = request.cookies.get('minion_session')?.value;
    const response = await fetch(url, {
      method: request.method, body, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(12000),
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true',
        'Origin': request.headers.get('origin') || 'https://bryan-yung.com',
        'X-Minion-IP': request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
        ...(session ? { Cookie: `minion_session=${session}` } : {}) },
    });
    const result = NextResponse.json(await response.json(), { status: response.status, headers: privateHeaders });
    const cookie = response.headers.get('set-cookie');
    if (cookie) result.headers.set('set-cookie', cookie);
    return result;
  } catch {
    return NextResponse.json({ error: 'Minion is unreachable. Your message may still have arrived; retrying is safe.' },
      { status: 502, headers: privateHeaders });
  }
}

export const GET = proxy;
export const POST = proxy;
