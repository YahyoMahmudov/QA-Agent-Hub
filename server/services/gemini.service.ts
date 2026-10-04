import { GoogleGenAI } from '@google/genai';

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export interface TriageInput {
  title: string;
  diagnostic: string;
  area: string;
  persona?: string | null;
  severity: string;
}

/**
 * Asks Gemini for a short, actionable root-cause hypothesis + suggested fix
 * for a defect, grounded only in the diagnostic data already captured by
 * the scraper / Playwright suite. Server-side only so the API key never
 * reaches the browser.
 */
export async function triageDefect(input: TriageInput): Promise<string> {
  const ai = getClient();

  const prompt = `You are a senior QA engineer triaging a defect found on the SauceDemo e-commerce test site.

Defect title: ${input.title}
Area: ${input.area}
Severity: ${input.severity}
Persona: ${input.persona ?? 'n/a'}
Diagnostic output: ${input.diagnostic}

In under 120 words, give:
1. Likely root cause
2. Suggested next debugging step for an engineer
Be concise and concrete. Do not invent facts not implied by the diagnostic.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const text = response.text;
  if (!text) throw new Error('Gemini returned an empty response.');
  return text.trim();
}

export function isGeminiConfigured(): boolean {
  const apiKey = process.env.GEMINI_API_KEY;
  return Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');
}
