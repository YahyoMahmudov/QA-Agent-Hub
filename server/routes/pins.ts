import { Router } from 'express';
import { supabase, nowIso, timeAgo, assertNoError } from '../db';
import type { ReviewPin } from '../../src/types';

export const pinsRouter = Router();

function rowToPin(row: any): ReviewPin {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    xpath: row.xpath,
    targetElement: row.target_element,
    page: row.page,
    severity: row.severity,
    author: row.author,
    timeAgo: timeAgo(row.created_at),
    status: row.status,
    jiraKey: row.jira_key ?? undefined,
    coords: row.coord_x != null && row.coord_y != null ? { x: row.coord_x, y: row.coord_y } : undefined,
  };
}

pinsRouter.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from('pins').select('*').order('created_at', { ascending: false });
    assertNoError(error, 'Failed to list pins');
    res.json((data ?? []).map(rowToPin));
  } catch (err) {
    next(err);
  }
});

pinsRouter.post('/', async (req, res, next) => {
  try {
    const body = req.body ?? {};
    if (!body.title || !body.xpath || !body.targetElement || !body.page || !body.severity || !body.author) {
      return res.status(400).json({ error: 'title, xpath, targetElement, page, severity, and author are required' });
    }

    const { count, error: countError } = await supabase.from('pins').select('*', { count: 'exact', head: true });
    assertNoError(countError, 'Failed to count pins');
    const id = body.id || `#PIN-${String((count ?? 0) + 1).padStart(2, '0')}`;

    const { error: insertError } = await supabase.from('pins').insert({
      id,
      title: body.title,
      description: body.description ?? '',
      xpath: body.xpath,
      target_element: body.targetElement,
      page: body.page,
      severity: body.severity,
      author: body.author,
      status: body.status ?? 'open',
      jira_key: body.jiraKey ?? null,
      coord_x: body.coords?.x ?? null,
      coord_y: body.coords?.y ?? null,
      created_at: nowIso(),
    });
    assertNoError(insertError, 'Failed to create pin');

    const { data: row, error: selectError } = await supabase.from('pins').select('*').eq('id', id).single();
    assertNoError(selectError, 'Failed to load created pin');
    res.status(201).json(rowToPin(row));
  } catch (err) {
    next(err);
  }
});

pinsRouter.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: existing, error: existingError } = await supabase.from('pins').select('*').eq('id', id).maybeSingle();
    assertNoError(existingError, 'Failed to look up pin');
    if (!existing) return res.status(404).json({ error: 'Pin not found' });

    const body = req.body ?? {};
    const status = body.status ?? existing.status;
    const jiraKey = body.jiraKey ?? existing.jira_key;

    const { error: updateError } = await supabase.from('pins').update({ status, jira_key: jiraKey }).eq('id', id);
    assertNoError(updateError, 'Failed to update pin');

    const { data: row, error: selectError } = await supabase.from('pins').select('*').eq('id', id).single();
    assertNoError(selectError, 'Failed to load updated pin');
    res.json(rowToPin(row));
  } catch (err) {
    next(err);
  }
});
