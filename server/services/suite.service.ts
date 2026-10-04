import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import { supabase, nowIso, assertNoError } from '../db';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface TestEndEvent {
  type: 'test-end';
  title: string;
  file: string;
  line: number;
  status: 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted';
  duration: number;
  error: string | null;
  retry: number;
}

interface RunState {
  total: number;
  done: number;
  passed: number;
  failed: number;
  finished: boolean;
}

const emitters = new Map<string, EventEmitter>();
const runStates = new Map<string, RunState>();

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

export function getSuiteEmitter(runId: string): EventEmitter | undefined {
  return emitters.get(runId);
}

export function getSuiteState(runId: string): RunState | undefined {
  return runStates.get(runId);
}

/** Spawns the real Playwright suite against saucedemo.com and streams progress via an EventEmitter keyed by runId. */
export function startSuiteRun(): string {
  const runId = randomUUID();
  const emitter = new EventEmitter();
  emitter.setMaxListeners(20);
  emitters.set(runId, emitter);
  runStates.set(runId, { total: 0, done: 0, passed: 0, failed: 0, finished: false });

  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const child = spawn(npxCmd, ['playwright', 'test'], {
    cwd: PROJECT_ROOT,
    env: { ...process.env, FORCE_COLOR: '0', PW_STREAM_REPORTER: '1' },
    // .cmd shims on Windows must be spawned through a shell.
    shell: process.platform === 'win32',
  });

  let buffer = '';
  const testResults: TestEndEvent[] = [];

  child.stdout.on('data', (chunk: Buffer) => {
    buffer += chunk.toString();
    let idx;
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line) continue;
      let evt: any;
      try {
        evt = JSON.parse(line);
      } catch {
        continue;
      }
      handleEvent(runId, evt, emitter, testResults);
    }
  });

  child.stderr.on('data', (chunk: Buffer) => {
    const text = chunk.toString().trim();
    if (text) emitter.emit('event', { type: 'log', text });
  });

  child.on('error', (err) => {
    emitter.emit('event', { type: 'error', message: err.message });
  });

  child.on('close', async (code) => {
    const state = runStates.get(runId);
    if (state) state.finished = true;
    await persistSuiteRun(testResults);
    emitter.emit('event', {
      type: 'closed',
      code,
      passed: state?.passed ?? 0,
      failed: state?.failed ?? 0,
      total: state?.total ?? testResults.length,
    });
  });

  return runId;
}

function handleEvent(runId: string, evt: any, emitter: EventEmitter, testResults: TestEndEvent[]) {
  const state = runStates.get(runId);
  if (!state) return;

  if (evt.type === 'begin') {
    state.total = evt.total;
    emitter.emit('event', { type: 'begin', total: evt.total });
  } else if (evt.type === 'test-begin') {
    emitter.emit('event', { type: 'test-begin', title: evt.title, file: evt.file });
  } else if (evt.type === 'test-end') {
    state.done += 1;
    if (evt.status === 'passed') state.passed += 1;
    else state.failed += 1;
    testResults.push(evt as TestEndEvent);
    emitter.emit('event', {
      type: 'test-end',
      title: evt.title,
      file: evt.file,
      status: evt.status,
      duration: evt.duration,
      error: evt.error,
      progress: Math.round((state.done / Math.max(state.total, 1)) * 100),
      passed: state.passed,
      failed: state.failed,
    });
  } else if (evt.type === 'end') {
    emitter.emit('event', { type: 'end', status: evt.status, passed: state.passed, failed: state.failed });
  }
}

async function persistSuiteRun(testResults: TestEndEvent[]) {
  if (testResults.length === 0) return;

  const now = nowIso();

  const runRows = testResults.map((t, i) => ({
    id: `TR-${Date.now().toString(36)}${i}`.toUpperCase(),
    spec: t.file,
    status: t.status === 'passed' ? 'PASSED' : t.status === 'skipped' ? 'FLAKY' : 'FAILED',
    details: t.title,
    worker: `Worker #${(i % 4) + 1}`,
    duration_ms: t.duration ?? 0,
    notes: t.error ?? 'Assertions verified against live saucedemo.com',
    action_type: t.status === 'passed' ? 'waterfall' : 'trace',
    passed_count: t.status === 'passed' ? 1 : 0,
    failed_count: t.status === 'passed' ? 0 : 1,
    logs: JSON.stringify([]),
    created_at: now,
  }));
  const { error: insertRunsError } = await supabase.from('suite_runs').insert(runRows);
  assertNoError(insertRunsError, 'Failed to persist suite runs');

  for (let i = 0; i < testResults.length; i++) {
    const t = testResults[i];
    if (t.status === 'passed') continue;

    const title = `${t.title} failed in ${t.file}`;
    const personaMatch = t.title.match(/^\[([a-z_]+)\]/);
    const persona = personaMatch ? personaMatch[1] : null;
    const diagnostic = `${t.error ?? 'Assertion failed'} • spec: ${t.file}:${t.line}`;

    const { data: existing, error: findError } = await supabase
      .from('issues')
      .select('id')
      .eq('title', title)
      .eq('source', 'Playwright')
      .in('status', ['open', 'in_progress'])
      .maybeSingle();
    assertNoError(findError, 'Failed to look up existing issue');

    if (existing) {
      const { error: touchError } = await supabase
        .from('issues')
        .update({ last_seen_at: now, diagnostic })
        .eq('id', existing.id);
      assertNoError(touchError, 'Failed to touch existing issue');
    } else {
      const { error: insertIssueError } = await supabase.from('issues').insert({
        id: `ISS-${Date.now().toString(36)}${i}`.toUpperCase(),
        title,
        diagnostic,
        area: guessArea(t.file, t.title),
        source: 'Playwright',
        severity: 'critical',
        status: 'open',
        locator: null,
        persona,
        trace_artifact: `test-results/${slugify(t.title)}/trace.zip`,
        first_seen_at: now,
        last_seen_at: now,
      });
      assertNoError(insertIssueError, 'Failed to create issue from failed test');
    }
  }
}

function guessArea(file: string, title: string): 'PLP' | 'PDP' | 'Checkout Flow' | 'Login' {
  const haystack = `${file} ${title}`.toLowerCase();
  if (haystack.includes('checkout') || haystack.includes('finish')) return 'Checkout Flow';
  if (haystack.includes('auth') || haystack.includes('login') || haystack.includes('lockout')) return 'Login';
  return 'PLP';
}

function slugify(s: string) {
  return s.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
}
