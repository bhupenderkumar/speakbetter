'use client';

import { useState, useCallback } from 'react';
import VoiceRecorder from '@/components/VoiceRecorder';
import { callLLM } from '@/utils/openrouter';
import { addHistory } from '@/utils/history';

type Direction = 'en-to-hi' | 'hi-to-en';

export default function TranslatePage() {
  const [direction, setDirection] = useState<Direction>('hi-to-en');
  const [inputText, setInputText] = useState('');
  const [translated, setTranslated] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTranscript = useCallback((text: string) => setInputText(text), []);

  const translate = async () => {
    if (!inputText.trim()) return;
    setLoading(true); setError('');
    const src = direction === 'en-to-hi' ? 'English' : 'Hindi';
    const tgt = direction === 'en-to-hi' ? 'Hindi' : 'English';
    try {
      const text = await callLLM([
        { role: 'system', content: `You are a professional translator. Translate from ${src} to ${tgt}. Keep meaning exact, use natural ${tgt} phrasing. Output ONLY the translated text.` },
        { role: 'user', content: inputText },
      ], { temperature: 0.1 });
      addHistory({ id: Date.now().toString(), timestamp: Date.now(), type: 'translate', title: `${src} → ${tgt}`, transcript: inputText, feedback: text, originalText: inputText });
      setTranslated(text);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally { setLoading(false); }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = direction === 'hi-to-en' ? 'en-US' : 'hi-IN';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const swapDirection = () => {
    setDirection(d => d === 'en-to-hi' ? 'hi-to-en' : 'en-to-hi');
    setInputText(''); setTranslated('');
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-bold mb-1">Translate</h1>
      <p className="text-gray-500 mb-6">Speak or type in one language, get instant translation.</p>

      <div className="flex items-center gap-3 mb-6">
        <span className={`text-sm font-semibold ${direction === 'hi-to-en' ? 'text-emerald-600' : 'text-gray-400'}`}>Hindi → English</span>
        <button onClick={swapDirection}
          className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 hover:border-emerald-300 flex items-center justify-center transition-all shadow-sm hover:shadow-md">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
        <span className={`text-sm font-semibold ${direction === 'en-to-hi' ? 'text-emerald-600' : 'text-gray-400'}`}>English → Hindi</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
          {direction === 'hi-to-en' ? 'Speak in Hindi' : 'Speak in English'}
        </p>
        <VoiceRecorder onTranscript={handleTranscript} onError={setError} />
        {inputText && (
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-1">You said:</p>
            <p className="text-gray-700 bg-gray-50 rounded-xl p-3">{inputText}</p>
          </div>
        )}
      </div>

      {inputText && !translated && (
        <button onClick={translate} disabled={loading}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-2.5 text-white font-medium hover:from-emerald-600 hover:to-green-600 disabled:opacity-50 transition-all shadow-sm">
          {loading ? 'Translating...' : 'Translate'}
        </button>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mt-4 animate-fadeIn">{error}</div>
      )}

      {translated && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 mt-4 shadow-sm animate-fadeInUp">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {direction === 'hi-to-en' ? 'English' : 'Hindi'}
            </span>
            <button onClick={() => speakText(translated)} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              🔊 Listen
            </button>
          </div>
          <p className="text-gray-800 text-lg">{translated}</p>
          <button onClick={() => { setTranslated(''); setInputText(''); }} className="mt-4 text-sm text-gray-400 hover:text-gray-600">
            Translate another →
          </button>
        </div>
      )}
    </div>
  );
}
