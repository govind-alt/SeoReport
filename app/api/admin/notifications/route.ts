import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ notifications: [], total: 0 });
}

export async function POST() {
  return NextResponse.json({ success: true });
}
