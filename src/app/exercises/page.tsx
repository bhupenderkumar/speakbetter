'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getQuestions, refillCache, recordAnswer, getConceptScores,
  getConceptLabels, resetScores, type ExerciseQuestion, type GrammarConcept
} from '@/utils/exerciseGenerator';
import { addHistory } from '@/utils/history';

type AnswerState = 'idle' | 'correct' | 'wrong';

const conceptColors: Record<GrammarConcept, string> = {
  have_been: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  modals: 'bg-violet-100 text-violet-700 border-violet-200',
  did_does: 'bg-amber-100 text-amber-700 border-amber-200',
  tenses: 'bg-blue-100 text-blue-700 border-blue-200',
  articles: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  prepositions: 'bg-rose-100 text-rose-700 border-rose-200',
  subject_verb: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  word_order: 'bg-orange-100 text-orange-700 border-orange-200',
};

export default function ExercisesPage() {
  const [questions, setQuestions] = useState<ExerciseQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(async () => {
    const nextIdx = index + 1;
    if (nextIdx < questions.length) {
      setIndex(nextIdx);
      setSelected(null);
      setAnswerState('idle');
    } else {
      setLoading(true);
      try {
        const batch = await getQuestions();
        setQuestions(batch);
        setIndex(0);
        setSelected(null);
        setAnswerState('idle');
        refillCache();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load more questions');
      }
      setLoading(false);
    }
  }, [index, questions]);

  useEffect(() => {
    if (answerState !== 'idle') {
      timerRef.current = setTimeout(advance, 1200);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [answerState, advance]);

  const loadQuestions = useCallback(async () => {
    try {
      const batch = await getQuestions();
      setQuestions(batch);
      setIndex(0);
      setSelected(null);
      setAnswerState('idle');
      refillCache();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  const handleSelect = (option: string) => {
    if (answerState !== 'idle') return;
    const q = questions[index];
    if (!q) return;
    setSelected(option);
    const isCorrect = option === q.correct;
    setAnswerState(isCorrect ? 'correct' : 'wrong');
    recordAnswer(q.concept, isCorrect);
    if (isCorrect) setScore(s => s + 1);
    setTotal(t => t + 1);
  };

  const finishSession = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    addHistory({
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: 'exercise',
      title: `Grammar Exercises: ${score}/${total} correct`,
      transcript: `Score: ${score}/${total}`,
      feedback: `Completed grammar exercises with ${Math.round(score / Math.max(total, 1) * 100)}% accuracy.`,
      originalText: 'Grammar Exercise',
    });
    resetScores();
    setScore(0);
    setTotal(0);
    setQuestions([]);
    setIndex(0);
    setSelected(null);
    setAnswerState('idle');
    loadQuestions();
  };

  if (loading && questions.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-1">Grammar Exercises</h1>
        <p className="text-gray-600 mb-6">Translate Hindi sentences to English. Adaptive — focuses on your weak areas.</p>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-blue-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-1">Grammar Exercises</h1>
        <p className="text-gray-600 mb-6">Translate Hindi sentences to English. Adaptive — focuses on your weak areas.</p>
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      </div>
    );
  }

  const q = questions[index];
  if (!q) return null;

  const scores = getConceptScores();
  const labels = getConceptLabels();

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Grammar Exercises</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">
            {index + 1} / {questions.length}
          </span>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
            total > 0
              ? score / total >= 0.7 ? 'bg-green-100 text-green-700'
              : score / total >= 0.4 ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {score}/{total}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {(Object.entries(scores) as [GrammarConcept, { correct: number; total: number }][]).map(([concept, s]) => {
          if (s.total === 0) return null;
          const pct = s.correct / s.total;
          return (
            <span key={concept} className={`text-xs px-2 py-0.5 rounded-full border ${conceptColors[concept]}`}>
              {labels[concept]}: {s.correct}/{s.total}
              {pct < 0.5 ? ' ⚠' : ''}
            </span>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${conceptColors[q.concept]}`}>
            {labels[q.concept]}
          </span>
        </div>
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Hindi Sentence</p>
        <p className="text-2xl font-bold text-gray-900 mb-8 transition-all duration-300" key={q.hindi}>
          {q.hindi}
        </p>

        <div className="space-y-2.5">
          {q.options.map((opt, i) => {
            let btnClass = 'w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 text-gray-800 border-gray-200 hover:border-blue-400 hover:bg-blue-50';

            if (selected) {
              if (opt === q.correct) {
                btnClass = 'w-full text-left p-4 rounded-xl border-2 transition-all duration-200 text-gray-800 border-green-500 bg-green-50 scale-[1.02]';
              } else if (opt === selected) {
                btnClass = 'w-full text-left p-4 rounded-xl border-2 transition-all duration-200 text-gray-800 border-red-500 bg-red-50 animate-[shake_0.3s]';
              } else {
                btnClass = 'w-full text-left p-4 rounded-xl border-2 transition-all duration-200 text-gray-400 border-gray-100 bg-gray-50';
              }
            }

            const label = String.fromCharCode(65 + i);

            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                disabled={answerState !== 'idle'}
                className={btnClass}
              >
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-sm font-semibold text-gray-500 mr-3">
                  {label}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {answerState !== 'idle' && (
          <div className={`mt-6 flex items-center gap-2 p-4 rounded-xl animate-[fadeIn_0.3s] ${
            answerState === 'correct' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <span className="text-xl">
              {answerState === 'correct' ? '✓' : '✗'}
            </span>
            <span className="flex-1">
              {answerState === 'correct'
                ? 'Correct! Well done.'
                : `Correct answer: "${q.correct}"`}
            </span>
            <span className="text-xs text-gray-400 animate-pulse">next in 1s...</span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {total > 0 && (
          <button
            onClick={finishSession}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
          >
            Save & Restart
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
          Loading more questions...
        </div>
      )}
    </div>
  );
}
