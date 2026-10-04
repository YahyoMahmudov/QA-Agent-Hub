import { Router } from 'express';
import { supabase, nowIso, timeAgo, assertNoError } from '../db';
import type { DefectIssue } from '../../src/types';

export const issuesRouter = Router();

function formatFirstSeen(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function rowToIssue(row: any): DefectIssue {
  return {
    id: row.id,
    title: row.title,
    diagnostic: row.diagnostic,
    area: row.area,
    firstSeen: formatFirstSeen(row.first_seen_at),
    lastSeen: timeAgo(row.last_seen_at),
    source: row.source,
    severity: row.severity,
    status: row.status,
    locator: row.locator ?? undefined,
    persona: row.persona ?? undefined,
    traceArtifact: row.trace_artifact ?? undefined,
    snapshotUrl: row.snapshot_url ?? undefined,
  };
}

issuesRouter.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from('issues').select('*').order('first_seen_at', { ascending: false });
    assertNoError(error, 'Failed to list issues');
    res.json((data ?? []).map(rowToIssue));
  } catch (err) {
    next(err);
  }
});

issuesRouter.post('/', async (req, res, next) => {
  try {
    const body = req.body ?? {};
    if (!body.title || !body.diagnostic || !body.area || !body.source || !body.severity) {
      return res.status(400).json({ error: 'title, diagnostic, area, source, and severity are required' });
    }
    const now = nowIso();
    const id = body.id || `ISS-${Date.now().toString(36).toUpperCase()}`;

    const { error: insertError } = await supabase.from('issues').insert({
      id,
      title: body.title,
      diagnostic: body.diagnostic,
      area: body.area,
      source: body.source,
      severity: body.severity,
      status: body.status ?? 'open',
      locator: body.locator ?? null,
      persona: body.persona ?? null,
      trace_artifact: body.traceArtifact ?? null,
      snapshot_url: body.snapshotUrl ?? null,
      first_seen_at: now,
      last_seen_at: now,
    });
    assertNoError(insertError, 'Failed to create issue');

    const { data: row, error: selectError } = await supabase.from('issues').select('*').eq('id', id).single();
    assertNoError(selectError, 'Failed to load created issue');
    res.status(201).json(rowToIssue(row));
  } catch (err) {
    next(err);
  }
});

issuesRouter.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: existing, error: existingError } = await supabase.from('issues').select('*').eq('id', id).maybeSingle();
    assertNoError(existingError, 'Failed to look up issue');
    if (!existing) return res.status(404).json({ error: 'Issue not found' });

    const body = req.body ?? {};
    const status = body.status ?? existing.status;

    const { error: updateError } = await supabase
      .from('issues')
      .update({ status, last_seen_at: nowIso() })
      .eq('id', id);
    assertNoError(updateError, 'Failed to update issue');

    const { data: row, error: selectError } = await supabase.from('issues').select('*').eq('id', id).single();
    assertNoError(selectError, 'Failed to load updated issue');
    res.json(rowToIssue(row));
  } catch (err) {
    next(err);
  }
});

issuesRouter.delete('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('issues').delete().eq('id', req.params.id).select('id');
    assertNoError(error, 'Failed to delete issue');
    if (!data || data.length === 0) return res.status(404).json({ error: 'Issue not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
