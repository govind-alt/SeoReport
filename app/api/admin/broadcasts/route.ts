import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const FILE = path.join(process.cwd(), 'data', 'broadcasts.json');

const DEFAULTS = [
  { id: '1', title: 'Scheduled Platform Maintenance Notice', message: 'RankFlow will undergo scheduled maintenance on Sunday, 2–4 AM UTC. Expect brief downtime.', target: 'All Agencies & Clients', type: 'System Warning', date: 'Aug 20, 2026', status: 'active', reach: 'All agencies', actionUrl: '' },
  { id: '2', title: 'New Strategic SEO Recommendations Available', message: 'Upgraded recommendation engine now generates richer, more actionable SEO summaries inside report PDFs.', target: 'Pro & Enterprise', type: 'Feature Release', date: 'Aug 15, 2026', status: 'active', reach: 'Pro & Enterprise agencies', actionUrl: '' },
  { id: '3', title: 'SE Ranking Gateway Update Required', message: 'Please re-sync your SE Ranking project to pick up improved keyword data accuracy.', target: 'All Agencies', type: 'Critical Alert', date: 'Aug 02, 2026', status: 'archived', reach: 'All agencies', actionUrl: '' },
];

function read() {
  try {
    if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
  } catch {}
  return DEFAULTS;
}

function write(data: any[]) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(read());
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const current = read();
  const nb = { ...body, id: Date.now().toString(), date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), status: 'active' };
  const updated = [nb, ...current];
  write(updated);
  return NextResponse.json(nb);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const current = read();
  const updated = current.map((b: any) => b.id === body.id ? { ...b, ...body } : b);
  write(updated);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  const updated = read().filter((b: any) => b.id !== id);
  write(updated);
  return NextResponse.json({ success: true });
}
