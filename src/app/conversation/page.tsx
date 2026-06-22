'use client';

import { useState, useRef, useCallback } from 'react';
import VoiceRecorder from '@/components/VoiceRecorder';
import { callLLM } from '@/utils/openrouter';
import { addHistory } from '@/utils/history';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

const topics = [
  'Introduce yourself and talk about your background',
  'Discuss your favorite hobby and why you enjoy it',
  'Describe a challenge you faced and how you overcame it',
  'Talk about your goals for the next 5 years',
  'Explain something you are passionate about',
];

export default function ConversationPage() {
  const [topic, setTopic] = useState(topics[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transcript, setTranscript] = useState('');
  const chatRef = useRef<ChatMessage[]>([]);

  const handleTranscript = useCallback((text: string) => setTranscript(text), []);

  const startConversation = async () => {
    setMessages([{ role: 'assistant' as const, content: `Let's practice! Topic: ${topic}\n\nPlease start speaking...` }]);
    chatRef.current = [];
    setTranscript('');
  };

  const sendMessage = async () => {
    if (!transcript.trim()) return;
    setLoading(true); setError('');
    const userMsg = transcript.trim();
    setMessages(prev => [...prev, { role: 'user' as const, content: userMsg }]);
    setTranscript('');
    try {
      const systemPrompt = `You are a friendly English conversation partner for Hindi speakers. Topic: "${topic}".

Rules:
- Keep responses to 2-3 sentences
- Use natural, everyday English
- If the user makes a grammar mistake, gently correct it by repeating the correct version (e.g., "Good! Just a small fix: we say 'I went' not 'I go'. So tell me more...")
- Ask follow-up questions to keep the conversation flowing
- Be encouraging and patient — the user is learning
- Occasionally introduce useful vocabulary naturally into the conversation`;

      const history = chatRef.current.concat({ role: 'user' as const, content: userMsg });
      const res = await callLLM([
        { role: 'system', content: systemPrompt },
        ...history.slice(-10),
      ], { temperature: 0.7 });

      chatRef.current = history.concat({ role: 'assistant', content: res });
      setMessages(prev => [...prev, { role: 'assistant' as const, content: res }]);

      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(res);
        utter.rate = 0.9;
        speechSynthesis.speak(utter);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally { setLoading(false); }
  };

  const endConversation = () => {
    addHistory({ id: Date.now().toString(), timestamp: Date.now(), type: 'conversation', title: `Conversation: ${topic}`, transcript: chatRef.current.filter(m => m.role === 'user').map(m => m.content).join('\n'), feedback: `Had a conversation about "${topic}" with ${chatRef.current.length} exchanges.`, originalText: topic });
    setMessages([]);
    chatRef.current = [];
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-bold mb-1">Conversation Practice</h1>
      <p className="text-gray-500 mb-6">Practice English conversation with AI on various topics.</p>

      <div className="mb-6">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5 block">Select a topic</label>
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <button key={t} onClick={() => { setTopic(t); setMessages([]); chatRef.current = []; }}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition-all ${
                topic === t ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
              }`}>
              {t.length > 30 ? t.slice(0, 30) + '...' : t}
            </button>
          ))}
        </div>
      </div>

      {messages.length === 0 && (
        <button onClick={startConversation}
          className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm">
          Start Conversation
        </button>
      )}

      <div className="space-y-3 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`p-4 rounded-2xl animate-slideUp ${m.role === 'user' ? 'bg-blue-50 border border-blue-100 ml-8' : 'bg-white border border-gray-200 shadow-sm mr-8'}`}>
            <p className="text-xs font-medium mb-1 opacity-50">{m.role === 'user' ? 'You' : 'AI Coach'}</p>
            <p className="text-gray-800">{m.content}</p>
          </div>
        ))}
      </div>

      {messages.length > 0 && (
        <>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-3 shadow-sm">
            <VoiceRecorder onTranscript={handleTranscript} disabled={loading} onError={setError} />
          </div>
          {transcript && (
            <button onClick={sendMessage} disabled={loading}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-white font-medium hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 transition-all shadow-sm">
              {loading ? 'Thinking...' : 'Send & Get Reply'}
            </button>
          )}
          <button onClick={endConversation} className="ml-3 text-sm text-gray-400 hover:text-gray-600">
            End & Save
          </button>
        </>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mt-4 animate-fadeIn">{error}</div>
      )}
    </div>
  );
}
