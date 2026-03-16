export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chapter = searchParams.get('chapter');
    const certification = searchParams.get('certification') ?? 'CT-AI';
    const where: Record<string, unknown> = { certification };
    if (chapter && chapter !== 'all') where.chapter = parseInt(chapter);
    const cards = await prisma.flashcard.findMany({ where, orderBy: { id: 'asc' } });
    return NextResponse.json(cards ?? []);
  } catch (error: unknown) {
    console.error('Flashcards error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
