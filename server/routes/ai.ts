import { Router } from 'express';
import { supabase, assertNoError } from '../db';
import { triageDefect, isGeminiConfigured } from '../services/gemini.service';

export const aiRouter = Router();

aiRouter.get('/status', (_req, res) => {
  res.json({ configured: isGeminiConfigured() });
});

aiRouter.post('/triage', async (req, res) => {
  if (!isGeminiConfigured()) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server. Set it in .env to enable AI triage.',
    });
  }

  const body = req.body ?? {};
  let input = body;

  if (body.issueId) {
    const { data: row, error } = await supabase.from('issues').select('*').eq('id', body.issueId).maybeSingle();
    assertNoError(error, 'Failed to look up issue');
    if (!row) return res.status(404).json({ error: 'Issue not found' });
    input = {
      title: row.title,
      diagnostic: row.diagnostic,
      area: row.area,
      persona: row.persona,
      severity: row.severity,
    };
  }

  if (!input.title || !input.diagnostic) {
    return res.status(400).json({ error: 'title and diagnostic (or issueId) are required' });
  }

  try {
    const summary = await triageDefect(input);
    res.json({ summary });
  } catch (err) {
    res.status(502).json({ error: `AI triage failed: ${(err as Error).message}` });
  }
});
