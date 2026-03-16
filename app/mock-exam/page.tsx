import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MockExamShell from './mock-exam-shell';

export default async function MockExamPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  return <MockExamShell />;
}
