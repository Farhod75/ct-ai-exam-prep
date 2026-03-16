import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StudyNotesShell from './study-notes-shell';

export default async function StudyNotesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  return <StudyNotesShell />;
}
