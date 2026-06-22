export async function callLLM(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  options?: { model?: string; temperature?: number }
) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, options }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error: ${res.status}`);
  }

  const data = await res.json();
  return data.content;
}

export async function transcribeAudio(
  audioBlob: Blob,
  model = 'openai/whisper-1'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('model', model);

  const res = await fetch('/api/transcribe', {
    method: 'POST',
    headers: {},
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Whisper error: ${res.status} - ${err}`);
  }

  const data = await res.json();
  return data.text;
}
