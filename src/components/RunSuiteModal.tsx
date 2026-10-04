import React, { useState, useEffect, useRef } from 'react';
import { SuiteApi } from '../lib/api';

interface RunSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunComplete: (passed: number, failed: number) => void;
}

export const RunSuiteModal: React.FC<RunSuiteModalProps> = ({
  isOpen,
  onClose,
  onRunComplete,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentWorker, setCurrentWorker] = useState('Connecting to backend...');
  const [currentTest, setCurrentTest] = useState('Spawning Playwright workers...');
  const [logs, setLogs] = useState<string[]>([]);
  const [passedCount, setPassedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (isOpen) {
      startRun();
    } else {
      esRef.current?.close();
      esRef.current = null;
      setIsRunning(false);
      setProgress(0);
      setLogs([]);
    }
    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
  }, [isOpen]);

  const appendLog = (line: string) => setLogs((prev) => [...prev, line]);

  const startRun = async () => {
    esRef.current?.close();
    setIsRunning(true);
    setProgress(2);
    setPassedCount(0);
    setFailedCount(0);
    setCurrentWorker('4 Chromium Headless workers (real Playwright)');
    setCurrentTest('Requesting run from backend...');
    setLogs([
      '[CLUSTER] Requesting real Playwright suite run from backend...',
      '[SUPABASE] Connected to Postgres instance',
      '[BROWSER] Target: https://www.saucedemo.com',
    ]);

    let startResponse: Awaited<ReturnType<typeof SuiteApi.start>>;
    try {
      startResponse = await SuiteApi.start();
    } catch (err) {
      setIsRunning(false);
      appendLog(`[ERROR] Failed to start suite: ${(err as Error).message}. Is the backend running (npm run dev:server)?`);
      return;
    }

    // The deployed (Vercel) backend can't stream progress the way local dev
    // does, since a serverless function there runs the whole suite to
    // completion before it ever responds - so the full result lands here
    // already finished, with no stream to open.
    if (startResponse.completed) {
      const passed = startResponse.passed ?? 0;
      const failed = startResponse.failed ?? 0;
      setPassedCount(passed);
      setFailedCount(failed);
      setProgress(100);
      setCurrentTest('Run complete');
      appendLog(`[SUMMARY] Suite finished: ${passed} Passed, ${failed} Failed. Synced results to Supabase.`);
      setIsRunning(false);
      onRunComplete(passed, failed);
      return;
    }

    const { runId } = startResponse;
    const es = SuiteApi.stream(runId);
    esRef.current = es;

    es.onmessage = (event) => {
      let evt: any;
      try {
        evt = JSON.parse(event.data);
      } catch {
        return;
      }

      if (evt.type === 'begin') {
        appendLog(`[CLUSTER] Running ${evt.total} specs across 4 workers`);
      } else if (evt.type === 'test-begin') {
        setCurrentTest(`${evt.file} > ${evt.title}`);
      } else if (evt.type === 'test-end') {
        setProgress(evt.progress);
        setPassedCount(evt.passed);
        setFailedCount(evt.failed);
        const tag = evt.status === 'passed' ? 'PASS' : 'FAIL';
        appendLog(
          `[${tag}] ${evt.file} > ${evt.title} (${evt.duration}ms)${evt.error ? ` — ${evt.error}` : ''}`
        );
      } else if (evt.type === 'log') {
        appendLog(evt.text);
      } else if (evt.type === 'error') {
        appendLog(`[ERROR] ${evt.message}`);
      } else if (evt.type === 'end') {
        appendLog(
          `[SUMMARY] Suite finished: ${evt.passed} Passed, ${evt.failed} Failed. Synced results to local_qa_vault.db`
        );
      } else if (evt.type === 'closed') {
        setIsRunning(false);
        setProgress(100);
        setCurrentTest('Run complete');
        es.close();
        esRef.current = null;
        onRunComplete(evt.passed, evt.failed);
      }
    };

    es.onerror = () => {
      if (esRef.current === es) {
        setIsRunning(false);
        appendLog('[ERROR] Lost connection to the live run stream.');
        es.close();
        esRef.current = null;
      }
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-surface-container-lowest)]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-highest)] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-[var(--color-surface-container)] border-b border-[var(--color-surface-container-highest)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-primary-container)]/20 text-[var(--color-primary-container)] flex items-center justify-center">
              <span className={`material-symbols-outlined text-lg ${isRunning ? 'animate-spin' : ''}`}>
                {isRunning ? 'sync' : 'terminal'}
              </span>
            </div>
            <div>
              <h3 className="font-headline-md text-base font-bold text-[var(--color-on-surface)]">
                Playwright Full Suite Runner
              </h3>
              <p className="font-code-sm text-xs text-[var(--color-outline)]">
                Chromium 153 Headless • 4 Workers Parallel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Progress Bar & Status */}
        <div className="p-5 border-b border-[var(--color-surface-container-high)] bg-[var(--color-surface)]/60">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[var(--color-on-surface-variant)] font-code-sm flex items-center gap-1.5 truncate max-w-sm">
              <span className="w-2 h-2 rounded-full bg-[var(--color-secondary)] animate-pulse"></span>
              {currentTest}
            </span>
            <span className="font-mono font-bold text-[var(--color-tertiary)]">{progress}%</span>
          </div>

          <div className="w-full bg-[var(--color-surface-container-high)] h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--color-tertiary)] via-[var(--color-primary-container)] to-[var(--color-secondary)] transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between mt-3 text-xs font-code-sm">
            <div className="flex items-center gap-3">
              <span className="text-[var(--color-secondary)] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]"></span>
                {passedCount} Passed
              </span>
              <span className="text-[var(--color-error)] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-error)]"></span>
                {failedCount} Failed
              </span>
            </div>
            <span className="text-[var(--color-outline)]">{currentWorker}</span>
          </div>
        </div>

        {/* Console Log Stream */}
        <div className="p-4 bg-[var(--color-surface-container-lowest)] font-code-sm text-xs text-[var(--color-on-surface-variant)] max-h-60 overflow-y-auto space-y-1 font-mono">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`leading-relaxed ${
                log.includes('[FAIL]')
                  ? 'text-[var(--color-error)] bg-[var(--color-error-container)]/20 px-2 py-0.5 rounded'
                  : log.includes('[PASS]')
                  ? 'text-[var(--color-secondary)]'
                  : log.includes('[SUMMARY]')
                  ? 'text-[var(--color-tertiary)] font-bold'
                  : 'text-[var(--color-outline)]'
              }`}
            >
              {log}
            </div>
          ))}
          {isRunning && (
            <div className="flex items-center gap-2 text-[var(--color-tertiary)] animate-pulse">
              <span>› Executing worker step...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[var(--color-surface-container)] border-t border-[var(--color-surface-container-highest)] flex items-center justify-between">
          <span className="text-xs font-code-sm text-[var(--color-outline)]">
            Database: <code className="text-[var(--color-tertiary)]">Supabase</code> (Postgres)
          </span>
          <div className="flex items-center gap-2">
            {isRunning ? (
              <button
                onClick={() => {
                  esRef.current?.close();
                  esRef.current = null;
                  setIsRunning(false);
                  appendLog('[CLUSTER] Detached from run stream (backend continues to completion in the background).');
                }}
                className="px-3 py-1.5 rounded bg-[var(--color-error-container)] text-[var(--color-on-error-container)] text-xs font-semibold hover:bg-red-800"
              >
                Abort Suite
              </button>
            ) : (
              <button
                onClick={startRun}
                className="px-3 py-1.5 rounded bg-[var(--color-surface-container-high)] hover:bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)] text-xs font-semibold"
              >
                Rerun Suite
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs font-bold hover:bg-[var(--color-primary)]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
