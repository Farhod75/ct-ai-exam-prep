export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const certification = searchParams.get('certification') ?? 'CT-AI';
    const questions = await prisma.officialQuestion.findMany({
      where: { certification },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching official questions:', error);
    return NextResponse.json([], { status: 500 });
  }
}
