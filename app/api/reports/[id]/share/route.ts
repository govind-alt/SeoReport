import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

function generateSlug() {
  return randomBytes(7).toString('base64url').slice(0, 10);
}

// POST /api/reports/[id]/share — generate or return existing shareSlug
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const report = await prisma.report.findUnique({ where: { id }, select: { id: true, shareSlug: true } });
  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  // If already has a slug, return it
  if (report.shareSlug) {
    return NextResponse.json({ shareSlug: report.shareSlug });
  }

  // Generate a new unique slug
  const shareSlug = generateSlug();
  await prisma.report.update({ where: { id }, data: { shareSlug } });

  return NextResponse.json({ shareSlug });
}
