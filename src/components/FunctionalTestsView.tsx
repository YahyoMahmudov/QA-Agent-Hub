import React, { useState } from 'react';
import { WATERFALL_STEPS } from '../data/mockData';
import { UserPersona } from '../types';

interface FunctionalTestsViewProps {
  onShowToast: (message: string, icon?: string) => void;
  onLogJiraIssue: () => void;
}

export const FunctionalTestsView: React.FC<FunctionalTestsViewProps> = ({
  onShowToast,
  onLogJiraIssue,
}) => {
  const [selectedSpec, setSelectedSpec] = useState('checkout-journey.spec.ts');
  const [activePersona, setActivePersona] = useState<UserPersona>('problem_user');
  const [expandedStep, setExpandedStep] = useState<string | null>('07');

  const matrixData = [
    {
      persona: 'standard_user',
      auth: 'PASSED (310ms)',
      cart: 'PASSED (220ms)',
      plp: 'PASSED (410ms)',
      checkout: 'PASSED (340ms)',
      order: 'PASSED (180ms)',
      overall: 'PASSED',
    },
    {
      persona: 'problem_user',
      auth: 'PASSED (290ms)',
      cart: 'PASSED (210ms)',
      plp: 'FAILED (Broken Assets)',
      checkout: 'FAILED (Step 07 Timeout)',
      order: 'BLOCKED',
      overall: 'FAILED',
    },
    {
      persona: 'performance_glitch_user',
      auth: 'PASSED (340ms)',
      cart: 'PASSED (280ms)',
      plp: 'FLAKY (3.8s TTFB)',
      checkout: 'PASSED (3.9s)',
      order: 'PASSED (1.2s)',
      overall: 'FLAKY',
    },
    {
      persona: 'error_user',
      auth: 'PASSED (280ms)',
      cart: 'PASSED (230ms)',
      plp: 'PASSED (390ms)',
      checkout: 'PASSED (310ms)',
      order: 'FAILED (HTTP 404)',
      overall: 'FAILED',
    },
    {
      persona: 'visual_user',
      auth: 'PASSED (260ms)',
      cart: 'DIFF (1px Cart Shift)',
      plp: 'PASSED (380ms)',
      checkout: 'PASSED (320ms)',
      order: 'PASSED (190ms)',
      overall: 'PASSED',
    },
    {
      persona: 'locked_out_user',
      auth: 'FAILED (403 Expected)',
      cart: 'BLOCKED',
      plp: 'BLOCKED',
      checkout: 'BLOCKED',
      order: 'BLOCKED',
      overall: 'PASSED',
    },
  ];

  const handleCopyCommand = () => {
    const cmd = 'npx playwright test tests/e2e/checkout-journey.spec.ts --project=chromium --debug';
    navigator.clipboard.writeText(cmd);
    onShowToast('Copied Playwright CLI command to clipboard', 'terminal');
  };

  const handleDownloadTrace = () => {
    onShowToast('Packaging trace_run_8941.zip (14.2 MB) for download...', 'download');
    setTimeout(() => {
      onShowToast('Playwright trace archive ready', 'check_circle');
    }, 1000);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Breadcrumb & Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-code-sm text-[#908fa0] mb-1">
            <span>QA Automation Hub</span>
            <span>/</span>
            <span>Test Automation Suite</span>
            <span>/</span>
            <span className="text-[#8083ff]">Execution Waterfall</span>
          </div>
          <h1 className="font-headline-xl text-2xl sm:text-3xl font-bold text-[#d3e4fe]">
            Playwright Test Suite • Execution Waterfall
          </h1>
          <p className="font-body-md text-sm text-[#c7c4d7] mt-1">
            Worker #3 (PID 4914) running <code className="text-[#c0c1ff] font-mono">e2e/checkout-journey.spec.ts</code> against Chromium 124 Headless.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCommand}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#4cd7f6] border border-[#26364a] text-xs font-code-sm transition-all"
            title="Copy command line trigger"
          >
            <span className="material-symbols-outlined text-sm">content_copy</span>
            <span>Copy CLI Command</span>
          </button>
        </div>
      </div>

      {/* Control / Filter Bar */}
      <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Spec picker tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'checkout-journey.spec.ts', label: 'checkout-journey.spec.ts' },
            { id: 'plp-asset-integrity.spec.ts', label: 'plp-asset-integrity.spec.ts' },
            { id: 'inventory-load-sla.spec.ts', label: 'inventory-load-sla.spec.ts' },
            { id: 'cookie-session-isolation.spec.ts', label: 'cookie-session-isolation.spec.ts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSpec(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                selectedSpec === tab.id
                  ? 'bg-[#8083ff] text-[#0d0096] font-bold shadow-sm'
                  : 'bg-[#031427] text-[#c7c4d7] hover:text-white border border-[#1b2b3f]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#031427] border border-[#1b2b3f] text-xs font-mono">
            <span className="text-[#908fa0]">Persona:</span>
            <span className="text-[#ffb4ab] font-bold">{activePersona}</span>
          </div>
          <span className="px-2.5 py-1 rounded bg-[#93000a] text-[#ffdad6] font-mono text-xs font-bold uppercase border border-[#ffb4ab]/30">
            FAILED AT STEP 07
          </span>
        </div>
      </div>

      {/* 2-Column Waterfall & Visual DOM Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Execution Waterfall Steps */}
        <div className="lg:col-span-7 bg-[#0b1c30] border border-[#1b2b3f] rounded-xl p-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#1b2b3f]">
            <div>
              <h2 className="font-headline-md text-base font-bold text-[#d3e4fe]">
                Execution Step Waterfall (Steps 01 - 09)
              </h2>
              <p className="font-code-sm text-xs text-[#908fa0]">
                Chronological sequence recorded by Playwright Tracing Agent
              </p>
            </div>
            <span className="font-code-sm text-xs text-[#ffb4ab]">Total Elapsed: 6.42s</span>
          </div>

          <div className="mt-4 space-y-2.5">
            {WATERFALL_STEPS.map((step) => {
              const isFailed = step.status === 'failed';
              const isSkipped = step.status === 'skipped';
              const isExpanded = expandedStep === step.stepNumber;

              return (
                <div
                  key={step.stepNumber}
                  className={`rounded-lg border transition-all ${
                    isFailed
                      ? 'bg-[#93000a]/15 border-[#93000a]'
                      : isSkipped
                      ? 'bg-[#031427]/40 border-[#1b2b3f]/50 opacity-60'
                      : 'bg-[#031427] border-[#1b2b3f] hover:border-[#26364a]'
                  }`}
                >
                  <div
                    onClick={() =>
                      setExpandedStep(isExpanded ? null : step.stepNumber)
                    }
                    className="p-3 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                          isFailed
                            ? 'bg-[#93000a] text-[#ffdad6]'
                            : isSkipped
                            ? 'bg-[#1b2b3f] text-[#908fa0]'
                            : 'bg-[#00a572]/20 text-[#4edea3]'
                        }`}
                      >
                        {step.stepNumber}
                      </span>
                      <span
                        className={`font-mono text-[11px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                          step.action === 'FAILED ACTION'
                            ? 'bg-[#93000a] text-[#ffdad6]'
                            : 'bg-[#102034] text-[#4cd7f6]'
                        }`}
                      >
                        {step.action}
                      </span>
                      <code className="text-xs font-mono text-[#d3e4fe] truncate">
                        {step.code}
                      </code>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="font-mono text-[11px] text-[#908fa0]">
                        {step.duration}
                      </span>
                      {step.screenshot && (
                        <span
                          className="material-symbols-outlined text-[#4cd7f6] text-sm"
                          title="DOM snapshot recorded"
                        >
                          photo_camera
                        </span>
                      )}
                      <span className="material-symbols-outlined text-[#908fa0] text-sm">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </div>
                  </div>

                  {/* Expandable Step details */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-[#1b2b3f]/60 font-mono text-xs">
                      {isFailed && step.errorLog ? (
                        <div className="p-3 rounded bg-[#000f21] border border-[#93000a]/40 text-[#ffdad6] space-y-1 overflow-x-auto whitespace-pre-wrap">
                          {step.errorLog}
                        </div>
                      ) : (
                        <div className="text-[#908fa0] text-[11px] py-1">
                          Step executed cleanly on worker thread #3. Evaluated selector resolved within {step.duration}.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Visual DOM Snapshot at Failure */}
        <div className="lg:col-span-5 bg-[#0b1c30] border border-[#1b2b3f] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2b3f]">
              <div>
                <h2 className="font-headline-md text-base font-bold text-[#d3e4fe]">
                  DOM Snapshot at Failure (Step 07)
                </h2>
                <p className="font-code-sm text-xs text-[#908fa0]">
                  Target: <code className="text-[#ffb4ab]">#last-name</code> on /checkout-step-one.html
                </p>
              </div>
              <span className="material-symbols-outlined text-[#ffb4ab] text-xl">
                bug_report
              </span>
            </div>

            {/* Viewport Frame */}
            <div className="mt-4 rounded-lg overflow-hidden border border-[#26364a] bg-[#000f21] relative group">
              <div className="px-3 py-1.5 bg-[#102034] border-b border-[#26364a] flex items-center justify-between text-[11px] font-mono text-[#908fa0]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span>
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
                  <span className="ml-2 text-[#d3e4fe]">SauceDemo - Checkout: Your Information</span>
                </div>
                <span>1920 x 1080</span>
              </div>

              <div className="relative">
                <img
                  alt="Checkout failure DOM snapshot"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4MVkefb7lALO_fpBospcm8y5BrzT4Mt2wla_hj5ihJAT3hTjTxXxA4vmU-KseN26gAgsr-IfNoJxcD8O2p4WcMmlUWZnkijsnTec3yue-ohJaHjIwAFHEbJ6-8Bs2BYPUYhOcrwDO45cCbxus4AR8o29heEQhS_T-AwaNXYaanuAj8jCwnR6_5cLcn7YSc7NBllHl_7l69_UIKlbrX75u8Z3MjaAkE4B3SxSa4A8MZA9h_xDzbC60wQ"
                  className="w-full h-auto object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Visual locator highlight callout */}
                <div className="absolute top-[48%] left-[28%] border-2 border-[#ffb4ab] bg-[#93000a]/50 text-[#ffdad6] text-[10px] font-mono px-2 py-0.5 rounded shadow-lg animate-pulse">
                  Target: #last-name (Input Locked)
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs font-code-sm">
              <div className="flex items-center justify-between p-2 rounded bg-[#031427] border border-[#1b2b3f]">
                <span className="text-[#908fa0]">Failing Selector</span>
                <span className="font-mono text-[#ffb4ab] font-bold">input#last-name</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#031427] border border-[#1b2b3f]">
                <span className="text-[#908fa0]">Page Route</span>
                <span className="font-mono text-[#d3e4fe]">/checkout-step-one.html</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#031427] border border-[#1b2b3f]">
                <span className="text-[#908fa0]">Playwright Action</span>
                <span className="font-mono text-[#c0c1ff]">page.fill("#last-name", "Tester")</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-5 pt-4 border-t border-[#1b2b3f] flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={handleDownloadTrace}
              className="w-full sm:w-1/2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#c0c1ff] border border-[#26364a] text-xs font-bold transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Download trace.zip</span>
            </button>

            <button
              onClick={onLogJiraIssue}
              className="w-full sm:w-1/2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#8083ff] hover:bg-[#c0c1ff] text-[#0d0096] text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-sm">post_add</span>
              <span>Log Jira Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Persona Suite Matrix Execution */}
      <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-xl p-5">
        <div className="flex items-center justify-between pb-4 border-b border-[#1b2b3f]">
          <div>
            <h2 className="font-headline-md text-base font-bold text-[#d3e4fe]">
              SauceDemo Persona Suite Matrix Execution
            </h2>
            <p className="font-code-sm text-xs text-[#908fa0]">
              Automated end-to-end regression validation for all SauceDemo user accounts
            </p>
          </div>
          <span className="font-label-badge text-xs px-2 py-0.5 rounded bg-[#102034] text-[#4edea3]">
            6/6 Matrix Tested
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse font-code-sm text-xs">
            <thead>
              <tr className="border-b border-[#1b2b3f] text-[11px] text-[#908fa0] uppercase tracking-wider">
                <th className="pb-3 font-semibold">User Persona</th>
                <th className="pb-3 font-semibold">Login & Session</th>
                <th className="pb-3 font-semibold">Cart Add & Badge</th>
                <th className="pb-3 font-semibold">PLP Integrity</th>
                <th className="pb-3 font-semibold">Checkout Form</th>
                <th className="pb-3 font-semibold">Order Completion</th>
                <th className="pb-3 font-semibold text-right">Suite Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2b3f]/60 font-mono">
              {matrixData.map((row) => (
                <tr
                  key={row.persona}
                  onClick={() => {
                    setActivePersona(row.persona as UserPersona);
                    onShowToast(`Switched trace view to ${row.persona}`);
                  }}
                  className="hover:bg-[#102034]/60 transition-colors cursor-pointer"
                >
                  <td className="py-3 font-bold text-[#d3e4fe]">
                    {row.persona}
                  </td>
                  <td className="py-3 text-[#4edea3]">{row.auth}</td>
                  <td className="py-3 text-[#4edea3]">{row.cart}</td>
                  <td className="py-3">
                    <span
                      className={
                        row.plp.includes('FAILED')
                          ? 'text-[#ffb4ab] font-bold'
                          : row.plp.includes('FLAKY')
                          ? 'text-amber-300'
                          : 'text-[#4edea3]'
                      }
                    >
                      {row.plp}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={
                        row.checkout.includes('FAILED')
                          ? 'text-[#ffb4ab] font-bold'
                          : 'text-[#4edea3]'
                      }
                    >
                      {row.checkout}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={
                        row.order.includes('FAILED')
                          ? 'text-[#ffb4ab] font-bold'
                          : row.order.includes('BLOCKED')
                          ? 'text-[#908fa0]'
                          : 'text-[#4edea3]'
                      }
                    >
                      {row.order}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        row.overall === 'PASSED'
                          ? 'bg-[#00a572]/20 text-[#4edea3]'
                          : row.overall === 'FAILED'
                          ? 'bg-[#93000a] text-[#ffdad6]'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {row.overall}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
