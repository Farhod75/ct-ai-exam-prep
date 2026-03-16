'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCertification } from '../components/certification-context';
import { BookOpen, ChevronDown, ChevronUp, Loader2, Target, FileText } from 'lucide-react';

interface StudyNote {
  id: number;
  chapterNumber: number;
  chapterTitle: string;
  learningObjectives: string;
  content: string;
  keyTerms: string;
}

export default function StudyNotesClient() {
  const { certification } = useCertification();
  const numChapters = certification === 'CT-GenAI' ? 5 : 11;
  const syllabusLabel = certification === 'CT-GenAI' ? 'CT-GenAI' : 'CT-AI';
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Record<number, string>>({});

  useEffect(() => {
    setLoading(true);
    setExpandedChapter(null);
    fetch(`/api/study-notes?certification=${certification}`)
      .then(r => r.json())
      .then(d => { setNotes(d ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [certification]);

  const toggleChapter = (ch: number) => {
    setExpandedChapter(prev => prev === ch ? null : ch);
  };

  const getTab = (ch: number) => activeTab?.[ch] ?? 'notes';
  const setTab = (ch: number, tab: string) => setActiveTab(prev => ({ ...(prev ?? {}), [ch]: tab }));

  return (
    <main className="max-w-[900px] mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-2">
          <BookOpen className="w-6 h-6 text-emerald-500" /> Study Notes
        </h1>
        <p className="text-slate-500 mb-6">Comprehensive notes covering all {numChapters} chapters of the {syllabusLabel} syllabus</p>

        {loading ? (
          <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
        ) : (
          <div className="space-y-3">
            {(notes ?? []).map((note, i) => (
              <motion.div
                key={note?.id ?? i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-xl card-shadow overflow-hidden"
              >
                <button
                  onClick={() => toggleChapter(note?.chapterNumber ?? 0)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                      {note?.chapterNumber ?? ''}
                    </div>
                    <span className="text-sm font-medium text-slate-800 text-left">{note?.chapterTitle ?? ''}</span>
                  </div>
                  {expandedChapter === (note?.chapterNumber ?? 0)
                    ? <ChevronUp className="w-5 h-5 text-slate-400" />
                    : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>

                {expandedChapter === (note?.chapterNumber ?? 0) && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="border-t border-slate-100">
                    <div className="flex border-b border-slate-100">
                      {[
                        { key: 'notes', label: 'Notes', icon: FileText },
                        { key: 'objectives', label: 'Learning Objectives', icon: Target },
                        { key: 'terms', label: 'Key Terms', icon: BookOpen },
                      ].map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => setTab(note?.chapterNumber ?? 0, tab.key)}
                          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all border-b-2 ${
                            getTab(note?.chapterNumber ?? 0) === tab.key
                              ? 'border-emerald-500 text-emerald-700'
                              : 'border-transparent text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <tab.icon className="w-3.5 h-3.5" />
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    <div className="p-5 max-h-[500px] overflow-y-auto">
                      {getTab(note?.chapterNumber ?? 0) === 'notes' && (
                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{note?.content ?? ''}</div>
                      )}
                      {getTab(note?.chapterNumber ?? 0) === 'objectives' && (
                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{note?.learningObjectives ?? ''}</div>
                      )}
                      {getTab(note?.chapterNumber ?? 0) === 'terms' && (
                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{note?.keyTerms ?? ''}</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </main>
  );
}
