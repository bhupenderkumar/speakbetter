const HISTORY_KEY = 'eng_history';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  type: 'reading' | 'pronunciation' | 'translate' | 'conversation' | 'interview' | 'exercise';
  title: string;
  transcript: string;
  scores?: { accuracy: number; fluency: number; pronunciation: number; overall: number };
  feedback?: string;
  originalText?: string;
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addHistory(entry: HistoryEntry): void {
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 200)));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
