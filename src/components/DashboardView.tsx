import React, { useState } from 'react';
import { NavigationTab, TestRunItem } from '../types';
import { RECENT_RUNS } from '../data/mockData';

interface DashboardViewProps {
  onNavigateTab: (tab: NavigationTab) => void;
  onTriggerAudit: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onTriggerAudit,
  onShowToast,
}) => {
  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | '30d'>('24h');
  const [selectedRun, setSelectedRun] = useState<TestRunItem | null>(null);

  const personas = [
    {
      name: 'standard_user',
      auth: 'Authenticated',
      authNote: 'Valid session',
      plp: '200 OK',
      plpNote: 'Clean DOM',
      plpStatus: 'pass',
      checkout: 'Complete',
      checkoutNote: 'Step 08 Pass',
      checkoutStatus: 'pass',
      ttfb: '240ms',
      ttfbStatus: 'good',
    },
    {
      name: 'problem_user',
      auth: 'Authenticated',
      authNote: 'Valid session',
      plp: '404 Error',
      plpNote: 'Broken Assets',
      plpStatus: 'error',
      checkout: 'Blocked',
      checkoutNote: 'Last Name Locked',
      checkoutStatus: 'error',
      ttfb: '310ms',
      ttfbStatus: 'good',
    },
    {
      name: 'performance_glitch_user',
      auth: 'Authenticated',
      authNote: 'Valid session',
      plp: '200 OK',
      plpNote: 'Slow Load',
      plpStatus: 'warning',
      checkout: 'Complete',
      checkoutNote: 'SLA Warning',
      checkoutStatus: 'warning',
      ttfb: '3,820ms',
      ttfbStatus: 'breach',
    },
    {
      name: 'error_user',
      auth: 'Authenticated',
      authNote: 'Valid session',
      plp: '200 OK',
      plpNote: 'Clean DOM',
      plpStatus: 'pass',
      checkout: '404 Route',
      checkoutNote: 'Finish Action',
      checkoutStatus: 'error',
      ttfb: '280ms',
      ttfbStatus: 'good',
    },
    {
      name: 'visual_user',
      auth: 'Authenticated',
      authNote: 'Valid session',
      plp: 'Shift Diff',
      plpNote: 'Cart Badge 1px',
      plpStatus: 'warning',
      checkout: 'Complete',
      checkoutNote: 'Step 08 Pass',
      checkoutStatus: 'pass',
      ttfb: '260ms',
      ttfbStatus: 'good',
    },
    {
      name: 'locked_out_user',
      auth: 'Rejected',
      authNote: '403 Forbidden',
      authStatus: 'warning',
      plp: 'N/A',
      plpNote: 'Access Denied',
      plpStatus: 'neutral',
      checkout: 'N/A',
      checkoutNote: 'Blocked',
      checkoutStatus: 'neutral',
      ttfb: '190ms',
      ttfbStatus: 'good',
    },
  ];

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Banner: Breadcrumbs + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-code-sm text-[#908fa0] mb-1">
            <span>QA Automation Hub</span>
            <span>/</span>
            <span>CI/CD Test Pipeline</span>
            <span>/</span>
            <span className="text-[#c0c1ff]">Suite Run #8941</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-headline-xl text-2xl sm:text-3xl font-bold text-[#d3e4fe]">
              SauceDemo Telemetry Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00a572]/20 border border-[#00a572]/40 text-[#4edea3] font-label-badge text-xs">
              <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
              LIVE AUDIT ACTIVE
            </span>
          </div>
        </div>

        {/* Time filters & Instant Audit button */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-[#0b1c30] p-1 rounded-lg border border-[#26364a]">
            {(['24h', '7d', '30d'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-3 py-1 text-xs font-code-sm rounded-md transition-all ${
                  timeFilter === t
                    ? 'bg-[#8083ff] text-[#0d0096] font-bold shadow-sm'
                    : 'text-[#c7c4d7] hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={onTriggerAudit}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#c0c1ff] border border-[#26364a] text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-base text-[#4cd7f6]">refresh</span>
            <span>Trigger Instant Audit</span>
          </button>
        </div>
      </div>

      {/* 4 Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pass Rate */}
        <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#464554] transition-all">
          <div>
            <div className="flex items-center justify-between text-xs font-code-sm text-[#908fa0] uppercase tracking-wider mb-2">
              <span>Overall Pass Rate</span>
              <span className="text-[#ffb4ab] font-mono font-bold">-3.2%</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-3xl sm:text-4xl font-bold text-[#d3e4fe]">
                78.4%
              </span>
              <span className="text-xs text-[#908fa0]">across 92 specs</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-[#1b2b3f] h-2 rounded-full overflow-hidden flex">
              <div className="bg-[#4edea3] h-full" style={{ width: '78.4%' }} title="78.4% Passed"></div>
              <div className="bg-[#acedff] h-full" style={{ width: '6.5%' }} title="6.5% Flaky"></div>
              <div className="bg-[#ffb4ab] h-full" style={{ width: '15.1%' }} title="15.1% Failed"></div>
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px] font-code-sm text-[#908fa0]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span> 72 Passed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#acedff]"></span> 6 Flaky
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span> 14 Failed
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Defects Logged */}
        <div
          onClick={() => onNavigateTab('defect-issues')}
          className="bg-[#0b1c30] border border-[#1b2b3f] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#8083ff]/50 transition-all cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-code-sm text-[#908fa0] uppercase tracking-wider mb-2">
              <span>Defects Logged</span>
              <span className="text-[#4edea3] font-mono font-bold">+12 new</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-3xl sm:text-4xl font-bold text-[#ffb4ab] group-hover:text-white transition-colors">
                46 Active
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1b2b3f] flex items-center justify-between text-xs font-code-sm">
            <span className="text-[#ffb4ab] font-semibold">14 Critical</span>
            <span className="text-amber-300 font-semibold">22 High</span>
            <span className="text-[#4cd7f6] font-semibold">10 Minor</span>
          </div>
        </div>

        {/* Card 3: Persona Coverage */}
        <div
          onClick={() => onNavigateTab('functional-tests')}
          className="bg-[#0b1c30] border border-[#1b2b3f] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#4cd7f6]/50 transition-all cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-code-sm text-[#908fa0] uppercase tracking-wider mb-2">
              <span>Persona Coverage</span>
              <span className="text-[#4edea3] font-mono font-bold">100% Matrix</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-3xl sm:text-4xl font-bold text-[#4cd7f6] group-hover:text-white transition-colors">
                6 / 6
              </span>
              <span className="text-xs text-[#908fa0]">Profiles</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1b2b3f] flex items-center gap-1.5 text-xs font-code-sm text-[#ffb4ab]">
            <span className="material-symbols-outlined text-sm">warning</span>
            <span>2 Profiles Flagged with Fatal Errors</span>
          </div>
        </div>

        {/* Card 4: Asset 404 Detections */}
        <div
          onClick={() => onNavigateTab('content-scraper')}
          className="bg-[#0b1c30] border border-[#1b2b3f] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#ffb4ab]/50 transition-all cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-code-sm text-[#908fa0] uppercase tracking-wider mb-2">
              <span>Asset 404 Detections</span>
              <span className="text-[#4cd7f6] font-mono font-bold">Scraper DOM</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-3xl sm:text-4xl font-bold text-[#ffdad6] group-hover:text-white transition-colors">
                4 Broken
              </span>
              <span className="text-xs text-[#908fa0]">Images</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1b2b3f] flex items-center gap-1.5 text-xs font-code-sm text-[#4edea3]">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>100% Repro on problem_user</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Persona Health Matrix & Defect Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: SauceDemo Persona Execution Health Matrix */}
        <div className="lg:col-span-2 bg-[#0b1c30] border border-[#1b2b3f] rounded-xl p-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#1b2b3f]">
            <div>
              <h2 className="font-headline-md text-base font-bold text-[#d3e4fe]">
                SauceDemo Persona Execution Health Matrix
              </h2>
              <p className="font-code-sm text-xs text-[#908fa0]">
                Playwright automated test runs across all standard customer behavioral states
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('functional-tests')}
              className="text-xs text-[#c0c1ff] hover:text-white font-code-sm flex items-center gap-1"
            >
              <span>Inspect Suite</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1b2b3f] text-[11px] font-code-sm text-[#908fa0] uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Persona Profile</th>
                  <th className="pb-3 font-semibold">Auth State</th>
                  <th className="pb-3 font-semibold">PLP Visuals</th>
                  <th className="pb-3 font-semibold">Checkout Flow</th>
                  <th className="pb-3 font-semibold text-right">Avg TTFB</th>
                  <th className="pb-3 font-semibold text-right">Trace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b2b3f]/60 text-xs font-body-sm">
                {personas.map((p) => (
                  <tr key={p.name} className="hover:bg-[#102034]/50 transition-colors">
                    <td className="py-3 font-mono font-medium text-[#d3e4fe]">
                      {p.name}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.authStatus === 'warning' ? 'bg-amber-400' : 'bg-[#4edea3]'
                          }`}
                        ></span>
                        <span className="text-[#c7c4d7]">{p.auth}</span>
                      </div>
                      <span className="text-[10px] text-[#908fa0] font-mono">{p.authNote}</span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          p.plpStatus === 'pass'
                            ? 'bg-[#00a572]/20 text-[#4edea3]'
                            : p.plpStatus === 'error'
                            ? 'bg-[#93000a]/30 text-[#ffb4ab]'
                            : p.plpStatus === 'warning'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-[#1b2b3f] text-[#908fa0]'
                        }`}
                      >
                        {p.plp}
                      </span>
                      <div className="text-[10px] text-[#908fa0] mt-0.5 font-mono">{p.plpNote}</div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          p.checkoutStatus === 'pass'
                            ? 'bg-[#00a572]/20 text-[#4edea3]'
                            : p.checkoutStatus === 'error'
                            ? 'bg-[#93000a]/30 text-[#ffb4ab]'
                            : p.checkoutStatus === 'warning'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-[#1b2b3f] text-[#908fa0]'
                        }`}
                      >
                        {p.checkout}
                      </span>
                      <div className="text-[10px] text-[#908fa0] mt-0.5 font-mono">{p.checkoutNote}</div>
                    </td>
                    <td className="py-3 text-right font-mono">
                      <span
                        className={
                          p.ttfbStatus === 'breach'
                            ? 'text-[#ffb4ab] font-bold bg-[#93000a]/30 px-1.5 py-0.5 rounded'
                            : 'text-[#c7c4d7]'
                        }
                      >
                        {p.ttfb}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          onNavigateTab('functional-tests');
                          onShowToast(`Loaded Playwright trace for ${p.name}`);
                        }}
                        className="p-1 rounded hover:bg-[#1b2b3f] text-[#c0c1ff] hover:text-white"
                        title={`Inspect ${p.name}`}
                      >
                        <span className="material-symbols-outlined text-base">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Defect Distribution Chart & Quick Stats */}
        <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2b3f]">
              <h2 className="font-headline-md text-base font-bold text-[#d3e4fe]">
                Defect Distribution
              </h2>
              <span className="font-code-sm text-[11px] text-[#4cd7f6]">46 Total Issues</span>
            </div>

            {/* Donut Chart Visualization */}
            <div className="relative flex items-center justify-center my-6">
              <svg viewBox="0 0 160 160" className="w-40 h-40 transform -rotate-90">
                {/* Background circle */}
                <circle cx="80" cy="80" r="60" fill="transparent" stroke="#1b2b3f" strokeWidth="20" />
                {/* Red: Checkout Flow 42% (Circumference ~ 376.99) */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke="#ffb4ab"
                  strokeWidth="20"
                  strokeDasharray="158 377"
                  strokeDashoffset="0"
                />
                {/* Cyan: PLP Images 35% */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke="#4cd7f6"
                  strokeWidth="20"
                  strokeDasharray="132 377"
                  strokeDashoffset="-158"
                />
                {/* Purple: Form Validation 15% */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke="#8083ff"
                  strokeWidth="20"
                  strokeDasharray="56 377"
                  strokeDashoffset="-290"
                />
                {/* Green: Auth 8% */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke="#4edea3"
                  strokeWidth="20"
                  strokeDasharray="30 377"
                  strokeDashoffset="-346"
                />
              </svg>
              <div className="absolute text-center">
                <span className="font-headline-xl text-2xl font-bold text-white block">46</span>
                <span className="text-[10px] font-code-sm text-[#908fa0] uppercase tracking-wider block">
                  Defects
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs font-code-sm">
              <div className="flex items-center justify-between p-1.5 rounded hover:bg-[#102034] transition-colors">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab]"></span>
                  <span className="text-[#d3e4fe]">Checkout Flow</span>
                </span>
                <span className="font-bold text-[#ffb4ab]">42% (19)</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded hover:bg-[#102034] transition-colors">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4cd7f6]"></span>
                  <span className="text-[#d3e4fe]">PLP Asset 404s</span>
                </span>
                <span className="font-bold text-[#4cd7f6]">35% (16)</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded hover:bg-[#102034] transition-colors">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8083ff]"></span>
                  <span className="text-[#d3e4fe]">Form Inputs</span>
                </span>
                <span className="font-bold text-[#8083ff]">15% (7)</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded hover:bg-[#102034] transition-colors">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]"></span>
                  <span className="text-[#d3e4fe]">Auth Guard</span>
                </span>
                <span className="font-bold text-[#4edea3]">8% (4)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('defect-issues')}
            className="w-full mt-4 py-2 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#c0c1ff] border border-[#26364a] text-xs font-semibold text-center transition-all"
          >
            Manage Defect Triage Queue →
          </button>
        </div>
      </div>

      {/* Bottom Section: Recent Playwright Test Executions */}
      <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-xl p-5">
        <div className="flex items-center justify-between pb-4 border-b border-[#1b2b3f]">
          <div>
            <h2 className="font-headline-md text-base font-bold text-[#d3e4fe]">
              Recent Playwright Test Executions
            </h2>
            <p className="font-code-sm text-xs text-[#908fa0]">
              Automated worker threads running against Chromium 124 Headless
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('functional-tests')}
            className="px-3 py-1.5 rounded-lg bg-[#8083ff] text-[#0d0096] text-xs font-bold hover:bg-[#c0c1ff] transition-all"
          >
            Open Execution Waterfall
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1b2b3f] text-[11px] font-code-sm text-[#908fa0] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Specification</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Worker / Thread</th>
                <th className="pb-3 font-semibold">Duration</th>
                <th className="pb-3 font-semibold">Diagnostic / Notes</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2b3f]/60 text-xs font-body-sm">
              {RECENT_RUNS.map((run) => (
                <tr key={run.id} className="hover:bg-[#102034]/50 transition-colors">
                  <td className="py-3 font-mono font-medium text-[#c0c1ff]">
                    {run.spec}
                    <div className="text-[10px] text-[#908fa0]">{run.details}</div>
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        run.status === 'PASSED'
                          ? 'bg-[#00a572]/20 text-[#4edea3]'
                          : run.status === 'FAILED'
                          ? 'bg-[#93000a]/30 text-[#ffb4ab]'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {run.status}
                    </span>
                    <div className="text-[10px] text-[#908fa0] mt-0.5">{run.timeAgo}</div>
                  </td>
                  <td className="py-3 font-mono text-[#c7c4d7] text-xs">
                    {run.worker}
                  </td>
                  <td className="py-3 font-mono text-[#d3e4fe]">
                    {run.duration}
                  </td>
                  <td className="py-3 text-[#c7c4d7] max-w-xs truncate">
                    {run.notes}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedRun(run);
                      }}
                      className="px-2.5 py-1 rounded bg-[#102034] hover:bg-[#1b2b3f] text-[#4cd7f6] text-[11px] font-mono border border-[#26364a] transition-all"
                    >
                      {run.actionType === 'trace'
                        ? 'View Trace'
                        : run.actionType === 'diff'
                        ? 'Inspect Diff'
                        : 'Waterfall'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trace Details Modal */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000f21]/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#0b1c30] border border-[#26364a] rounded-xl shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2b3f]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4cd7f6]">manage_search</span>
                <h3 className="font-headline-md text-base font-bold text-[#d3e4fe]">
                  {selectedRun.spec}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRun(null)}
                className="p-1 text-[#908fa0] hover:text-white"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <div className="mt-4 space-y-3 font-code-sm text-xs">
              <div className="flex items-center justify-between p-2.5 rounded bg-[#031427] border border-[#1b2b3f]">
                <span className="text-[#908fa0]">Status</span>
                <span className="font-bold text-[#4edea3]">{selectedRun.status}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-[#031427] border border-[#1b2b3f]">
                <span className="text-[#908fa0]">Duration</span>
                <span className="font-mono text-[#d3e4fe]">{selectedRun.duration}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-[#031427] border border-[#1b2b3f]">
                <span className="text-[#908fa0]">Assigned Worker</span>
                <span className="font-mono text-[#c0c1ff]">{selectedRun.worker}</span>
              </div>
              <div className="p-3 rounded bg-[#031427] border border-[#1b2b3f]">
                <span className="text-[#908fa0] block mb-1">Diagnostic Log</span>
                <p className="font-mono text-[#c7c4d7] leading-relaxed">{selectedRun.notes}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedRun(null);
                  onNavigateTab('functional-tests');
                }}
                className="px-4 py-1.5 rounded bg-[#8083ff] text-[#0d0096] text-xs font-bold hover:bg-[#c0c1ff]"
              >
                Inspect in Playwright Waterfall →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
