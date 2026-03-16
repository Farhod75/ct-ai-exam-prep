import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StudyPlanShell from './study-plan-shell';

export default async function StudyPlanPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  return <StudyPlanShell />;
}
