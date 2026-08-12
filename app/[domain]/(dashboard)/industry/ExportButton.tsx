'use client';

import { toast } from 'sonner';

export default function ExportButton({ data }: { data: any[] }) {
  const handleExport = () => {
    try {
      if (!data || data.length === 0) {
        toast.error('No data to export');
        return;
      }
      
      const headers = ['Industry', 'Active Clients', 'Average Health (%)', 'Total Traffic'];
      const rows = data.map(ind => [
        `"${ind.name}"`,
        ind.clientCount,
        ind.averageHealth,
        ind.totalTraffic
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(e => e.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'industry_benchmarks.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Export downloaded successfully!');
    } catch (err) {
      toast.error('Failed to export data');
    }
  };

  return (
    <button className="btn btn-secondary btn-sm" onClick={handleExport}>
      📥 Export Industry Report
    </button>
  );
}
