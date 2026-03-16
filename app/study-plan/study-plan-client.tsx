'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCertification } from '../components/certification-context';
import { Calendar, CheckCircle2, Circle, Loader2, Trophy } from 'lucide-react';

interface StudyDay {
  id: string;
  dayNumber: number;
  title: string;
  tasks: string;
  completed: boolean;
}

export default function StudyPlanClient() {
  const { certification } = useCertification();
  const [days, setDays] = useState<StudyDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/study-plan?certification=${certification}`)
      .then(r => r.json())
      .then(d => { setDays(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [certification]);

  const toggleDay = async (dayNumber: number, completed: boolean) => {
    try {
      await fetch('/api/study-plan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayNumber, completed: !completed, certification }),
      });
      setDays(prev => (prev ?? []).map(d =>
        d?.dayNumber === dayNumber ? { ...(d ?? {}), completed: !completed } : d
      ));
    } catch (e) { console.error(e); }
  };

  const completedCount = (days ?? []).filter(d => d?.completed).length;
  const totalDays = days?.length ?? 0;
  const progressPct = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

  const parseTasks = (tasksStr: string): string[] => {
    try {
      return JSON.parse(tasksStr ?? '[]') ?? [];
    } catch {
      return [];
    }
  };

  return (
    <main className="max-w-[900px] mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-2">
          <Calendar className="w-6 h-6 text-rose-500" /> 2-Week Study Plan
        </h1>
        <p className="text-slate-500 mb-6">Follow this structured plan to be exam-ready in 14 days</p>

        <div className="bg-white rounded-xl p-5 card-shadow mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Overall Progress</span>
            <span className="text-sm font-bold text-rose-600">{completedCount}/{totalDays} days</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div className="bg-rose-500 h-3 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          {completedCount === totalDays && totalDays > 0 && (
            <div className="flex items-center gap-2 mt-3 text-emerald-600">
              <Trophy className="w-5 h-5" />
              <span className="text-sm font-medium">Plan completed! You&apos;re ready for the exam!</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>
        ) : (
          <div className="space-y-3">
            {(days ?? []).map((day, i) => {
              const tasks = parseTasks(day?.tasks ?? '[]');
              const isWeek2Start = day?.dayNumber === 8;
              return (
                <div key={day?.id ?? i}>
                  {isWeek2Start && (
                    <div className="text-center py-3">
                      <span className="text-xs uppercase tracking-wider text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Week 2</span>
                    </div>
                  )}
                  {day?.dayNumber === 1 && (
                    <div className="text-center py-3">
                      <span className="text-xs uppercase tracking-wider text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Week 1</span>
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`bg-white rounded-xl p-4 card-shadow transition-all ${day?.completed ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleDay(day?.dayNumber ?? 0, day?.completed ?? false)}
                        className="mt-0.5 flex-shrink-0"
                      >
                        {day?.completed
                          ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                          : <Circle className="w-6 h-6 text-slate-300 hover:text-rose-400 transition-colors" />}
                      </button>
                      <div className="flex-1">
                        <h3 className={`text-sm font-semibold ${day?.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          {day?.title ?? ''}
                        </h3>
                        <ul className="mt-2 space-y-1">
                          {tasks.map((task, j) => (
                            <li key={j} className="text-xs text-slate-500 flex items-start gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                              {task ?? ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </main>
  );
}
