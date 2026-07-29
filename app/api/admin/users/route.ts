import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        agency: {
          select: { name: true }
        }
      }
    });

    const formattedUsers = users.map(u => ({
      id: u.id,
      name: u.name || 'User',
      email: u.email || 'N/A',
      agency: u.agency?.name || (u.role === 'superadmin' ? 'RankFlow Platform' : 'Independent Client'),
      role: u.role || 'member',
      last: new Date(u.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: 'active'
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('[ADMIN_USERS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
