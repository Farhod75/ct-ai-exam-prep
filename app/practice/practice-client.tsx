'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCertification } from '../components/certification-context';
import { getChapterList } from '../components/chapter-names';
import { ClipboardCheck, ChevronRight, ChevronLeft, CheckCircle2, XCircle, RotateCcw, Loader2, BookOpen, Filter } from 'lucide-react';

interface Question {
  id: number;
  chapter: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  topic: string;
}

export default function PracticeClient() {
  const { certification } = useCertification();
  const chapterList = getChapterList(certification);
  const [chapter, setChapter] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [numQuestions, setNumQuestions] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset when certification changes
  useEffect(() => {
    setChapter('all');
    setQuizStarted(false);
    setQuizFinished(false);
    setQuestions([]);
  }, [certification]);

  const startQuiz = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('certification', certification);
      if (chapter !== 'all') params.set('chapter', chapter);
      if (difficulty !== 'all') params.set('difficulty', difficulty);
      params.set('limit', numQuestions.toString());
      const res = await fetch(`/api/questions?${params.toString()}`);
      const data = await res.json();
      setQuestions(data ?? []);
      setCurrentIdx(0);
      setSelected({});
      setRevealed({});
      setQuizStarted(true);
      setQuizFinished(false);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [chapter, difficulty, numQuestions, certification]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ch = params.get('chapter');
      if (ch) setChapter(ch);
    }
  }, []);

  const currentQ = questions?.[currentIdx];
  const options = currentQ ? [
    { key: 'A', text: currentQ?.optionA ?? '' },
    { key: 'B', text: currentQ?.optionB ?? '' },
    { key: 'C', text: currentQ?.optionC ?? '' },
    { key: 'D', text: currentQ?.optionD ?? '' },
  ] : [];

  const handleSelect = (key: string) => {
    if (revealed[currentIdx]) return;
    setSelected(prev => ({ ...(prev ?? {}), [currentIdx]: key }));
  };

  const handleReveal = () => {
    setRevealed(prev => ({ ...(prev ?? {}), [currentIdx]: true }));
  };

  const handleFinish = async () => {
    setQuizFinished(true);
    setSaving(true);
    try {
      const answers = (questions ?? []).map((q, i) => ({
        questionId: q?.id,
        selected: selected?.[i] ?? '',
        isCorrect: (selected?.[i] ?? '') === (q?.correctAnswer ?? ''),
      }));
      const score = answers.filter(a => a?.isCorrect).length;
      await fetch('/api/quiz-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'practice',
          chapter: chapter !== 'all' ? parseInt(chapter) : null,
          score,
          total: questions?.length ?? 0,
          percentage: (questions?.length ?? 0) > 0 ? Math.round((score / (questions?.length ?? 1)) * 100) : 0,
          timeTaken: 0,
          answers,
          certification,
        }),
      });
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const score = (questions ?? []).reduce((acc, q, i) => acc + ((selected?.[i] ?? '') === (q?.correctAnswer ?? '') ? 1 : 0), 0);
  const answeredCount = Object.keys(selected ?? {}).length;

  if (!quizStarted) {
    return (
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-2">
            <ClipboardCheck className="w-6 h-6 text-primary-600" /> Practice Quiz
          </h1>
          <p className="text-slate-500 mb-6">Select a chapter and difficulty to practice targeted questions</p>

          <div className="bg-white rounded-xl p-6 card-shadow space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> Chapter</label>
              <select value={chapter} onChange={e => setChapter(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-500">
                <option value="all">All Chapters</option>
                {chapterList.map(ch => (
                  <option key={ch.number} value={ch.number}>{ch.number}. {ch.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5"><Filter className="w-4 h-4" /> Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-500">
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Number of Questions</label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map(n => (
                  <button
                    key={n}
                    onClick={() => setNumQuestions(n)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      numQuestions === n ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >{n}</button>
                ))}
              </div>
            </div>
            <button
              onClick={startQuiz}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
              Start Quiz
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  if (quizFinished) {
    const pct = (questions?.length ?? 0) > 0 ? Math.round((score / (questions?.length ?? 1)) * 100) : 0;
    const passed = pct >= 65;
    return (
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl p-8 card-shadow text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
            {passed ? <CheckCircle2 className="w-8 h-8 text-emerald-600" /> : <XCircle className="w-8 h-8 text-red-600" />}
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{passed ? 'Great Job!' : 'Keep Practicing!'}</h2>
          <p className="text-slate-500 mt-2">You scored {score} out of {questions?.length ?? 0} ({pct}%)</p>
          <div className="w-full bg-slate-100 rounded-full h-3 mt-4">
            <div className={`h-3 rounded-full transition-all ${passed ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2">{passed ? 'Above' : 'Below'} 65% passing threshold</p>
          {saving && <p className="text-xs text-slate-400 mt-2"><Loader2 className="w-3 h-3 inline animate-spin" /> Saving...</p>}

          <div className="mt-6 text-left space-y-4">
            <h3 className="text-lg font-semibold text-slate-700">Review Answers</h3>
            {(questions ?? []).map((q, i) => {
              const userAns = selected?.[i] ?? '';
              const correct = userAns === (q?.correctAnswer ?? '');
              return (
                <div key={q?.id ?? i} className={`p-4 rounded-lg border ${correct ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-start gap-2">
                    {correct ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />}
                    <div>
                      <p className="text-sm font-medium text-slate-800">{q?.question ?? ''}</p>
                      {!correct && <p className="text-xs text-red-600 mt-1">Your answer: {userAns} | Correct: {q?.correctAnswer ?? ''}</p>}
                      <p className="text-xs text-slate-600 mt-1">{q?.explanation ?? ''}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => { setQuizStarted(false); setQuizFinished(false); }} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-200 transition-colors">
              <RotateCcw className="w-4 h-4" /> New Quiz
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="max-w-[800px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-500">Question {currentIdx + 1} of {questions?.length ?? 0}</span>
        <span className="text-sm text-slate-500">{answeredCount} answered</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1.5 mb-6">
        <div className="bg-primary-600 h-1.5 rounded-full transition-all" style={{ width: `${((currentIdx + 1) / (questions?.length ?? 1)) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">Ch {currentQ?.chapter ?? ''}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${currentQ?.difficulty === 'easy' ? 'bg-green-100 text-green-700' : currentQ?.difficulty === 'hard' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{currentQ?.difficulty ?? 'medium'}</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mt-3 mb-5">{currentQ?.question ?? ''}</h2>

          <div className="space-y-3">
            {options.map(opt => {
              const isSelected = selected?.[currentIdx] === opt.key;
              const isCorrect = opt.key === (currentQ?.correctAnswer ?? '');
              const isRevealed = revealed?.[currentIdx];
              let classes = 'border-slate-200 hover:border-primary-300 hover:bg-primary-50';
              if (isSelected && !isRevealed) classes = 'border-primary-500 bg-primary-50';
              if (isRevealed && isCorrect) classes = 'border-emerald-500 bg-emerald-50';
              if (isRevealed && isSelected && !isCorrect) classes = 'border-red-500 bg-red-50';

              return (
                <button
                  key={opt.key}
                  onClick={() => handleSelect(opt.key)}
                  disabled={!!isRevealed}
                  className={`w-full text-left p-3.5 rounded-lg border-2 transition-all flex items-start gap-3 ${classes}`}
                >
                  <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">{opt.key}</span>
                  <span className="text-sm text-slate-700">{opt.text}</span>
                  {isRevealed && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 ml-auto flex-shrink-0" />}
                  {isRevealed && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 ml-auto flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {selected?.[currentIdx] && !revealed?.[currentIdx] && (
            <button onClick={handleReveal} className="mt-4 w-full bg-accent-500 text-white py-2.5 rounded-lg font-medium hover:bg-accent-600 transition-colors">
              Check Answer
            </button>
          )}

          {revealed?.[currentIdx] && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-1">Explanation:</p>
              <p className="text-sm text-blue-700">{currentQ?.explanation ?? ''}</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white text-slate-600 card-shadow hover:card-shadow-hover disabled:opacity-40 transition-all text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        {currentIdx === (questions?.length ?? 1) - 1 ? (
          <button onClick={handleFinish} className="flex items-center gap-1 px-6 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-all text-sm font-medium">
            Finish Quiz
          </button>
        ) : (
          <button
            onClick={() => setCurrentIdx(Math.min((questions?.length ?? 1) - 1, currentIdx + 1))}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white text-slate-600 card-shadow hover:card-shadow-hover transition-all text-sm"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </main>
  );
}
