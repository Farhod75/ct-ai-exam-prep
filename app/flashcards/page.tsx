import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import FlashcardsShell from './flashcards-shell';

export default async function FlashcardsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  return <FlashcardsShell />;
}
