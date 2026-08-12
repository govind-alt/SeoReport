import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Allowed tables to prevent arbitrary model access
const ALLOWED_TABLES = [
  'user',
  'agency',
  'client',
  'report',
  'reportTemplate',
  'reportSection',
  'billingSubscription',
  'invoice',
  'invite',
  'googleCredential',
  'auditSnapshot',
  'keywordSnapshot',
  'analyticsSnapshot',
  'backlinkSnapshot',
  'auditLog'
];

export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user || session.user.role?.toLowerCase() !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized access. Superadmin only.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  if (!table || !ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: 'Invalid or missing table parameter' }, { status: 400 });
  }

  try {
    const model = (prisma as any)[table];
    const sample = await model.findFirst();
    const hasId = sample && 'id' in sample;
    
    const [rows, totalCount] = await Promise.all([
      model.findMany({
        take: limit,
        skip: offset,
        orderBy: hasId ? { id: 'desc' } : undefined
      }),
      model.count()
    ]);

    return NextResponse.json({
      table,
      rows,
      pagination: {
        total: totalCount,
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error: any) {
    console.error(`[DB_ACCESS_ERROR] Failed to fetch table ${table}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role?.toLowerCase() !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { table, id } = await request.json();
    if (!table || !ALLOWED_TABLES.includes(table) || !id) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const model = (prisma as any)[table];
    await model.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DB_DELETE_ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role?.toLowerCase() !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { table, id, data } = await request.json();
    if (!table || !ALLOWED_TABLES.includes(table) || !id || !data) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Clean data object (strip relation objects if passed)
    const updatePayload: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      if (key === 'id' || key === 'createdAt' || key === 'updatedAt') continue;
      if (typeof val === 'object' && val !== null && !(val instanceof Date)) continue;
      updatePayload[key] = val;
    }

    const model = (prisma as any)[table];
    const updated = await model.update({
      where: { id },
      data: updatePayload
    });

    return NextResponse.json({ success: true, row: updated });
  } catch (error: any) {
    console.error('[DB_UPDATE_ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role?.toLowerCase() !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { table, data } = await request.json();
    if (!table || !ALLOWED_TABLES.includes(table) || !data) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const createPayload: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      if (key === 'id' || key === 'createdAt' || key === 'updatedAt') continue;
      if (typeof val === 'object' && val !== null && !(val instanceof Date)) continue;
      createPayload[key] = val;
    }

    const model = (prisma as any)[table];
    const created = await model.create({
      data: createPayload
    });

    return NextResponse.json({ success: true, row: created });
  } catch (error: any) {
    console.error('[DB_CREATE_ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
