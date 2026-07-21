import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Define the allowed tables to prevent arbitrary access
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
  'googleCredential'
];

export async function GET(request: NextRequest) {
  const session = await auth();
  
  // Security: Only Superadmins can access the raw database
  if (!session?.user || session.user.role !== 'SUPERADMIN') {
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
    // Dynamically access the prisma model
    const model = (prisma as any)[table];
    
    // Check if table has 'id' column for sorting by checking first record
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
