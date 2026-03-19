import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/mongodb';
import Dial from '../../../../../models/Dial';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const dial = await Dial.findOneAndUpdate(
      { dialId: id },
      { $inc: { reactions: 1 } },
      { new: true }
    );

    if (!dial) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ reactions: dial.reactions });
  } catch (err) {
    console.error('[POST react]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
