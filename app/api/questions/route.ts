export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chapter = searchParams.get('chapter');
    const mode = searchParams.get('mode');
    const difficulty = searchParams.get('difficulty');
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const certification = searchParams.get('certification') ?? 'CT-AI';

    const where: Record<string, unknown> = { certification };
    if (chapter && chapter !== 'all') where.chapter = parseInt(chapter);
    if (difficulty && difficulty !== 'all') where.difficulty = difficulty;

    let questions;
    if (mode === 'mock') {
      const allQ = await prisma.question.findMany({ where });
      const shuffled = allQ?.sort(() => Math.random() - 0.5) ?? [];
      questions = shuffled.slice(0, 40);
    } else {
      const allQ = await prisma.question.findMany({ where });
      const shuffled = allQ?.sort(() => Math.random() - 0.5) ?? [];
      questions = shuffled.slice(0, limit);
    }

    return NextResponse.json(questions ?? []);
  } catch (error: unknown) {
    console.error('Questions fetch error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
