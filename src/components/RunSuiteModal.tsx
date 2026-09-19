import React, { useState, useEffect } from 'react';

interface RunSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunComplete: (newRecords: number) => void;
}

export const RunSuiteModal: React.FC<RunSuiteModalProps> = ({
  isOpen,
  onClose,
  onRunComplete,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentWorker, setCurrentWorker] = useState('Worker #1 (PID 4912)');
  const [currentTest, setCurrentTest] = useState('auth.spec.ts:12 > [standard_user] session check');
  const [logs, setLogs] = useState<string[]>([]);
  const [passedCount, setPassedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      startRun();
    } else {
      setIsRunning(false);
      setProgress(0);
      setLogs([]);
    }
  }, [isOpen]);

  const startRun = () => {
    setIsRunning(true);
    setProgress(5);
    setPassedCount(0);
    setFailedCount(0);
    setLogs([
      '[CLUSTER] Spawning 4 Chromium Headless worker threads (Playwright v1.43)...',
      '[SQLITE WAL] Initialized transaction checkpoint on local_qa_vault.db',
      '[BROWSER] Navigating to https://www.saucedemo.com with viewport 1920x1080',
    ]);

    const steps = [
      { p: 20, test: 'auth.spec.ts:08 > [standard_user] verify authentication cookies', log: '[PASS] auth.spec.ts verified cookies (312ms)', pass: true },
      { p: 40, test: 'cart.spec.ts:15 > [standard_user] multi-item add & cart badge', log: '[PASS] cart.spec.ts 3 items incremented counter (240ms)', pass: true },
      { p: 60, test: 'checkout.spec.ts:34 > [problem_user] complete checkout', log: '[FAIL] checkout.spec.ts:34 TimeoutError: locator("#last-name").fill() exceeded 5000ms', pass: false },
      { p: 80, test: 'edge_cases.spec.ts:22 > [locked_out_user] verify 403 sadface banner', log: '[PASS] edge_cases.spec.ts Sadface banner validated (180ms)', pass: true },
      { p: 100, test: 'audit.spec.ts:90 > [asset_scanner] inventory image hash diff', log: '[SUMMARY] Suite finished: 3 Passed, 1 Failed. Synced +18 audit rows to local.db', pass: true }
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < steps.length) {
        const step = steps[currentIdx];
        setProgress(step.p);
        setCurrentTest(step.test);
        setLogs((prev) => [...prev, step.log]);
        if (step.pass) {
          setPassedCount((c) => c + 1);
        } else {
          setFailedCount((c) => c + 1);
        }
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
        onRunComplete(18);
      }
    }, 900);

    return () => clearInterval(interval);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000f21]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0b1c30] border border-[#26364a] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-[#102034] border-b border-[#26364a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#8083ff]/20 text-[#8083ff] flex items-center justify-center">
              <span className={`material-symbols-outlined text-lg ${isRunning ? 'animate-spin' : ''}`}>
                {isRunning ? 'sync' : 'terminal'}
              </span>
            </div>
            <div>
              <h3 className="font-headline-md text-base font-bold text-[#d3e4fe]">
                Playwright Full Suite Runner
              </h3>
              <p className="font-code-sm text-xs text-[#908fa0]">
                Chromium 124 Headless • 4 Workers Parallel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#26364a] text-[#c7c4d7] hover:text-white"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Progress Bar & Status */}
        <div className="p-5 border-b border-[#1b2b3f] bg-[#031427]/60">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[#c7c4d7] font-code-sm flex items-center gap-1.5 truncate max-w-sm">
              <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
              {currentTest}
            </span>
            <span className="font-mono font-bold text-[#4cd7f6]">{progress}%</span>
          </div>

          <div className="w-full bg-[#1b2b3f] h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#4cd7f6] via-[#8083ff] to-[#4edea3] transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between mt-3 text-xs font-code-sm">
            <div className="flex items-center gap-3">
              <span className="text-[#4edea3] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
                {passedCount} Passed
              </span>
              <span className="text-[#ffb4ab] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]"></span>
                {failedCount} Failed
              </span>
            </div>
            <span className="text-[#908fa0]">{currentWorker}</span>
          </div>
        </div>

        {/* Console Log Stream */}
        <div className="p-4 bg-[#000f21] font-code-sm text-xs text-[#c7c4d7] max-h-60 overflow-y-auto space-y-1 font-mono">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`leading-relaxed ${
                log.includes('[FAIL]')
                  ? 'text-[#ffb4ab] bg-[#93000a]/20 px-2 py-0.5 rounded'
                  : log.includes('[PASS]')
                  ? 'text-[#4edea3]'
                  : log.includes('[SUMMARY]')
                  ? 'text-[#4cd7f6] font-bold'
                  : 'text-[#908fa0]'
              }`}
            >
              {log}
            </div>
          ))}
          {isRunning && (
            <div className="flex items-center gap-2 text-[#4cd7f6] animate-pulse">
              <span>› Executing worker step...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#102034] border-t border-[#26364a] flex items-center justify-between">
          <span className="text-xs font-code-sm text-[#908fa0]">
            Database: <code className="text-[#4cd7f6]">local_qa_vault.db</code> (Realtime WAL)
          </span>
          <div className="flex items-center gap-2">
            {isRunning ? (
              <button
                onClick={() => setIsRunning(false)}
                className="px-3 py-1.5 rounded bg-[#93000a] text-[#ffdad6] text-xs font-semibold hover:bg-red-800"
              >
                Abort Suite
              </button>
            ) : (
              <button
                onClick={startRun}
                className="px-3 py-1.5 rounded bg-[#1b2b3f] hover:bg-[#26364a] text-[#d3e4fe] text-xs font-semibold"
              >
                Rerun Suite
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-[#8083ff] text-[#0d0096] text-xs font-bold hover:bg-[#c0c1ff]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
