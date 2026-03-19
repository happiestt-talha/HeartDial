import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Dial from '../../../../models/Dial';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const dial = await Dial.findOne({ dialId: id });
    if (!dial) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (dial.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Expired' }, { status: 410 });
    }

    // Increment view count (fire and forget)
    Dial.updateOne({ dialId: id }, { $inc: { viewCount: 1 } }).exec();

    // Never expose passwordHash
    return NextResponse.json({
      dialId: dial.dialId,
      photoUrls: dial.photoUrls,
      audioUrl: dial.audioUrl,
      message: dial.message,
      isProtected: dial.isProtected,
      reactions: dial.reactions,
      viewCount: dial.viewCount,
      expiresAt: dial.expiresAt,
    });
  } catch (err) {
    console.error('[GET /api/dials/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
