export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const certification = searchParams.get('certification') ?? 'CT-AI';
    const notes = await prisma.studyNote.findMany({
      where: { certification },
      orderBy: { chapterNumber: 'asc' },
    });
    return NextResponse.json(notes ?? []);
  } catch (error: unknown) {
    console.error('Study notes error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
