export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as { id?: string })?.id;
    if (!userId) return NextResponse.json({ error: 'No user id' }, { status: 401 });

    const body = await req.json();
    const { mode, chapter, score, total, percentage, timeTaken, answers, certification } = body;

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        certification: certification ?? 'CT-AI',
        mode: mode ?? 'practice',
        chapter: chapter ?? null,
        score: score ?? 0,
        total: total ?? 0,
        percentage: percentage ?? 0,
        timeTaken: timeTaken ?? 0,
        answers: {
          create: (answers ?? []).map((a: { questionId: number; selected: string; isCorrect: boolean }) => ({
            questionId: a.questionId,
            selected: a.selected ?? '',
            isCorrect: a.isCorrect ?? false,
          })),
        },
      },
    });

    return NextResponse.json(attempt);
  } catch (error: unknown) {
    console.error('Quiz attempt error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as { id?: string })?.id;
    if (!userId) return NextResponse.json([], { status: 401 });

    const { searchParams } = new URL(req.url);
    const certification = searchParams.get('certification') ?? 'CT-AI';

    const attempts = await prisma.quizAttempt.findMany({
      where: { userId, certification },
      include: { answers: { include: { question: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(attempts ?? []);
  } catch (error: unknown) {
    console.error('Fetch attempts error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
