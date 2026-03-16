export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const CT_AI_PLAN = [
  { dayNumber: 1, title: 'Day 1: Introduction to AI', tasks: JSON.stringify(['Read Chapter 1 study notes', 'Complete 10 Chapter 1 flashcards', 'Take Chapter 1 practice quiz (10 questions)']) },
  { dayNumber: 2, title: 'Day 2: AI Testing Aspects', tasks: JSON.stringify(['Read Chapter 2 study notes', 'Complete Chapter 2 flashcards', 'Take Chapter 2 practice quiz (10 questions)']) },
  { dayNumber: 3, title: 'Day 3: ML Overview', tasks: JSON.stringify(['Read Chapter 3 study notes', 'Complete Chapter 3 flashcards', 'Take Chapter 3 practice quiz (10 questions)']) },
  { dayNumber: 4, title: 'Day 4: ML Data (Part 1)', tasks: JSON.stringify(['Read Chapter 4 study notes (first half)', 'Complete first 10 Chapter 4 flashcards', 'Review Chapter 1-3 weak areas']) },
  { dayNumber: 5, title: 'Day 5: ML Data (Part 2)', tasks: JSON.stringify(['Read Chapter 4 study notes (second half)', 'Complete remaining Chapter 4 flashcards', 'Take Chapter 4 practice quiz (15 questions)']) },
  { dayNumber: 6, title: 'Day 6: ML Metrics & Neural Networks', tasks: JSON.stringify(['Read Chapter 5 study notes', 'Read Chapter 6 study notes', 'Complete Chapter 5 & 6 flashcards', 'Take Chapter 5-6 practice quiz (10 questions)']) },
  { dayNumber: 7, title: 'Day 7: Review Week 1 + Mock Exam 1', tasks: JSON.stringify(['Review all flashcards from Chapters 1-6', 'Take your first mock exam (40 questions, 60 min)', 'Review wrong answers and note weak areas']) },
  { dayNumber: 8, title: 'Day 8: Testing AI Systems Overview', tasks: JSON.stringify(['Read Chapter 7 study notes', 'Complete Chapter 7 flashcards', 'Take Chapter 7 practice quiz (10 questions)']) },
  { dayNumber: 9, title: 'Day 9: AI Quality Characteristics', tasks: JSON.stringify(['Read Chapter 8 study notes', 'Complete Chapter 8 flashcards', 'Take Chapter 8 practice quiz (12 questions)']) },
  { dayNumber: 10, title: 'Day 10: Testing Methods', tasks: JSON.stringify(['Read Chapter 9 study notes', 'Complete Chapter 9 flashcards', 'Take Chapter 9 practice quiz (12 questions)']) },
  { dayNumber: 11, title: 'Day 11: Test Environments & AI for Testing', tasks: JSON.stringify(['Read Chapter 10 & 11 study notes', 'Complete Chapter 10 & 11 flashcards', 'Take Chapter 10-11 practice quiz (10 questions)']) },
  { dayNumber: 12, title: 'Day 12: Mock Exam 2 + Weak Areas', tasks: JSON.stringify(['Take second mock exam (40 questions, 60 min)', 'Review all wrong answers thoroughly', 'Focus study on weak chapters identified']) },
  { dayNumber: 13, title: 'Day 13: Comprehensive Review', tasks: JSON.stringify(['Review all flashcards (focus on flagged ones)', 'Take practice quizzes on 3 weakest chapters', 'Re-read key terms for all chapters']) },
  { dayNumber: 14, title: 'Day 14: Final Mock Exam & Confidence Check', tasks: JSON.stringify(['Take final mock exam (40 questions, 60 min)', 'Review any remaining weak areas', 'Light review of all chapter summaries', 'Rest well - you are ready!']) },
];

const CT_GENAI_PLAN = [
  { dayNumber: 1, title: 'Day 1: GenAI Foundations', tasks: JSON.stringify(['Read Chapter 1 study notes - GenAI Foundations & Key Concepts', 'Complete Chapter 1 flashcards (AI spectrum, LLM basics)', 'Take Chapter 1 practice quiz (10 questions)']) },
  { dayNumber: 2, title: 'Day 2: Prompt Structure & Techniques', tasks: JSON.stringify(['Read Chapter 2 study notes - Section 2.1 (Prompt Development)', 'Learn prompt structures and core techniques', 'Complete Chapter 2 flashcards (first half)', 'Take practice quiz on prompting basics (10 questions)']) },
  { dayNumber: 3, title: 'Day 3: Prompt Engineering for Test Tasks', tasks: JSON.stringify(['Read Chapter 2 study notes - Section 2.2 (Applying Prompts to Test Tasks)', 'Focus on test analysis, design, automation with GenAI', 'Take Chapter 2 practice quiz (15 questions)']) },
  { dayNumber: 4, title: 'Day 4: Evaluating & Refining Prompts', tasks: JSON.stringify(['Read Chapter 2 study notes - Section 2.3 (Evaluate & Refine)', 'Complete remaining Chapter 2 flashcards', 'Take Chapter 2 comprehensive practice quiz (15 questions)']) },
  { dayNumber: 5, title: 'Day 5: Managing Risks - Hallucinations & Biases', tasks: JSON.stringify(['Read Chapter 3 study notes - Section 3.1 (Hallucinations, Errors, Biases)', 'Learn mitigation techniques', 'Complete Chapter 3 flashcards (first half)', 'Take practice quiz on risk management (10 questions)']) },
  { dayNumber: 6, title: 'Day 6: Data Privacy, Security & Regulations', tasks: JSON.stringify(['Read Chapter 3 study notes - Sections 3.2, 3.3, 3.4', 'Focus on data privacy risks, energy impact, AI regulations', 'Complete remaining Chapter 3 flashcards', 'Take Chapter 3 practice quiz (12 questions)']) },
  { dayNumber: 7, title: 'Day 7: Review Week 1 + Mock Exam 1', tasks: JSON.stringify(['Review all flashcards from Chapters 1-3', 'Take your first mock exam (40 questions, 60 min)', 'Review wrong answers and note weak areas']) },
  { dayNumber: 8, title: 'Day 8: LLM-Powered Test Infrastructure', tasks: JSON.stringify(['Read Chapter 4 study notes - Section 4.1 (Architecture & RAG)', 'Learn about key components, RAG, and LLM agents', 'Complete Chapter 4 flashcards', 'Take Chapter 4 practice quiz (10 questions)']) },
  { dayNumber: 9, title: 'Day 9: Fine-Tuning & LLMOps', tasks: JSON.stringify(['Read Chapter 4 study notes - Section 4.2 (Fine-Tuning & LLMOps)', 'Focus on operationalizing GenAI for testing', 'Take Chapter 4 practice quiz (10 questions)']) },
  { dayNumber: 10, title: 'Day 10: Deploying GenAI in Test Organizations', tasks: JSON.stringify(['Read Chapter 5 study notes - All sections', 'Focus on Shadow AI, adoption strategy, team building', 'Complete Chapter 5 flashcards', 'Take Chapter 5 practice quiz (10 questions)']) },
  { dayNumber: 11, title: 'Day 11: Mock Exam 2 + Official Sample Exam', tasks: JSON.stringify(['Take second mock exam (40 questions, 60 min)', 'Review wrong answers thoroughly', 'Try the official ISTQB sample exam questions']) },
  { dayNumber: 12, title: 'Day 12: Weak Areas Deep Dive', tasks: JSON.stringify(['Focus study on your 2-3 weakest chapters', 'Re-read relevant study notes', 'Take targeted practice quizzes on weak areas', 'Review all key terms']) },
  { dayNumber: 13, title: 'Day 13: Comprehensive Review', tasks: JSON.stringify(['Review all flashcards (focus on flagged ones)', 'Take practice quizzes on remaining weak areas', 'Re-read key terms for all 5 chapters']) },
  { dayNumber: 14, title: 'Day 14: Final Mock Exam & Confidence Check', tasks: JSON.stringify(['Take final mock exam (40 questions, 60 min)', 'Review any remaining weak areas', 'Light review of all chapter summaries', 'Rest well - you are ready!']) },
];

function getDefaultPlan(certification: string) {
  return certification === 'CT-GenAI' ? CT_GENAI_PLAN : CT_AI_PLAN;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as { id?: string })?.id;
    if (!userId) return NextResponse.json([], { status: 401 });

    const { searchParams } = new URL(req.url);
    const certification = searchParams.get('certification') ?? 'CT-AI';

    let days = await prisma.studyPlanDay.findMany({
      where: { userId, certification },
      orderBy: { dayNumber: 'asc' },
    });

    if (!days || days.length === 0) {
      const plan = getDefaultPlan(certification);
      for (const day of plan) {
        await prisma.studyPlanDay.upsert({
          where: { userId_dayNumber_certification: { userId, dayNumber: day.dayNumber, certification } },
          update: {},
          create: { userId, certification, ...day },
        });
      }
      days = await prisma.studyPlanDay.findMany({
        where: { userId, certification },
        orderBy: { dayNumber: 'asc' },
      });
    }

    return NextResponse.json(days ?? []);
  } catch (error: unknown) {
    console.error('Study plan error:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as { id?: string })?.id;
    if (!userId) return NextResponse.json({ error: 'No user id' }, { status: 401 });

    const { dayNumber, completed, certification } = await req.json();
    const cert = certification ?? 'CT-AI';
    const updated = await prisma.studyPlanDay.update({
      where: { userId_dayNumber_certification: { userId, dayNumber, certification: cert } },
      data: { completed },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error('Update study plan error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
