import { use } from 'react';
import AuditIssuesClient from './AuditIssuesClient';

export default function AuditIssuesPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = use(params);
  const domain = resolvedParams.domain || 'localhost';

  return <AuditIssuesClient domain={domain} />;
}
