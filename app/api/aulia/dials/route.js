import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Dial from '../../../../models/Dial';

function verifyToken(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7);
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [secret] = decoded.split(':');
    return secret === process.env.ADMIN_SECRET;
  } catch {
    return false;
  }
}

export async function GET(req) {
  try {
    const auth = req.headers.get('authorization');
    if (!verifyToken(auth)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Return ALL dials sorted newest first, including sensitive fields
    const dials = await Dial.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Add computed fields
    const enriched = dials.map(d => ({
      ...d,
      _id: d._id.toString(),
      isExpired: d.expiresAt < new Date(),
      daysLeft: Math.max(0, Math.ceil((d.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))),
    }));

    return NextResponse.json({ dials: enriched, total: enriched.length });
  } catch (err) {
    console.error('[GET /api/aulia/dials]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
