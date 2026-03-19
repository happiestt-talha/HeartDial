import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { secret } = await req.json();
    const ADMIN_SECRET = process.env.ADMIN_SECRET;

    if (!ADMIN_SECRET) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    if (secret !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    // Create a simple token: base64( secret + timestamp )
    // This is NOT cryptographically secure — it's a lightweight gate for a hidden admin page
    const token = Buffer.from(`${ADMIN_SECRET}:${Date.now()}`).toString('base64');

    return NextResponse.json({ token });
  } catch (err) {
    console.error('[POST /api/aulia/verify]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
