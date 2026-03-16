'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCertification } from '../components/certification-context';
import { Brain, Clock, AlertTriangle, CheckCircle2, XCircle, RotateCcw, Loader2, Flag, ChevronLeft, ChevronRight } from 'lucide-react';

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

export default function MockExamClient() {
  const { certification } = useCertification();
  const numChapters = certification === 'CT-GenAI' ? 5 : 11;
  const examTime = 3600; // 60 min for both

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [timeLeft, setTimeLeft] = useState(examTime);
  const [showNav, setShowNav] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset when certification changes
  useEffect(() => {
    setExamStarted(false);
    setExamFinished(false);
    setQuestions([]);
  }, [certification]);

  const startExam = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/questions?mode=mock&certification=${certification}`);
      const data = await res.json();
      setQuestions(data ?? []);
      setCurrentIdx(0);
      setSelected({});
      setFlagged(new Set());
      setTimeLeft(examTime);
      setExamStarted(true);
      setExamFinished(false);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [certification, examTime]);

  useEffect(() => {
    if (examStarted && !examFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [examStarted, examFinished]);

  useEffect(() => {
    if (timeLeft === 0 && examStarted && !examFinished) {
      finishExam();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, examStarted, examFinished]);

  const finishExam = async () => {
    setExamFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    setSaving(true);
    try {
      const answers = (questions ?? []).map((q, i) => ({
        questionId: q?.id,
        selected: selected?.[i] ?? '',
        isCorrect: (selected?.[i] ?? '') === (q?.correctAnswer ?? ''),
      }));
      const score = answers.filter(a => a?.isCorrect).length;
      const total = questions?.length ?? 0;
      await fetch('/api/quiz-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'mock',
          chapter: null,
          score,
          total,
          percentage: total > 0 ? Math.round((score / total) * 100) : 0,
          timeTaken: examTime - timeLeft,
          answers,
          certification,
        }),
      });
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFlag = () => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(currentIdx)) next.delete(currentIdx);
      else next.add(currentIdx);
      return next;
    });
  };

  const currentQ = questions?.[currentIdx];
  const options = currentQ ? [
    { key: 'A', text: currentQ?.optionA ?? '' },
    { key: 'B', text: currentQ?.optionB ?? '' },
    { key: 'C', text: currentQ?.optionC ?? '' },
    { key: 'D', text: currentQ?.optionD ?? '' },
  ] : [];

  if (!examStarted) {
    return (
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-2">
            <Brain className="w-6 h-6 text-purple-600" /> Mock Exam
          </h1>
          <p className="text-slate-500 mb-6">Simulate real exam conditions with 40 questions in 60 minutes</p>

          <div className="bg-white rounded-xl p-6 card-shadow">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Brain className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-slate-800">40 Multiple Choice Questions</p>
                  <p className="text-xs text-slate-500">Covering all {numChapters} syllabus chapters</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-slate-800">60 Minutes Time Limit</p>
                  <p className="text-xs text-slate-500">Auto-submitted when time expires</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-slate-800">65% Passing Score Required</p>
                  <p className="text-xs text-slate-500">You need at least 26 correct answers out of 40</p>
                </div>
              </div>
            </div>
            <button
              onClick={startExam}
              disabled={loading}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              Start Mock Exam
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  if (examFinished) {
    const score = (questions ?? []).reduce((acc, q, i) => acc + ((selected?.[i] ?? '') === (q?.correctAnswer ?? '') ? 1 : 0), 0);
    const total = questions?.length ?? 0;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const passed = pct >= 65;
    const timeTaken = examTime - timeLeft;

    return (
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl p-8 card-shadow">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {passed ? <CheckCircle2 className="w-10 h-10 text-emerald-600" /> : <XCircle className="w-10 h-10 text-red-600" />}
            </div>
            <h2 className="text-3xl font-bold text-slate-800">{passed ? 'PASSED!' : 'Not Yet'}</h2>
            <p className="text-slate-500 mt-2">{score} / {total} correct ({pct}%)</p>
            <p className="text-sm text-slate-400">Time: {formatTime(timeTaken)}</p>
            <div className="w-full bg-slate-100 rounded-full h-3 mt-4">
              <div className={`h-3 rounded-full ${passed ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
            </div>
            {saving && <p className="text-xs text-slate-400 mt-2"><Loader2 className="w-3 h-3 inline animate-spin" /> Saving result...</p>}
          </div>

          <div className="mt-8 space-y-3">
            <h3 className="text-lg font-semibold text-slate-700">Detailed Review</h3>
            {(questions ?? []).map((q, i) => {
              const userAns = selected?.[i] ?? '';
              const correct = userAns === (q?.correctAnswer ?? '');
              return (
                <div key={q?.id ?? i} className={`p-4 rounded-lg border ${correct ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-start gap-2">
                    {correct ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">Q{i + 1}. {q?.question ?? ''}</p>
                      {!correct && (
                        <p className="text-xs text-red-600 mt-1">
                          Your: {userAns || 'Unanswered'} | Correct: {q?.correctAnswer ?? ''}
                        </p>
                      )}
                      <p className="text-xs text-slate-600 mt-1">{q?.explanation ?? ''}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={() => { setExamStarted(false); setExamFinished(false); }} className="w-full mt-6 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-200 transition-colors">
            <RotateCcw className="w-4 h-4" /> Take Another Mock Exam
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="max-w-[800px] mx-auto px-4 py-4">
      <div className="sticky top-14 z-40 bg-white/95 backdrop-blur rounded-xl p-3 card-shadow mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600">Q {currentIdx + 1}/{questions?.length ?? 0}</span>
          <div className="w-32 bg-slate-200 rounded-full h-1.5">
            <div className="bg-purple-600 h-1.5 rounded-full transition-all" style={{ width: `${((currentIdx + 1) / (questions?.length ?? 1)) * 100}%` }} />
          </div>
        </div>
        <div className={`flex items-center gap-1 text-sm font-mono font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-slate-700'}`}>
          <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNav(!showNav)} className="px-3 py-1 text-xs bg-slate-100 rounded-lg hover:bg-slate-200">Navigator</button>
          <button onClick={toggleFlag} className={`p-1.5 rounded-lg ${flagged.has(currentIdx) ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showNav && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-4 card-shadow mb-4">
          <div className="grid grid-cols-10 gap-1">
            {(questions ?? []).map((_, i) => {
              const answered = selected?.[i] !== undefined;
              const isFlagged = flagged.has(i);
              const isCurrent = i === currentIdx;
              return (
                <button
                  key={i}
                  onClick={() => { setCurrentIdx(i); setShowNav(false); }}
                  className={`w-8 h-8 rounded text-xs font-medium transition-all ${
                    isCurrent ? 'bg-purple-600 text-white' :
                    isFlagged ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                    answered ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-100 text-slate-500'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={currentIdx} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Ch {currentQ?.chapter ?? ''}</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mt-3 mb-5">{currentQ?.question ?? ''}</h2>
          <div className="space-y-3">
            {options.map(opt => {
              const isSelected = selected?.[currentIdx] === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setSelected(prev => ({ ...(prev ?? {}), [currentIdx]: opt.key }))}
                  className={`w-full text-left p-3.5 rounded-lg border-2 transition-all flex items-start gap-3 ${
                    isSelected ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">{opt.key}</span>
                  <span className="text-sm text-slate-700">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white text-slate-600 card-shadow disabled:opacity-40 transition-all text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        {currentIdx === (questions?.length ?? 1) - 1 ? (
          <button onClick={finishExam} className="flex items-center gap-1 px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all text-sm font-medium">
            Submit Exam
          </button>
        ) : (
          <button
            onClick={() => setCurrentIdx(Math.min((questions?.length ?? 1) - 1, currentIdx + 1))}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white text-slate-600 card-shadow transition-all text-sm"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </main>
  );
}
