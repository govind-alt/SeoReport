import { NextRequest, NextResponse } from 'next/server';

const demoNotifications = [
  {
    id: 'notif_1',
    title: 'Report Generated',
    message: 'Monthly SEO Report for RetailPro Ltd has been generated.',
    type: 'success',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'notif_2',
    title: 'Rankings Updated',
    message: '12 keywords moved into Top 3 positions.',
    type: 'info',
    read: true,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

export async function GET() {
  return NextResponse.json({ notifications: demoNotifications });
}

export async function POST() {
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  return NextResponse.json({ success: true });
}
