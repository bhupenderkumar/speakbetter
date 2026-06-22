import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Server misconfigured: missing OPENROUTER_API_KEY' }, { status: 500 });
  }

  let body: { messages: { role: string; content: string }[]; options?: { model?: string; temperature?: number } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
  }

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: body.options?.model || process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free',
      messages: body.messages,
      temperature: body.options?.temperature ?? 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('OpenRouter error:', res.status, err);
    return NextResponse.json({ error: `OpenRouter error: ${res.status}${err ? ` — ${err}` : ''}` }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ content: data.choices[0].message.content });
}
