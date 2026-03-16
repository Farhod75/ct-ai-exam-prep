import SignupForm from './signup-form';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function SignupPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect('/dashboard');
  return <SignupForm />;
}
