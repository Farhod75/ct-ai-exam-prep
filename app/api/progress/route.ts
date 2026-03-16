export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as { id?: string })?.id;
    if (!userId) return NextResponse.json({ error: 'No user id' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const certification = searchParams.get('certification') ?? 'CT-AI';
    const maxChapters = certification === 'CT-GenAI' ? 5 : 11;

    const attempts = await prisma.quizAttempt.findMany({
      where: { userId, certification },
      include: { answers: { include: { question: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // Chapter performance
    const chapterStats: Record<number, { correct: number; total: number; attempts: number }> = {};
    for (let ch = 1; ch <= maxChapters; ch++) {
      chapterStats[ch] = { correct: 0, total: 0, attempts: 0 };
    }

    for (const attempt of (attempts ?? [])) {
      for (const ans of (attempt?.answers ?? [])) {
        const ch = ans?.question?.chapter;
        if (ch && chapterStats[ch]) {
          chapterStats[ch].total++;
          if (ans?.isCorrect) chapterStats[ch].correct++;
        }
      }
      if (attempt?.chapter && chapterStats[attempt.chapter]) {
        chapterStats[attempt.chapter].attempts++;
      }
    }

    const chapterPerformance = Object.entries(chapterStats).map(([ch, stats]) => ({
      chapter: parseInt(ch),
      correct: stats?.correct ?? 0,
      total: stats?.total ?? 0,
      percentage: (stats?.total ?? 0) > 0 ? Math.round(((stats?.correct ?? 0) / (stats?.total ?? 1)) * 100) : 0,
      attempts: stats?.attempts ?? 0,
    }));

    const totalCorrect = chapterPerformance.reduce((sum, c) => sum + (c?.correct ?? 0), 0);
    const totalAnswered = chapterPerformance.reduce((sum, c) => sum + (c?.total ?? 0), 0);
    const overallPercentage = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    const mockAttempts = (attempts ?? []).filter(a => a?.mode === 'mock');
    const mockScores = mockAttempts.map(a => ({
      date: a?.createdAt,
      score: a?.score ?? 0,
      total: a?.total ?? 0,
      percentage: a?.percentage ?? 0,
    }));

    const weakChapters = chapterPerformance
      .filter(c => (c?.total ?? 0) > 0 && (c?.percentage ?? 0) < 65)
      .sort((a, b) => (a?.percentage ?? 0) - (b?.percentage ?? 0));

    const readinessScore = Math.min(100, Math.round(
      (overallPercentage * 0.4) +
      (Math.min(mockAttempts?.length ?? 0, 3) * 10) +
      (weakChapters?.length === 0 ? 20 : Math.max(0, 20 - (weakChapters?.length ?? 0) * 4))
    ));

    return NextResponse.json({
      chapterPerformance,
      overallPercentage,
      totalAnswered,
      totalCorrect,
      mockScores,
      weakChapters,
      readinessScore,
      totalAttempts: attempts?.length ?? 0,
    });
  } catch (error: unknown) {
    console.error('Progress error:', error);
    return NextResponse.json({ chapterPerformance: [], overallPercentage: 0, totalAnswered: 0, totalCorrect: 0, mockScores: [], weakChapters: [], readinessScore: 0, totalAttempts: 0 }, { status: 500 });
  }
}
