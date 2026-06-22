import { callLLM } from './openrouter';

export type GrammarConcept =
  | 'have_been'
  | 'modals'
  | 'did_does'
  | 'tenses'
  | 'articles'
  | 'prepositions'
  | 'subject_verb'
  | 'word_order';

export interface ExerciseQuestion {
  hindi: string;
  correct: string;
  options: string[];
  concept: GrammarConcept;
}

export type ConceptScore = { correct: number; total: number };

const conceptLabels: Record<GrammarConcept, string> = {
  have_been: 'Have / Has / Had Been',
  modals: 'Could / Might / Would / Should',
  did_does: 'Did / Does / Do',
  tenses: 'Present Perfect vs Past Tense',
  articles: 'Articles (a / an / the)',
  prepositions: 'Prepositions (in / on / at / to / for / since)',
  subject_verb: 'Subject-Verb Agreement',
  word_order: 'Word Order & Questions',
};

const conceptExamples: Record<GrammarConcept, string> = {
  have_been: 'Use of "have been", "has been", "had been" — e.g. "I have been waiting for an hour." (मैं एक घंटे से इंतज़ार कर रहा हूँ।)',
  modals: 'Modal verbs: could, might, would, should, must — e.g. "I could have finished it." (मैं इसे खत्म कर सकता था।)',
  did_does: 'Difference between did/does/do — e.g. "Does he go to school?" vs "Did he go to school?"',
  tenses: 'Present perfect vs simple past — e.g. "I have seen that movie." vs "I saw that movie yesterday."',
  articles: 'Correct use of a, an, the — e.g. "He is an honest man." vs "He is a honest man."',
  prepositions: 'Prepositions: in, on, at, to, for, since — e.g. "I have lived here since 2020." vs "I have lived here for 2020."',
  subject_verb: 'Subject-verb agreement — e.g. "He goes" not "He go", "She doesn\'t like" not "She don\'t like"',
  word_order: 'Word order in questions and sentences — e.g. "Where are you going?" vs "Where you are going?"',
};

let conceptScores: Record<GrammarConcept, ConceptScore> = {
  have_been: { correct: 0, total: 0 },
  modals: { correct: 0, total: 0 },
  did_does: { correct: 0, total: 0 },
  tenses: { correct: 0, total: 0 },
  articles: { correct: 0, total: 0 },
  prepositions: { correct: 0, total: 0 },
  subject_verb: { correct: 0, total: 0 },
  word_order: { correct: 0, total: 0 },
};

export function recordAnswer(concept: GrammarConcept, correct: boolean): void {
  conceptScores[concept].total++;
  if (correct) conceptScores[concept].correct++;
}

export function getWeakConcepts(): GrammarConcept[] {
  return (Object.entries(conceptScores) as [GrammarConcept, ConceptScore][])
    .filter(([_, s]) => s.total >= 2)
    .sort(([_, a], [__, b]) => (a.correct / Math.max(a.total, 1)) - (b.correct / Math.max(b.total, 1)))
    .map(([c]) => c);
}

export function getConceptLabels(): Record<GrammarConcept, string> {
  return conceptLabels;
}

export function getConceptScores(): Record<GrammarConcept, ConceptScore> {
  return conceptScores;
}

export function resetScores(): void {
  for (const key of Object.keys(conceptScores) as GrammarConcept[]) {
    conceptScores[key] = { correct: 0, total: 0 };
  }
}

const CACHE: ExerciseQuestion[] = [];

export async function generateQuestions(
  weakConcepts?: GrammarConcept[]
): Promise<ExerciseQuestion[]> {
  const weakSection = weakConcepts && weakConcepts.length > 0
    ? `\nThe user is struggling with these concepts. Focus EXTRA questions on them:\n${weakConcepts.map(c => `- ${conceptLabels[c]}: ${conceptExamples[c]}`).join('\n')}`
    : '';

  const prompt = `You are a grammar exercise generator for Hindi speakers learning English.

Generate 5 multiple-choice exercises. Each shows a REALISTIC, MODERATELY LONG Hindi sentence. The user must pick the correct English translation from 4 options.

RULES FOR SENTENCE LENGTH:
- Each sentence should be 10-20 words in English (not short phrases)
- Use natural, everyday situations (work, travel, family, news, relationships)
- Include time references, reasons, conditions — make them feel real
- Example of GOOD length: "मैंने सोचा था कि वह कल तक रिपोर्ट जमा कर देगा लेकिन उसने अभी तक शुरू भी नहीं किया है।"
- BAD (too short): "मैं कल दिल्ली जाऊँगा।"

COVER THESE GRAMMAR CONCEPTS (one per question):
- have_been: Use of "have/has/had been" — "I have been waiting for an hour."
- modals: could, might, would, should, must — "I could have finished it earlier."
- did_does: did vs does vs do — "Does he understand the problem?" vs "Did he understand?"
- tenses: Present perfect vs simple past — "I have visited Paris twice." vs "I visited Paris last year."
- articles: a, an, the — "He is an honest man." vs "He is a honest man."
- prepositions: in, on, at, to, for, since
- subject_verb: "He goes" not "He go", "She doesn't like" not "She don't like"
- word_order: "Where are you going?" not "Where you are going?"${weakSection}

Each wrong option must be a realistic mistake a Hindi speaker would make for that specific concept.

Return JSON:
{
  "questions": [
    {
      "hindi": "मैंने सोचा था कि वह कल तक रिपोर्ट जमा कर देगा लेकिन उसने अभी तक शुरू भी नहीं किया है।",
      "correct": "I thought he would submit the report by yesterday but he hasn't even started yet.",
      "options": [
        "I thought he would submit the report by yesterday but he hasn't even started yet.",
        "I thought he will submit the report by yesterday but he hasn't even started yet.",
        "I think he would submit the report by yesterday but he hasn't even started yet.",
        "I thought he would submitted the report by yesterday but he hasn't even started yet."
      ],
      "concept": "modals"
    }
  ]
}

Shuffle the options so the correct answer is NOT always first. Return exactly 5 questions. Mark each question with the concept it tests.`;

  const text = await callLLM([
    { role: 'system', content: 'You are an exercise generator. Respond with valid JSON only.' },
    { role: 'user', content: prompt },
  ], { temperature: 0.8 });

  const cleaned = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return parsed.questions;
}

export async function getQuestions(): Promise<ExerciseQuestion[]> {
  if (CACHE.length > 0) {
    const batch = CACHE.splice(0, 5);
    return batch;
  }
  const weak = getWeakConcepts();
  const fresh = await generateQuestions(weak.length > 0 ? weak : undefined);
  CACHE.push(...fresh);
  const batch = CACHE.splice(0, 5);
  return batch;
}

export async function refillCache(): Promise<void> {
  if (CACHE.length === 0) {
    const weak = getWeakConcepts();
    const fresh = await generateQuestions(weak.length > 0 ? weak : undefined);
    CACHE.push(...fresh);
  }
}
