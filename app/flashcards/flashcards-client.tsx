'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCertification } from '../components/certification-context';
import { getChapterList } from '../components/chapter-names';
import { Layers, ChevronLeft, ChevronRight, RotateCcw, Loader2, Shuffle } from 'lucide-react';

interface Flashcard {
  id: number;
  chapter: number;
  front: string;
  back: string;
}

export default function FlashcardsClient() {
  const { certification } = useCertification();
  const chapterList = getChapterList(certification);
  const [chapter, setChapter] = useState('all');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  // Reset chapter when certification changes
  useEffect(() => {
    setChapter('all');
  }, [certification]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/flashcards?chapter=${chapter}&certification=${certification}`)
      .then(r => r.json())
      .then(d => { setCards(d ?? []); setCurrentIdx(0); setFlipped(false); setLoading(false); })
      .catch(() => setLoading(false));
  }, [chapter, certification]);

  const shuffleCards = () => {
    setCards(prev => [...(prev ?? [])].sort(() => Math.random() - 0.5));
    setCurrentIdx(0);
    setFlipped(false);
  };

  const currentCard = cards?.[currentIdx];
  const numChapters = chapterList.length;

  return (
    <main className="max-w-[800px] mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-2">
          <Layers className="w-6 h-6 text-amber-500" /> Flashcards
        </h1>
        <p className="text-slate-500 mb-6">Flip cards to memorize key concepts from all {numChapters} chapters</p>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setChapter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${chapter === 'all' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 card-shadow hover:bg-slate-50'}`}
          >All</button>
          {chapterList.map(ch => (
            <button
              key={ch.number}
              onClick={() => setChapter(ch.number.toString())}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${chapter === ch.number.toString() ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 card-shadow hover:bg-slate-50'}`}
            >Ch {ch.number}</button>
          ))}
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
        ) : (cards?.length ?? 0) === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400">No flashcards found</div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-500">Card {currentIdx + 1} of {cards?.length ?? 0}</span>
              <button onClick={shuffleCards} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white card-shadow rounded-lg text-slate-600 hover:bg-slate-50">
                <Shuffle className="w-4 h-4" /> Shuffle
              </button>
            </div>

            <div className="perspective-1000 mb-6" style={{ perspective: '1000px' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentIdx}-${flipped}`}
                  initial={{ rotateY: flipped ? 180 : 0, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setFlipped(!flipped)}
                  className="cursor-pointer min-h-[280px] bg-white rounded-2xl card-shadow hover:card-shadow-hover transition-shadow flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="text-xs uppercase tracking-wider text-slate-400 mb-4">
                    {flipped ? 'Answer' : 'Question'} · Ch {currentCard?.chapter ?? ''}
                  </div>
                  <p className={`text-lg ${flipped ? 'text-emerald-700' : 'text-slate-800'} font-medium leading-relaxed`}>
                    {flipped ? (currentCard?.back ?? '') : (currentCard?.front ?? '')}
                  </p>
                  <p className="text-xs text-slate-400 mt-6">Click to {flipped ? 'see question' : 'reveal answer'}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => { setCurrentIdx(Math.max(0, currentIdx - 1)); setFlipped(false); }}
                disabled={currentIdx === 0}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white text-slate-600 card-shadow disabled:opacity-40 transition-all text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={() => { setFlipped(false); setCurrentIdx(0); }}
                className="p-2 rounded-lg bg-white text-slate-600 card-shadow hover:bg-slate-50"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setCurrentIdx(Math.min((cards?.length ?? 1) - 1, currentIdx + 1)); setFlipped(false); }}
                disabled={currentIdx === (cards?.length ?? 1) - 1}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white text-slate-600 card-shadow disabled:opacity-40 transition-all text-sm"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </motion.div>
    </main>
  );
}
