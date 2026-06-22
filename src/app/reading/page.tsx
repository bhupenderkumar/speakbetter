'use client';

import { useState, useRef, useCallback } from 'react';
import VoiceRecorder from '@/components/VoiceRecorder';
import ReadingPacer from '@/components/ReadingPacer';
import { callLLM } from '@/utils/openrouter';
import { generatePassage, GeneratedPassage } from '@/utils/generator';
import { addHistory } from '@/utils/history';

const difficulties = ['Easy', 'Medium', 'Hard', 'Interview', 'Hindi Speaker'];

function ScoreCard({ label, value, index }: { label: string; value: number; index: number }) {
  const color = value >= 8 ? 'text-green-600 border-green-200 bg-green-50'
    : value >= 6 ? 'text-yellow-600 border-yellow-200 bg-yellow-50'
    : 'text-red-500 border-red-200 bg-red-50';

  return (
    <div className={`text-center p-4 rounded-xl border-2 ${color} animate-slideUp`} style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs font-medium mt-0.5 opacity-70">{label}</div>
    </div>
  );
}

export default function ReadingPage() {
  const [difficulty, setDifficulty] = useState(difficulties[0]);
  const [passage, setPassage] = useState<GeneratedPassage | null>(null);
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState<'generate' | 'read' | 'record' | 'done'>('generate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [evaluation, setEvaluation] = useState<{ accuracy: number; fluency: number; pronunciation: number; overall: number; feedback: string } | null>(null);
  const [transcript, setTranscript] = useState('');
  const [pacerComplete, setPacerComplete] = useState(false);
  const transcriptRef = useRef('');

  const handleTranscript = useCallback((text: string) => {
    transcriptRef.current = text;
    setTranscript(text);
  }, []);

  const newPassage = async () => {
    setError(''); setEvaluation(null); setTranscript(''); setStep('generate');
    setPacerComplete(false); transcriptRef.current = '';
    setGenerating(true);
    try {
      const p = await generatePassage(difficulty);
      setPassage(p); setStep('read');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate passage');
    } finally { setGenerating(false); }
  };

  const submitReading = async () => {
    const text = transcriptRef.current.trim();
    if (!text) { setError('Please speak something first.'); return; }
    setError(''); setStep('done'); setLoading(true);
    try {
      const resultText = await callLLM([
        { role: 'system', content: 'You are a warm, encouraging English teacher. Always respond with valid JSON.' },
        { role: 'user', content: `Evaluate the user's oral reading.

Original:
"""
${passage!.text}
"""

User:
"""
${text}
"""

Score 1-10: accuracy (words correct), fluency (rhythm), pronunciation (sound clarity), overall.
Return JSON: {"accuracy":<1-10>,"fluency":<1-10>,"pronunciation":<1-10>,"overall":<1-10>,"feedback":"<2-3 encouraging sentences with specifics>"}` },
      ], { temperature: 0.4 });
      const result = JSON.parse(resultText.replace(/```json|```/g, '').trim());
      addHistory({ id: Date.now().toString(), timestamp: Date.now(), type: 'reading', title: `${passage!.difficulty}: ${passage!.title}`, transcript: text, scores: result, feedback: result.feedback, originalText: passage!.text });
      setEvaluation(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStep('record');
    } finally { setLoading(false); }
  };

  const reset = () => { setPassage(null); setEvaluation(null); setTranscript(''); setError(''); setStep('generate'); setPacerComplete(false); transcriptRef.current = ''; };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 animate-fadeIn">Guided Reading</h1>
      <p className="text-gray-500 mb-6 animate-fadeIn">Follow the highlight as you read aloud. Improves pace and fluency.</p>

      <div className="flex flex-wrap items-center gap-2 mb-6 animate-fadeIn">
        {difficulties.map((d) => (
          <button key={d} onClick={() => { setDifficulty(d); reset(); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              difficulty === d ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}>{d}</button>
        ))}
        <button onClick={newPassage} disabled={generating}
          className="ml-auto rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-1.5 text-white text-sm font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-sm">
          {generating ? 'Generating...' : passage ? 'New Passage' : 'Generate Passage'}
        </button>
      </div>

      {generating && (
        <div className="text-center py-16 animate-fadeIn">
          <div className="inline-block w-10 h-10 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 mt-4 text-sm">Writing your passage...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4 animate-fadeIn">{error}</div>
      )}

      {passage && step === 'read' && (
        <div className="animate-fadeInUp">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{passage.difficulty}</span>
            <span className="text-sm text-gray-500">{passage.title}</span>
            <span className="text-xs text-gray-400 ml-auto">~{passage.text.split(/\s+/).length} words</span>
          </div>
          <ReadingPacer text={passage.text} speed={250} onComplete={() => setPacerComplete(true)} />
          {pacerComplete && (
            <div className="text-center animate-fadeIn mt-4">
              <p className="text-sm text-emerald-600 mb-3">✓ Finished reading. Now read it aloud:</p>
              <button onClick={() => setStep('record')}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm">
                Start Recording
              </button>
            </div>
          )}
        </div>
      )}

      {passage && step === 'record' && (
        <div className="animate-fadeInUp">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-4">Read the passage aloud:</p>
            <VoiceRecorder onTranscript={handleTranscript} disabled={loading} />
            {transcript && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-1">Your recording:</p>
                <p className="text-gray-700 bg-gray-50 rounded-xl p-3 max-h-32 overflow-y-auto text-sm">{transcript}</p>
              </div>
            )}
          </div>
          {transcript && (
            <button onClick={submitReading} disabled={loading}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-white font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-sm">
              {loading ? 'Evaluating...' : 'How did I do?'}
            </button>
          )}
        </div>
      )}

      {loading && step === 'done' && (
        <div className="text-center py-12 animate-fadeIn">
          <div className="inline-block w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 mt-3 text-sm animate-pulse">Evaluating your reading...</p>
        </div>
      )}

      {evaluation && (
        <div className="space-y-4 mt-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-scaleIn">
            <h2 className="font-semibold text-lg mb-4">Your Scores</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['accuracy', 'fluency', 'pronunciation', 'overall'] as const).map((key, i) => (
                <ScoreCard key={key} label={key} value={evaluation[key]} index={i} />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-fadeInUp">
            <h2 className="font-semibold text-lg mb-2">Feedback</h2>
            <p className="text-gray-700 leading-relaxed">{evaluation.feedback}</p>
          </div>
          <button onClick={reset} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Practice with a new passage →
          </button>
        </div>
      )}

      {step === 'generate' && !passage && !generating && (
        <div className="text-center py-20 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-gray-400 text-lg mb-1">Select a level and generate a passage</p>
          <p className="text-sm text-gray-400">The word-highlight animation will guide your reading pace.</p>
        </div>
      )}
    </div>
  );
}
