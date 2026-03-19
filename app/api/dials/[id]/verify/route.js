import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '../../../../../lib/mongodb';
import Dial from '../../../../../models/Dial';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { password } = await req.json();

    const dial = await Dial.findOne({ dialId: id });
    if (!dial) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!dial.isProtected) return NextResponse.json({ verified: true });

    const match = await bcrypt.compare(password, dial.passwordHash);
    if (!match) return NextResponse.json({ error: 'Wrong password' }, { status: 401 });

    return NextResponse.json({ verified: true });
  } catch (err) {
    console.error('[POST verify]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
