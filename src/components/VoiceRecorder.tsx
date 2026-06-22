'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionError) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionError {
  error: string;
}

export default function VoiceRecorder({ onTranscript, disabled, onError }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) setSupported(false);
    return () => recognitionRef.current?.stop();
  }, []);

  const startRecording = useCallback(() => {
    finalTranscriptRef.current = '';
    setInterimText('');

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      onError?.('Speech recognition is not supported in this browser. Try Chrome.');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = '';
      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) {
        finalTranscriptRef.current += final;
        onTranscript(finalTranscriptRef.current);
      }
      setInterimText(interim);
    };

    recognition.onerror = (event: SpeechRecognitionError) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        onError?.(`Speech recognition error: ${event.error}`);
      }
      setRecording(false);
    };

    recognition.onend = () => {
      if (recording) recognition.start();
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }, [onTranscript, onError, recording]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setRecording(false);
    setInterimText('');
    if (finalTranscriptRef.current.trim()) {
      onTranscript(finalTranscriptRef.current.trim());
    }
  }, [onTranscript]);

  if (!supported) {
    return (
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
        Speech recognition is not available in this browser. Please use Chrome.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={recording ? stopRecording : startRecording}
        disabled={disabled}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
          recording
            ? 'bg-red-500 shadow-lg shadow-red-200 scale-110'
            : 'bg-white border-2 border-gray-200 shadow-sm hover:border-blue-400 hover:shadow-md hover:scale-105'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {recording ? (
          <>
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
            <div className="flex items-end gap-0.5 h-5">
              {[1,2,3,4].map(i => (
                <div
                  key={i}
                  className="w-1 bg-white rounded-full wave-bar"
                  style={{ animationDelay: `${i * 0.12}s`, height: `${40 + i * 15}%` }}
                />
              ))}
            </div>
          </>
        ) : (
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>

      {recording && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm text-gray-500 font-medium">Listening...</span>
          <button
            onClick={stopRecording}
            className="ml-2 text-xs text-gray-400 hover:text-gray-600 underline"
          >
            done
          </button>
        </div>
      )}

      {interimText && recording && (
        <p className="text-gray-400 text-sm italic text-center max-w-md">{interimText}</p>
      )}
    </div>
  );
}
