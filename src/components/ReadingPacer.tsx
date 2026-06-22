'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface ReadingPacerProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export default function ReadingPacer({ text, speed = 250, onComplete }: ReadingPacerProps) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(speed);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const words = text.split(/\s+/);

  const start = useCallback(() => {
    if (currentIndex >= words.length - 1) {
      setCurrentIndex(-1);
    }
    setIsPlaying(true);
  }, [currentIndex, words.length]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(-1);
  }, []);

  const goTo = useCallback((idx: number) => {
    setCurrentIndex(Math.max(-1, Math.min(idx, words.length - 1)));
  }, [words.length]);

  useEffect(() => {
    setCurrentIndex(-1);
    setIsPlaying(false);
  }, [text]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            onComplete?.();
            return prev;
          }
          return prev + 1;
        });
      }, playSpeed);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isPlaying, playSpeed, words.length, onComplete]);

  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  return (
    <div>
      <div className="relative bg-white rounded-xl border border-gray-200 p-6 mb-4 min-h-[300px] overflow-hidden">
        <div className="leading-relaxed text-lg">
          {words.map((word, i) => {
            const isPast = i < currentIndex;
            const isCurrent = i === currentIndex;
            const isFuture = i > currentIndex;

            return (
              <span
                key={i}
                onClick={() => goTo(i)}
                className={`
                  inline-block mr-1 transition-all duration-300 cursor-pointer rounded px-0.5
                  ${isCurrent
                    ? 'text-white bg-blue-500 scale-110 font-semibold shadow-lg'
                    : isPast
                      ? 'text-gray-300'
                      : 'text-gray-700'
                  }
                  ${isFuture && isPlaying ? 'opacity-60' : ''}
                `}
              >
                {word}
              </span>
            );
          })}
        </div>

        {currentIndex < 0 && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
            <p className="text-gray-400 text-lg">Press Play to start reading</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-3">
        <button
          onClick={isPlaying ? pause : start}
          className="rounded-full bg-blue-600 w-12 h-12 flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-md"
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>

        <button
          onClick={reset}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ↺ Restart
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-400">Speed:</span>
          <input
            type="range"
            min="100"
            max="600"
            step="50"
            value={playSpeed}
            onChange={(e) => setPlaySpeed(Number(e.target.value))}
            className="w-24 h-1.5 accent-blue-500"
          />
          <span className="text-xs text-gray-500 w-12">{Math.round(60000 / playSpeed)} wpm</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 w-24 text-right">
          {currentIndex + 1} / {words.length} words
        </span>
      </div>

      <div className="flex justify-center gap-2 mt-2">
        <button
          onClick={() => goTo(currentIndex - 10)}
          className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
        >
          ‹‹ -10
        </button>
        {currentIndex >= 0 && (
          <button
            onClick={() => goTo(currentIndex - 1)}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
          >
            ‹ prev
          </button>
        )}
        {currentIndex < words.length - 1 && (
          <button
            onClick={() => goTo(currentIndex + 1)}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
          >
            next ›
          </button>
        )}
        <button
          onClick={() => goTo(currentIndex + 10)}
          className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
        >
          +10 ››
        </button>
      </div>
    </div>
  );
}
