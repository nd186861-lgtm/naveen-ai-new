import { Storyboard } from "../types";

export async function generateStoryboard(prompt: string, targetSeconds: number, languageName: string = "English", viralStyle: boolean = false): Promise<Storyboard> {
  const response = await fetch('/api/generate-storyboard', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt, targetSeconds, languageName, viralStyle })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned status ${response.status}`);
  }

  return await response.json();
}

export async function generateFrameImage(prompt: string): Promise<string> {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned status ${response.status}`);
  }

  const data = await response.json();
  return data.imageUrl;
}

export async function generateSpeech(text: string, languageName: string, voiceStyle: string = "warm"): Promise<{ data: string; mimeType: string }> {
  const response = await fetch('/api/generate-voice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text, languageName, voiceStyle })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned status ${response.status}`);
  }

  return await response.json();
}

export async function generateChatResponse(messages: { text: string }[]): Promise<string> {
  const response = await fetch('/api/chatbot-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ messages })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned status ${response.status}`);
  }

  const data = await response.json();
  return data.text;
}
