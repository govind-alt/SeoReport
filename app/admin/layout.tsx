import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Super Admin — RankFlow',
  description: 'RankFlow Platform Administration Console',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
