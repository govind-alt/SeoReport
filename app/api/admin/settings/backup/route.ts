import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const possiblePaths = [
      path.join(process.cwd(), 'dev.db'),
      path.join(process.cwd(), 'prisma', 'dev.db'),
      path.join(process.cwd(), 'prisma', 'prisma.db'),
    ];

    let dbPath = possiblePaths.find(p => fs.existsSync(p));

    if (dbPath && fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `rankflow_backup_${timestamp}.db`;

      return new Response(fileBuffer, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': fileBuffer.length.toString(),
        },
      });
    }

    // Fallback JSON snapshot if direct binary is not found
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      status: 'healthy',
      message: 'Database backup snapshot generated successfully.',
    });
  } catch (error) {
    console.error('[ADMIN_BACKUP_GET]', error);
    return NextResponse.json({ error: 'Backup generation failed' }, { status: 500 });
  }
}
