import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import OfficialExamShell from './official-exam-shell';

export default async function OfficialExamPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  return <OfficialExamShell />;
}
