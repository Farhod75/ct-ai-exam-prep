'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart3, Target, Brain, BookOpen, Layers, Calendar,
  ClipboardCheck, TrendingUp, AlertTriangle, CheckCircle2, Award, Loader2
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCertification } from '../components/certification-context';
import { getChapterNames } from '../components/chapter-names';

const ProgressCharts = dynamic(() => import('./progress-charts'), { ssr: false, loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div> });

interface ProgressData {
  chapterPerformance: { chapter: number; correct: number; total: number; percentage: number; attempts: number }[];
  overallPercentage: number;
  totalAnswered: number;
  totalCorrect: number;
  mockScores: { date: string; score: number; total: number; percentage: number }[];
  weakChapters: { chapter: number; percentage: number }[];
  readinessScore: number;
  totalAttempts: number;
}

export default function DashboardClient() {
  const { data: session } = useSession() || {};
  const { certification, certShortLabel } = useCertification();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const chapterNames = getChapterNames(certification);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/progress?certification=${certification}`)
      .then(r => r.json())
      .then(d => { setProgress(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [certification]);

  const userName = session?.user?.name ?? 'Student';
  const isGenAI = certification === 'CT-GenAI';
  const accentColor = isGenAI ? 'purple' : 'primary';

  const examFacts = isGenAI
    ? [
        { label: 'Questions', value: '40 MCQs' },
        { label: 'Duration', value: '60 minutes' },
        { label: 'Passing Score', value: '65% (26/40)' },
        { label: 'Chapters', value: '5 chapters' },
      ]
    : [
        { label: 'Questions', value: '40 MCQs' },
        { label: 'Duration', value: '60 minutes' },
        { label: 'Passing Score', value: '65% (31/47 pts)' },
        { label: 'Chapters', value: '11 chapters' },
      ];

  const quickLinks = [
    { href: '/practice', label: 'Practice Quiz', icon: ClipboardCheck, color: 'bg-blue-500', desc: 'Test by chapter' },
    { href: '/mock-exam', label: 'Mock Exam', icon: Brain, color: isGenAI ? 'bg-purple-500' : 'bg-purple-500', desc: '40 Qs, 60 min' },
    { href: '/flashcards', label: 'Flashcards', icon: Layers, color: 'bg-amber-500', desc: isGenAI ? '120+ cards' : '150+ cards' },
    { href: '/study-notes', label: 'Study Notes', icon: BookOpen, color: 'bg-emerald-500', desc: isGenAI ? '5 chapters' : '11 chapters' },
    { href: '/study-plan', label: 'Study Plan', icon: Calendar, color: 'bg-rose-500', desc: '14-day plan' },
  ];

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {userName}!</h1>
        <p className="text-slate-500 mt-1">
          Track your progress toward passing the ISTQB {certShortLabel} exam (65% required)
        </p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Readiness', value: `${progress?.readinessScore ?? 0}%`, icon: Target, color: isGenAI ? 'text-purple-600' : 'text-primary-600' },
          { label: 'Accuracy', value: `${progress?.overallPercentage ?? 0}%`, icon: TrendingUp, color: 'text-emerald-600' },
          { label: 'Questions Done', value: `${progress?.totalAnswered ?? 0}`, icon: BarChart3, color: 'text-blue-600' },
          { label: 'Mock Exams', value: `${progress?.mockScores?.length ?? 0}`, icon: Award, color: 'text-purple-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl p-4 card-shadow hover:card-shadow-hover transition-shadow"
          >
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <div className="text-2xl font-bold text-slate-800">{loading ? '—' : stat.value}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
        {quickLinks.map((link, i) => (
          <motion.div key={link.href} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.05 }}>
            <Link
              href={link.href}
              className="flex flex-col items-center gap-2 bg-white rounded-xl p-4 card-shadow hover:card-shadow-hover hover:-translate-y-0.5 transition-all text-center"
            >
              <div className={`w-10 h-10 ${link.color} rounded-lg flex items-center justify-center`}>
                <link.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm font-medium text-slate-800">{link.label}</div>
              <div className="text-xs text-slate-400">{link.desc}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Progress + Weak Areas */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-white rounded-xl p-6 card-shadow">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <BarChart3 className={`w-5 h-5 ${isGenAI ? 'text-purple-600' : 'text-primary-600'}`} /> Chapter Performance
          </h2>
          {loading ? (
            <div className="h-48 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary-400" /></div>
          ) : (
            <ProgressCharts chapterPerformance={progress?.chapterPerformance ?? []} mockScores={progress?.mockScores ?? []} chapterNames={chapterNames} />
          )}
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Focus Areas
          </h2>
          {loading ? (
            <div className="h-32 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary-400" /></div>
          ) : (progress?.weakChapters?.length ?? 0) > 0 ? (
            <div className="space-y-3">
              {(progress?.weakChapters ?? []).map(ch => (
                <Link
                  key={ch?.chapter}
                  href={`/practice?chapter=${ch?.chapter}`}
                  className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-700">Ch {ch?.chapter}</span>
                  <span className={`text-sm font-bold ${(ch?.percentage ?? 0) < 50 ? 'text-red-600' : 'text-amber-600'}`}>{ch?.percentage ?? 0}%</span>
                </Link>
              ))}
              <p className="text-xs text-slate-400 mt-2">Chapters below 65% passing threshold</p>
            </div>
          ) : (progress?.totalAnswered ?? 0) > 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
              <p className="text-sm font-medium text-emerald-700">All chapters above 65%!</p>
              <p className="text-xs text-slate-400">Keep practicing to stay sharp</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Target className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">Start practicing to see your focus areas</p>
            </div>
          )}
        </div>
      </div>

      {/* Exam Info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className={`${isGenAI ? 'bg-gradient-to-r from-purple-600 to-purple-700' : 'bg-gradient-to-r from-primary-600 to-primary-700'} rounded-xl p-6 text-white`}>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Award className="w-5 h-5" /> ISTQB {certShortLabel} Exam Quick Facts</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {examFacts.map(fact => (
            <div key={fact.label} className="bg-white/10 backdrop-blur rounded-lg p-3">
              <div className={`text-xs ${isGenAI ? 'text-purple-200' : 'text-primary-200'}`}>{fact.label}</div>
              <div className="text-lg font-bold">{fact.value}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </main>
  );
}
