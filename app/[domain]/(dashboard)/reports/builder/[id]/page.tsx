import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BuilderClient from './BuilderClient';
import { redirect } from 'next/navigation';

export default async function ReportBuilderPage({ params }: { params: { domain: string, id: string } }) {
  const session = await auth();
  if (!session || !session.user) {
    redirect('/login');
  }

  // Verify the report exists and belongs to this agency
  const report = await prisma.report.findFirst({
    where: { 
      id: params.id,
      client: {
        agency: {
          OR: [{ slug: params.domain }, { subdomain: params.domain }]
        }
      }
    },
    include: {
      client: true
    }
  });

  if (!report) {
    redirect(`/${params.domain}/reports`);
  }

  return (
    <BuilderClient 
      reportId={report.id}
      clientName={report.client.name}
      initialModules={['header', 'executive_summary', 'seo_rankings', 'site_audit', 'backlinks']}
      domain={params.domain}
    />
  );
}
