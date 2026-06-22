import { callLLM } from './openrouter';

export interface GeneratedPassage {
  id: string;
  difficulty: string;
  title: string;
  text: string;
}

export async function generatePassage(difficulty: string): Promise<GeneratedPassage> {
  const prompt = `You are a reading passage generator for English learners at the "${difficulty}" level.

Difficulty guidelines:
- Easy: Simple vocabulary, present tense, short sentences (10-15 words). For beginners.
- Medium: Moderate vocabulary, mixed tenses, some complex sentences (15-20 words).
- Hard: Advanced vocabulary, nuanced ideas, complex sentence structures (20-25 words).
- Interview: Professional/formal tone covering career, experience, goals topics.
- Hindi Speaker: Simple English with common words, suitable for Hindi-medium background learners.

Requirements:
- Write ONE coherent passage on a single topic (not disconnected paragraphs)
- Approximately 500 words
- Natural, conversational tone that feels like a real text someone would read
- Include a variety of sentence types (simple, compound, complex)
- Choose engaging, universally relatable topics (travel, food, culture, daily life, technology, nature)

Return JSON:
{
  "title": "<short, engaging title>",
  "text": "<approximately 500 word passage>"
}`;

  const text = await callLLM([
    { role: 'system', content: 'You are a passage generator. Respond with valid JSON only.' },
    { role: 'user', content: prompt },
  ], { temperature: 0.8, model: 'nvidia/nemotron-3-nano-30b-a3b:free' });

  const cleaned = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    id: `gen-${Date.now()}`,
    difficulty,
    title: parsed.title,
    text: parsed.text,
  };
}
