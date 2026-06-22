'use client';

import { useState } from 'react';
import VoiceRecorder from '@/components/VoiceRecorder';
import { callLLM } from '@/utils/openrouter';
import { addHistory } from '@/utils/history';

const wordSets = [
  { title: 'Commonly Mispronounced', words: ['Develop', 'Comfortable', 'Pronunciation', 'Vegetable', 'Specifically'] },
  { title: 'Interview Essentials', words: ['Experience', 'Responsibility', 'Achievement', 'Collaborate', 'Opportunity'] },
  { title: 'Tricky Sounds for Hindi Speakers', words: ['Sheet', 'Beach', 'Think', 'Village', 'Journal'] },
];

export default function PronunciationPage() {
  const [selectedWord, setSelectedWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [transcript, setTranscript] = useState('');

  const handleTranscript = (text: string) => setTranscript(text);

  const submitPractice = async () => {
    if (!transcript.trim()) return;
    setLoading(true); setError('');
    try {
      const text = await callLLM([
        { role: 'system', content: 'You are a pronunciation coach. Respond with valid JSON only.' },
        { role: 'user', content: `Evaluate pronunciation of "${selectedWord}". User said: "${transcript}". Check v/w, th/d, sh/s errors. Return JSON: {"score":<1-10>,"correct":<bool>,"feedback":"<tips>"}` },
      ], { temperature: 0.3 });
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      addHistory({ id: Date.now().toString(), timestamp: Date.now(), type: 'pronunciation', title: `Pronunciation: "${selectedWord}"`, transcript, feedback: parsed.feedback, scores: { accuracy: parsed.score, fluency: 0, pronunciation: parsed.score, overall: parsed.score }, originalText: selectedWord });
      setScore(parsed.score);
      setResult(parsed.feedback);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 animate-fadeIn">Pronunciation Practice</h1>
      <p className="text-gray-500 mb-6 animate-fadeIn">Pick a word, say it aloud, get AI feedback on your pronunciation.</p>

      {wordSets.map((set) => (
        <div key={set.title} className="mb-5 animate-fadeInUp">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">{set.title}</p>
          <div className="flex flex-wrap gap-2">
            {set.words.map((w) => (
              <button key={w} onClick={() => { setSelectedWord(w); setResult(null); setScore(null); setTranscript(''); }}
                className={`px-4 py-2 rounded-xl border-2 font-medium transition-all ${
                  selectedWord === w
                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white border-transparent shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:shadow-sm'
                }`}>{w}</button>
            ))}
          </div>
        </div>
      ))}

      {selectedWord && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-scaleIn">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg">
              {selectedWord[0]}
            </div>
            <div>
              <p className="text-sm text-gray-400">Say this word clearly</p>
              <p className="text-xl font-bold text-gray-900">{selectedWord}</p>
            </div>
          </div>
          <VoiceRecorder onTranscript={handleTranscript} disabled={loading} />
          {transcript && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-1">Heard:</p>
              <p className="text-gray-600 bg-gray-50 rounded-xl p-3 text-sm">&ldquo;{transcript}&rdquo;</p>
            </div>
          )}
          {transcript && !result && (
            <button onClick={submitPractice} disabled={loading}
              className="mt-4 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-2.5 text-white font-medium hover:from-purple-700 hover:to-violet-700 disabled:opacity-50 transition-all shadow-sm">
              {loading ? 'Analyzing...' : 'Get Feedback'}
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mt-4 animate-fadeIn">{error}</div>
      )}

      {result && (
        <div className="mt-4 space-y-3 animate-fadeInUp">
          {score !== null && (
            <div className={`text-center p-4 rounded-xl border-2 ${
              score >= 7 ? 'bg-green-50 border-green-200 text-green-700'
                : score >= 5 ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              <span className="text-2xl font-bold">{score}/10</span>
              <span className="text-sm ml-2 opacity-70">
                {score >= 7 ? 'Great!' : score >= 5 ? 'Getting there' : 'Needs practice'}
              </span>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-semibold text-base mb-2">Feedback</h2>
            <p className="text-gray-700">{result}</p>
          </div>
          <button onClick={() => { setResult(null); setScore(null); setTranscript(''); }}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Try again →
          </button>
        </div>
      )}
    </div>
  );
}
