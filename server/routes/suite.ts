import { Router } from 'express';
import { supabase, timeAgo, assertNoError } from '../db/index.js';
import { startSuiteRun, getSuiteEmitter, getSuiteState } from '../services/suite.service.js';
import type { TestRunItem } from '../../src/types';

export const suiteRouter = Router();

suiteRouter.post('/run', (_req, res) => {
  const runId = startSuiteRun();
  res.status(202).json({ runId });
});

// Server-Sent Events stream of live test progress for a given run.
suiteRouter.get('/stream/:runId', (req, res) => {
  const { runId } = req.params;
  const emitter = getSuiteEmitter(runId);
  if (!emitter) {
    res.status(404).end();
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders?.();

  const send = (evt: unknown) => {
    res.write(`data: ${JSON.stringify(evt)}\n\n`);
  };

  const state = getSuiteState(runId);
  if (state) send({ type: 'begin', total: state.total });

  const onEvent = (evt: any) => {
    send(evt);
    if (evt.type === 'closed') {
      clearInterval(heartbeat);
      res.end();
    }
  };
  emitter.on('event', onEvent);

  const heartbeat = setInterval(() => res.write(': ping\n\n'), 15_000);

  req.on('close', () => {
    clearInterval(heartbeat);
    emitter.off('event', onEvent);
  });
});

function rowToRun(row: any): TestRunItem {
  return {
    id: row.id,
    spec: row.spec,
    status: row.status,
    details: row.details,
    worker: row.worker,
    duration: `${row.duration_ms}ms`,
    timeAgo: timeAgo(row.created_at),
    notes: row.notes,
    actionType: row.action_type,
  };
}

suiteRouter.get('/runs', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const { data, error } = await supabase
      .from('suite_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    assertNoError(error, 'Failed to list suite runs');
    res.json((data ?? []).map(rowToRun));
  } catch (err) {
    next(err);
  }
});
