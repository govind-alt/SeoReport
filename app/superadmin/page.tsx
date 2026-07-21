import { getSuperadminData } from '@/app/actions';
import SuperadminClient from './SuperadminClient';

export default async function SuperadminPage() {
  const data = await getSuperadminData();
  return <SuperadminClient initialData={data} />;
}
