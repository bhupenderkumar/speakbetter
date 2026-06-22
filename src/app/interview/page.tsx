'use client';

import { useState, useCallback } from 'react';
import VoiceRecorder from '@/components/VoiceRecorder';
import { callLLM } from '@/utils/openrouter';
import { addHistory } from '@/utils/history';

const questions = [
  { id: 'q1', title: 'Tell Me About Yourself', question: 'Tell me about yourself and your background.' },
  { id: 'q2', title: 'Strengths & Weaknesses', question: 'What are your biggest strengths and weaknesses?' },
  { id: 'q3', title: 'Why This Role', question: 'Why do you want this role and why should we hire you?' },
  { id: 'q4', title: 'Career Goals', question: 'Where do you see yourself in 5 years?' },
  { id: 'q5', title: 'Problem Solving', question: 'Describe a difficult problem you solved at work.' },
  { id: 'q6', title: 'Teamwork', question: 'Tell me about a time you worked in a team.' },
  { id: 'q7', title: 'Failure', question: 'Tell me about a time you failed and what you learned.' },
  { id: 'q8', title: 'Leadership', question: 'Describe a situation where you showed leadership.' },
];

const roles = ['Software Engineer', 'Data Scientist', 'Product Manager', 'Business Analyst', 'General / Any Role'];

export default function InterviewPage() {
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [currentQuestion, setCurrentQuestion] = useState(questions[0]);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTranscript = useCallback((text: string) => setAnswer(text), []);

  const getNextQuestion = () => {
    const idx = questions.indexOf(currentQuestion);
    if (idx < questions.length - 1) setCurrentQuestion(questions[idx + 1]);
    setFeedback(null); setScore(null); setAnswer('');
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true); setError('');
    try {
      const text = await callLLM([
        { role: 'system', content: 'You are a strict but helpful interview coach. Respond with valid JSON only.' },
        { role: 'user', content: `You are an interview coach for a ${selectedRole} position.

Question: "${currentQuestion.question}"
Answer: "${answer}"

Evaluate relevance, structure, clarity. Score 1-10. Give specific feedback and a suggestion.
Return JSON: {"score":<1-10>,"feedback":"<2-3 sentences>","suggestion":"<1-2 sentences>"}` },
      ], { temperature: 0.3 });
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      addHistory({ id: Date.now().toString(), timestamp: Date.now(), type: 'interview', title: `${selectedRole}: ${currentQuestion.title}`, transcript: answer, feedback: `${parsed.feedback}\n\nSuggestion: ${parsed.suggestion}`, scores: { accuracy: parsed.score, fluency: 0, pronunciation: 0, overall: parsed.score }, originalText: currentQuestion.question });
      setScore(parsed.score);
      setFeedback(`${parsed.feedback}\n\n💡 ${parsed.suggestion}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-bold mb-1">Interview Preparation</h1>
      <p className="text-gray-500 mb-6">Practice answering common interview questions and get AI feedback.</p>

      <div className="mb-6">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5 block">Target Role</label>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <button key={r} onClick={() => setSelectedRole(r)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition-all ${
                selectedRole === r ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-transparent shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'
              }`}>{r}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
            Q{questions.indexOf(currentQuestion) + 1}/{questions.length}
          </span>
          <span className="text-xs text-gray-400">{selectedRole}</span>
        </div>
        <p className="text-lg font-medium text-gray-900">{currentQuestion.question}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 shadow-sm">
        <VoiceRecorder onTranscript={handleTranscript} disabled={loading} onError={setError} />
        {answer && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 mb-1">Your answer:</p>
            <p className="text-gray-700 bg-gray-50 rounded-xl p-3 text-sm">{answer}</p>
          </div>
        )}
      </div>

      {answer && !feedback && (
        <button onClick={submitAnswer} disabled={loading}
          className="rounded-xl bg-gradient-to-r from-red-500 to-rose-500 px-6 py-2.5 text-white font-medium hover:from-red-600 hover:to-rose-600 disabled:opacity-50 transition-all shadow-sm">
          {loading ? 'Evaluating...' : 'Get Feedback'}
        </button>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mt-4 animate-fadeIn">{error}</div>
      )}

      {feedback && (
        <div className="space-y-4 mt-4 animate-fadeInUp">
          {score !== null && (
            <div className={`text-center p-4 rounded-xl border-2 ${
              score >= 7 ? 'bg-green-50 border-green-200 text-green-700' : score >= 5 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              <span className="text-2xl font-bold">{score}/10</span>
              <span className="text-sm ml-2 opacity-70">
                {score >= 7 ? 'Great answer!' : score >= 5 ? 'Decent, could improve' : 'Needs work'}
              </span>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-semibold text-base mb-2">Feedback</h2>
            <p className="text-gray-700 whitespace-pre-line">{feedback}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={getNextQuestion}
              className="rounded-xl bg-gradient-to-r from-red-500 to-rose-500 px-6 py-2.5 text-white font-medium hover:from-red-600 hover:to-rose-600 transition-all shadow-sm">
              Next Question →
            </button>
            <button onClick={() => { setFeedback(null); setScore(null); setAnswer(''); }} className="text-sm text-gray-400 hover:text-gray-600">
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
