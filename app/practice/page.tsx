import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PracticeShell from './practice-shell';

export default async function PracticePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  return <PracticeShell />;
}
