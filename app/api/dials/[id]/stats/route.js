import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/mongodb';
import Dial from '../../../../../models/Dial';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const dial = await Dial.findOne({ dialId: id }, 'viewCount reactions expiresAt');
    if (!dial) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const msLeft = dial.expiresAt - Date.now();
    const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

    return NextResponse.json({
      viewCount: dial.viewCount,
      reactions: dial.reactions,
      daysLeft,
      expiresAt: dial.expiresAt,
    });
  } catch (err) {
    console.error('[GET stats]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
