import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const CONTENT_DIR = path.join(__dirname, '..', '..', 'ct_ai_exam_prep_content');

interface QuestionData {
  id: number;
  chapter: number;
  question: string;
  options?: Record<string, string>;
  correctAnswer: string;
  explanation?: string;
  difficulty?: string;
  topic?: string;
}

interface NoteData {
  chapter_number?: number;
  chapterNumber?: number;
  chapter_title?: string;
  chapterTitle?: string;
  key_learning_objectives?: string;
  learningObjectives?: string;
  detailed_study_notes?: string;
  content?: string;
  detailedNotes?: string;
  summary?: string;
  key_terms?: string | Array<{term: string; definition: string}>;
  keyTerms?: string;
  exam_tips?: string[];
}

interface FlashcardData {
  id: number;
  chapter: number;
  front: string;
  back: string;
}

interface OfficialQuestionData {
  id: number;
  question: string;
  options?: Record<string, string>;
  correctAnswer: string;
  explanation?: string;
  points?: number;
  lo?: string;
}

async function seedQuestions(filePath: string, certification: string) {
  if (!fs.existsSync(filePath)) { console.log(`Skipping questions for ${certification}: file not found`); return; }
  const questions: QuestionData[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  for (const q of questions) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {
        chapter: q.chapter,
        question: q.question,
        optionA: q.options?.A ?? '',
        optionB: q.options?.B ?? '',
        optionC: q.options?.C ?? '',
        optionD: q.options?.D ?? '',
        correctAnswer: q.correctAnswer,
        explanation: q.explanation ?? '',
        difficulty: q.difficulty ?? 'medium',
        topic: q.topic ?? '',
        certification,
      },
      create: {
        id: q.id,
        chapter: q.chapter,
        question: q.question,
        optionA: q.options?.A ?? '',
        optionB: q.options?.B ?? '',
        optionC: q.options?.C ?? '',
        optionD: q.options?.D ?? '',
        correctAnswer: q.correctAnswer,
        explanation: q.explanation ?? '',
        difficulty: q.difficulty ?? 'medium',
        topic: q.topic ?? '',
        certification,
      },
    });
  }
  console.log(`Seeded ${questions.length} questions for ${certification}`);
}

function formatKeyTerms(keyTerms: string | Array<{term: string; definition: string}> | undefined): string {
  if (!keyTerms) return '';
  if (typeof keyTerms === 'string') return keyTerms;
  if (Array.isArray(keyTerms)) {
    return keyTerms.map(kt => `${kt.term}: ${kt.definition}`).join('\n');
  }
  return '';
}

async function seedNotes(filePath: string, certification: string) {
  if (!fs.existsSync(filePath)) { console.log(`Skipping notes for ${certification}: file not found`); return; }
  const notes: NoteData[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  for (let i = 0; i < notes.length; i++) {
    const n = notes[i];
    const chNum = n.chapter_number ?? n.chapterNumber ?? (i + 1);
    const content = n.detailed_study_notes ?? n.content ?? n.detailedNotes ?? n.summary ?? '';
    const keyTermsFormatted = formatKeyTerms(n.key_terms as any) || n.keyTerms || '';
    const examTips = n.exam_tips ? '\n\nExam Tips:\n' + n.exam_tips.map((t: string) => `• ${t}`).join('\n') : '';
    
    await prisma.studyNote.upsert({
      where: { certification_chapterNumber: { certification, chapterNumber: chNum } },
      update: {
        chapterTitle: n.chapter_title ?? n.chapterTitle ?? `Chapter ${chNum}`,
        learningObjectives: n.key_learning_objectives ?? n.learningObjectives ?? '',
        content: content + examTips,
        keyTerms: keyTermsFormatted,
      },
      create: {
        chapterNumber: chNum,
        chapterTitle: n.chapter_title ?? n.chapterTitle ?? `Chapter ${chNum}`,
        learningObjectives: n.key_learning_objectives ?? n.learningObjectives ?? '',
        content: content + examTips,
        keyTerms: keyTermsFormatted,
        certification,
      },
    });
  }
  console.log(`Seeded ${notes.length} study notes for ${certification}`);
}

async function seedFlashcards(filePath: string, certification: string) {
  if (!fs.existsSync(filePath)) { console.log(`Skipping flashcards for ${certification}: file not found`); return; }
  const cards: FlashcardData[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  for (const c of cards) {
    await prisma.flashcard.upsert({
      where: { id: c.id },
      update: {
        chapter: c.chapter,
        front: c.front,
        back: c.back,
        certification,
      },
      create: {
        id: c.id,
        chapter: c.chapter,
        front: c.front,
        back: c.back,
        certification,
      },
    });
  }
  console.log(`Seeded ${cards.length} flashcards for ${certification}`);
}

async function seedOfficialQuestions(filePath: string, certification: string) {
  if (!fs.existsSync(filePath)) { console.log(`Skipping official questions for ${certification}: file not found`); return; }
  const questions: OfficialQuestionData[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  for (const q of questions) {
    await prisma.officialQuestion.upsert({
      where: { id: q.id },
      update: {
        question: q.question,
        optionA: q.options?.a ?? q.options?.A ?? '',
        optionB: q.options?.b ?? q.options?.B ?? '',
        optionC: q.options?.c ?? q.options?.C ?? '',
        optionD: q.options?.d ?? q.options?.D ?? null,
        optionE: q.options?.e ?? q.options?.E ?? null,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation ?? '',
        points: q.points ?? 1,
        lo: q.lo ?? '',
        certification,
      },
      create: {
        id: q.id,
        question: q.question,
        optionA: q.options?.a ?? q.options?.A ?? '',
        optionB: q.options?.b ?? q.options?.B ?? '',
        optionC: q.options?.c ?? q.options?.C ?? '',
        optionD: q.options?.d ?? q.options?.D ?? null,
        optionE: q.options?.e ?? q.options?.E ?? null,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation ?? '',
        points: q.points ?? 1,
        lo: q.lo ?? '',
        certification,
      },
    });
  }
  console.log(`Seeded ${questions.length} official questions for ${certification}`);
}

async function main() {
  // Seed admin user
  const hashedPassword = await bcrypt.hash('johndoe123', 10);
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: { email: 'john@doe.com', name: 'John Doe', password: hashedPassword },
  });
  console.log('Admin user seeded');

  // ===== CT-AI Content =====
  console.log('\n--- Seeding CT-AI content ---');
  await seedQuestions(path.join(CONTENT_DIR, 'questions.json'), 'CT-AI');
  await seedNotes(path.join(CONTENT_DIR, 'study_notes.json'), 'CT-AI');
  await seedFlashcards(path.join(CONTENT_DIR, 'flashcards.json'), 'CT-AI');
  await seedOfficialQuestions(path.join(CONTENT_DIR, 'official_sample_exam.json'), 'CT-AI');

  // ===== CT-GenAI Content =====
  console.log('\n--- Seeding CT-GenAI content ---');
  await seedQuestions(path.join(CONTENT_DIR, 'ct_genai_questions.json'), 'CT-GenAI');
  await seedNotes(path.join(CONTENT_DIR, 'ct_genai_study_notes.json'), 'CT-GenAI');
  await seedFlashcards(path.join(CONTENT_DIR, 'ct_genai_flashcards.json'), 'CT-GenAI');
  await seedOfficialQuestions(path.join(CONTENT_DIR, 'ct_genai_official_sample_exam.json'), 'CT-GenAI');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
