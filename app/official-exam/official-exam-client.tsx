'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCertification } from '../components/certification-context';
import {
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  Loader2,
  Play,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

interface OfficialQuestion {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string | null;
  optionE: string | null;
  correctAnswer: string;
  explanation: string;
  points: number;
  lo: string;
}

export default function OfficialExamClient() {
  const { certification } = useCertification();
  const isGenAI = certification === 'CT-GenAI';
  const certLink = isGenAI
    ? 'https://istqb.org/certifications/'
    : 'https://istqb.org/certifications/certified-tester-ai-testing-ct-ai/';
  const certPageLabel = isGenAI ? 'CT-GenAI' : 'CT-AI';

  const [questions, setQuestions] = useState<OfficialQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [timeTaken, setTimeTaken] = useState(0);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    setExamStarted(false);
    setExamFinished(false);
    fetch(`/api/official-exam?certification=${certification}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [certification]);

  useEffect(() => {
    if (!examStarted || examFinished) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
      setTimeTaken((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [examStarted, examFinished]);

  const finishExam = useCallback(() => {
    setExamFinished(true);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer: string) => {
    const q = questions[currentIndex];
    const isMultiSelect = q.correctAnswer.includes(',');
    
    if (isMultiSelect) {
      const currentAnswers = answers[q.id]?.split(',').filter(Boolean) || [];
      const newAnswers = currentAnswers.includes(answer)
        ? currentAnswers.filter(a => a !== answer)
        : [...currentAnswers, answer].sort();
      setAnswers(prev => ({ ...prev, [q.id]: newAnswers.join(',') }));
    } else {
      setAnswers(prev => ({ ...prev, [q.id]: answer }));
    }
  };

  const toggleFlag = () => {
    const qId = questions[currentIndex].id;
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;
    
    questions.forEach(q => {
      totalPoints += q.points;
      const userAnswer = answers[q.id]?.toLowerCase().split(',').sort().join(',') || '';
      const correctAnswer = q.correctAnswer.toLowerCase().split(',').sort().join(',');
      if (userAnswer === correctAnswer) {
        earnedPoints += q.points;
      }
    });
    
    return { earnedPoints, totalPoints, percentage: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0 };
  };

  const startExam = () => {
    setExamStarted(true);
    setExamFinished(false);
    setAnswers({});
    setFlagged(new Set());
    setCurrentIndex(0);
    setTimeLeft(60 * 60);
    setTimeTaken(0);
    setShowReview(false);
  };

  const restartExam = () => {
    startExam();
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </main>
    );
  }

  // Compute pass info
  const totalPts = questions.reduce((s, q) => s + q.points, 0);
  const passPoints = Math.ceil(totalPts * 0.65);

  if (!examStarted) {
    return (
      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Official ISTQB® {certPageLabel} Sample Exam</h1>
                <p className="text-slate-500">Official Sample Exam Set</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Official ISTQB® Sample Questions</p>
                  <p>These are the official sample exam questions from ISTQB® in the exact order as published. Use this to simulate real exam conditions.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-slate-800">{questions.length}</div>
                <div className="text-sm text-slate-500">Questions</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-slate-800">60 min</div>
                <div className="text-sm text-slate-500">Time Limit</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-slate-800">{totalPts}</div>
                <div className="text-sm text-slate-500">Total Points</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600">65%</div>
                <div className="text-sm text-slate-500">Pass Score ({passPoints} pts)</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-slate-800 mb-2">Exam Instructions:</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Questions are presented in the official order</li>
                <li>• Some questions are worth 2 points (multi-select)</li>
                <li>• You can flag questions to review later</li>
                <li>• Timer will auto-submit when time runs out</li>
                <li>• Results and explanations shown after completion</li>
              </ul>
            </div>

            <a
              href={certLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary-600 hover:underline mb-6"
            >
              <ExternalLink className="w-4 h-4" />
              View official ISTQB® {certPageLabel} certification page
            </a>

            <button
              onClick={startExam}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              <Play className="w-5 h-5" />
              Start Official Sample Exam
            </button>
          </motion.div>
        </div>
      </main>
    );
  }

  // Results screen
  if (examFinished && !showReview) {
    const { earnedPoints, totalPoints, percentage } = calculateScore();
    const passed = earnedPoints >= passPoints;

    return (
      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {passed ? (
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
            </div>

            <h2 className={`text-2xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {passed ? 'Congratulations! You Passed!' : 'Not Quite There Yet'}
            </h2>
            <p className="text-slate-500 mb-6">
              {passed
                ? `You've demonstrated strong knowledge of ${certPageLabel} concepts!`
                : 'Keep practicing - you\'re getting closer!'}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-3xl font-bold text-slate-800">{earnedPoints}/{totalPoints}</div>
                <div className="text-sm text-slate-500">Points</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className={`text-3xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {percentage}%
                </div>
                <div className="text-sm text-slate-500">Score</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-3xl font-bold text-slate-800">{formatTime(timeTaken)}</div>
                <div className="text-sm text-slate-500">Time</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReview(true)}
                className="flex-1 py-3 px-4 border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Review Answers
              </button>
              <button
                onClick={restartExam}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  // Review screen
  if (examFinished && showReview) {
    return (
      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">Answer Review</h2>
            <button
              onClick={() => setShowReview(false)}
              className="text-sm text-primary-600 hover:underline"
            >
              Back to Results
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const userAnswer = answers[q.id]?.toLowerCase().split(',').sort().join(',') || '';
              const correctAnswer = q.correctAnswer.toLowerCase().split(',').sort().join(',');
              const isCorrect = userAnswer === correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-xl p-6 border-l-4 ${
                    isCorrect ? 'border-green-500' : 'border-red-500'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-slate-800 font-medium mb-1">{q.question}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{q.points} point{q.points > 1 ? 's' : ''}</span>
                        <span>LO: {q.lo}</span>
                      </div>
                    </div>
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-11 mb-3">
                    {['a', 'b', 'c', 'd', 'e'].map((opt) => {
                      const optionKey = `option${opt.toUpperCase()}` as keyof OfficialQuestion;
                      const optionText = q[optionKey];
                      if (!optionText) return null;

                      const isUserAnswer = userAnswer.split(',').includes(opt);
                      const isCorrectOption = correctAnswer.split(',').includes(opt);

                      let bgClass = 'bg-slate-50';
                      if (isCorrectOption) bgClass = 'bg-green-50 border-green-300';
                      else if (isUserAnswer && !isCorrectOption) bgClass = 'bg-red-50 border-red-300';

                      return (
                        <div
                          key={opt}
                          className={`p-3 rounded-lg border ${bgClass} text-sm`}
                        >
                          <span className="font-medium">{opt.toUpperCase()}:</span> {optionText as string}
                          {isCorrectOption && <span className="ml-2 text-green-600">✓</span>}
                          {isUserAnswer && !isCorrectOption && <span className="ml-2 text-red-600">✗</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="ml-11 bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={restartExam}
              className="flex items-center gap-2 bg-primary-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Take Exam Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Active exam screen
  const currentQ = questions[currentIndex];
  const isMultiSelect = currentQ.correctAnswer.includes(',');
  const currentAnswers = answers[currentQ.id]?.split(',').filter(Boolean) || [];

  return (
    <main className="flex-1 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <span className="font-semibold text-slate-800">Official Sample Exam</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
          }`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isFlagged = flagged.has(q.id);
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium relative transition-all ${
                    isCurrent
                      ? 'bg-primary-600 text-white'
                      : isAnswered
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                  {isFlagged && (
                    <Flag className="w-2.5 h-2.5 absolute -top-1 -right-1 text-amber-500 fill-amber-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-primary-600">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                    {currentQ.points} point{currentQ.points > 1 ? 's' : ''}
                  </span>
                  {isMultiSelect && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      Select TWO
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">LO: {currentQ.lo}</p>
              </div>
              <button
                onClick={toggleFlag}
                className={`p-2 rounded-lg transition-colors ${
                  flagged.has(currentQ.id)
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-slate-100 text-slate-400 hover:text-amber-600'
                }`}
              >
                <Flag className={`w-4 h-4 ${flagged.has(currentQ.id) ? 'fill-amber-500' : ''}`} />
              </button>
            </div>

            <p className="text-lg text-slate-800 font-medium mb-6">{currentQ.question}</p>

            <div className="space-y-3">
              {['a', 'b', 'c', 'd', 'e'].map((opt) => {
                const optionKey = `option${opt.toUpperCase()}` as keyof OfficialQuestion;
                const optionText = currentQ[optionKey];
                if (!optionText) return null;

                const isSelected = isMultiSelect
                  ? currentAnswers.includes(opt)
                  : answers[currentQ.id] === opt;

                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                        isSelected
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {opt.toUpperCase()}
                      </span>
                      <span className="text-slate-700">{optionText as string}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="text-sm text-slate-500">
            {Object.keys(answers).length} of {questions.length} answered
          </div>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={finishExam}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Submit Exam
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
