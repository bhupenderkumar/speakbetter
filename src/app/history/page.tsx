'use client';

import { useState, useEffect } from 'react';
import { getHistory, clearHistory, HistoryEntry } from '@/utils/history';

const typeColors: Record<string, string> = {
  reading: 'bg-blue-100 text-blue-700',
  pronunciation: 'bg-purple-100 text-purple-700',
  translate: 'bg-green-100 text-green-700',
  conversation: 'bg-orange-100 text-orange-700',
  interview: 'bg-red-100 text-red-700',
  exercise: 'bg-pink-100 text-pink-700',
};

const typeLabels: Record<string, string> = {
  reading: 'Reading',
  pronunciation: 'Pronunciation',
  translate: 'Translation',
  conversation: 'Conversation',
  interview: 'Interview',
  exercise: 'Grammar',
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selected, setSelected] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleClear = () => {
    clearHistory();
    setHistory([]);
    setSelected(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Learning History</h1>
          <p className="text-gray-600 text-sm mt-1">
            Track your progress across all exercises.
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="text-sm text-red-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">No history yet</p>
          <p className="text-sm">Complete a reading, pronunciation, or interview exercise to see it here.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {history.map((entry) => (
            <button
              key={entry.id}
              onClick={() => setSelected(selected?.id === entry.id ? null : entry)}
              className={`text-left w-full p-4 rounded-xl border transition-all ${
                selected?.id === entry.id
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[entry.type]}`}>
                    {typeLabels[entry.type]}
                  </span>
                  <span className="font-medium text-sm">{entry.title}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(entry.timestamp).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              {entry.scores && (
                <div className="flex gap-3 mt-2">
                  {(['accuracy', 'fluency', 'pronunciation', 'overall'] as const).map((k) => (
                    <span key={k} className="text-xs text-gray-500">
                      {k}: <strong>{entry.scores![k]}</strong>
                    </span>
                  ))}
                </div>
              )}
              {selected?.id === entry.id && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                  {entry.originalText && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Original:</p>
                      <p className="text-sm text-gray-700">{entry.originalText}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Your response:</p>
                    <p className="text-sm text-gray-700">{entry.transcript}</p>
                  </div>
                  {entry.feedback && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Feedback:</p>
                      <p className="text-sm text-gray-700">{entry.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
