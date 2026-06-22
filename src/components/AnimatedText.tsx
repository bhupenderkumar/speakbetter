'use client';

import { useState, useEffect, useRef } from 'react';

interface AnimatedTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  mode?: 'char' | 'word';
}

export default function AnimatedText({ text, speed = 40, className = '', onComplete, mode = 'word' }: AnimatedTextProps) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed('');
    lastTimeRef.current = 0;

    const words = text.split(' ');
    const chars = text.split('');

    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;

      const threshold = mode === 'word' ? speed : speed * 0.5;

      if (delta >= threshold) {
        if (mode === 'word') {
          if (indexRef.current < words.length) {
            setDisplayed(words.slice(0, indexRef.current + 1).join(' '));
            indexRef.current++;
            lastTimeRef.current = time;
          } else {
            onComplete?.();
            return;
          }
        } else {
          if (indexRef.current < chars.length) {
            const next = chars[indexRef.current];
            if (next === ' ') {
              indexRef.current++;
              lastTimeRef.current = time;
            } else {
              setDisplayed(chars.slice(0, indexRef.current + 1).join(''));
              indexRef.current++;
              lastTimeRef.current = time;
            }
          } else {
            onComplete?.();
            return;
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [text, speed, mode, onComplete]);

  return (
    <span className={className}>
      {displayed}
      {indexRef.current < (mode === 'word' ? text.split(' ').length : text.length) && (
        <span className="inline-block w-0.5 h-[1em] bg-blue-400 ml-0.5 animate-pulse align-middle" />
      )}
    </span>
  );
}
