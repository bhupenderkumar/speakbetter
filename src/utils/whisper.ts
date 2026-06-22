const OPENAI_BASE = 'https://api.openai.com/v1';

export async function transcribeWithOpenAI(
  apiKey: string,
  audioBlob: Blob,
  model = 'whisper-1'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('model', model);

  const res = await fetch(`${OPENAI_BASE}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI Whisper error: ${res.status} - ${err}`);
  }

  const data = await res.json();
  return data.text;
}
