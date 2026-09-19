import React, { useState } from 'react';
import { InventoryInspectionItem, UserPersona } from '../types';
import { INVENTORY_ITEMS } from '../data/mockData';

interface ContentScraperViewProps {
  onShowToast: (message: string, icon?: string) => void;
  onNavigateToIssues: () => void;
}

export const ContentScraperView: React.FC<ContentScraperViewProps> = ({
  onShowToast,
  onNavigateToIssues,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<UserPersona>('problem_user');
  const [plpChecked, setPlpChecked] = useState(true);
  const [pdpChecked, setPdpChecked] = useState(true);
  const [hashChecked, setHashChecked] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);
  const [activeItemView, setActiveItemView] = useState<{ [sku: string]: 'plp' | 'pdp' }>({
    'SAUCE-BP-001': 'plp',
    'SAUCE-BL-002': 'plp',
    'SAUCE-TS-003': 'pdp',
    'SAUCE-FJ-004': 'plp',
    'SAUCE-ON-005': 'plp',
    'SAUCE-TAT-006': 'plp',
  });
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[09:12:04] [CRAWLER] Chromium 124 headless initialized with userAgent: "Playwright-Agent-SauceDemo/1.43"',
    '[09:12:05] [AUTH] Successfully authenticated session for persona: problem_user (session_id=ps_90412)',
    '[09:12:06] [DOM SCAN] Ingested 6 inventory cards from https://www.saucedemo.com/inventory.html',
    '[09:12:07] [ASSET 404] FAIL: GET /static/media/sl-404.16f35e69.jpg -> HTTP 404 Not Found (SKU: SAUCE-BP-001)',
    '[09:12:08] [HASH COLLISION] WARN: Item 0 (Bike Light) renders identical asset hash to Item 4 (Backpack)',
    '[09:12:09] [DEEP SCAN PDP] FAIL: Route /inventory-item.html?id=1 price parsed as "$0.00" (Expected >= $9.99)',
    '[09:12:10] [AUDIT SUMMARY] Scrape completed in 1.48s. 4 broken assets, 1 price glitch, 1 hash collision.',
  ]);

  const handleRunAudit = () => {
    setIsAuditing(true);
    onShowToast('Executing Playwright DOM asset scraper...');
    setTimeout(() => {
      setIsAuditing(false);
      setConsoleLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [RE-SCAN] Triggered manual sweep for ${selectedPersona}. DOM snapshot synced to SQLite.`,
      ]);
      onShowToast('Audit sweep complete: 4 image failures verified', 'check_circle');
    }, 1200);
  };

  const handleCopyJiraSnippet = (item: InventoryInspectionItem) => {
    navigator.clipboard.writeText(item.snippetText);
    onShowToast(`Copied Jira defect snippet for ${item.name}`, 'content_copy');
  };

  const handlePushAllToJira = () => {
    onShowToast('Pushed 4 defect issues to Jira queue (SAUCE-1039 through SAUCE-1042)', 'send');
    setTimeout(() => {
      onNavigateToIssues();
    }, 800);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-code-sm text-[var(--color-outline)] mb-1">
          <span>QA Automation Hub</span>
          <span>/</span>
          <span>Scraper Engine</span>
          <span>/</span>
          <span className="text-[var(--color-tertiary)]">DOM & Asset Integrity</span>
        </div>
        <h1 className="font-headline-xl text-2xl sm:text-3xl font-bold text-[var(--color-on-surface)]">
          SauceDemo Content & Asset Scraper
        </h1>
        <p className="font-body-md text-sm text-[var(--color-on-surface-variant)] mt-1">
          Automated Playwright crawler validating inventory text, imagery hashes, pricing accuracy, and broken HTTP assets.
        </p>
      </div>

      {/* Control Strip */}
      <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-xl p-4 sm:p-5 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        {/* Left: Persona Selector & URL */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-code-sm text-xs text-[var(--color-outline)] uppercase tracking-wider">
            Persona Profile:
          </span>
          <div className="flex flex-wrap items-center gap-1.5 bg-[var(--color-surface)] p-1 rounded-lg border border-[var(--color-surface-container-high)]">
            {(['standard_user', 'problem_user', 'visual_user', 'performance_glitch_user'] as UserPersona[]).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPersona(p)}
                  className={`px-3 py-1 rounded text-xs font-code-sm transition-all ${
                    selectedPersona === p
                      ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-bold shadow-sm'
                      : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-container-high)] text-xs font-code-sm text-[var(--color-secondary)]">
            <span className="text-[var(--color-outline)]">URL:</span>
            <span>https://www.saucedemo.com/inventory.html</span>
          </div>
        </div>

        {/* Right: Checkbox Scopes & CTA */}
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-between xl:justify-end">
          <div className="flex items-center gap-3 text-xs font-code-sm text-[var(--color-on-surface-variant)]">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={plpChecked}
                onChange={(e) => setPlpChecked(e.target.checked)}
                className="accent-[var(--color-primary-container)] rounded"
              />
              <span>PLP Grid</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={pdpChecked}
                onChange={(e) => setPdpChecked(e.target.checked)}
                className="accent-[var(--color-primary-container)] rounded"
              />
              <span>PDP Scan</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hashChecked}
                onChange={(e) => setHashChecked(e.target.checked)}
                className="accent-[var(--color-primary-container)] rounded"
              />
              <span>SHA256 Hashes</span>
            </label>
          </div>

          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs font-bold hover:bg-[var(--color-primary)] transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-base ${isAuditing ? 'animate-spin' : ''}`}>
              {isAuditing ? 'sync' : 'search'}
            </span>
            <span>{isAuditing ? 'Auditing DOM...' : 'Run Live Content Audit'}</span>
          </button>
        </div>
      </div>

      {/* Failure Alert Banner */}
      <div className="bg-[var(--color-error-container)]/20 border border-[var(--color-error-container)]/60 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[var(--color-error)] text-2xl mt-0.5">
            error
          </span>
          <div>
            <h3 className="font-headline-md text-base font-bold text-[var(--color-error)]">
              4 Broken Image Assets Detected (HTTP 404)
            </h3>
            <p className="font-body-md text-xs text-[var(--color-error)] mt-0.5">
              <code className="text-[var(--color-on-surface)] font-mono bg-[var(--color-error-container)]/40 px-1 rounded">problem_user</code> encounters broken asset <code className="text-[var(--color-on-surface)] font-mono">sl-404.16f35e69.jpg</code> across 4 distinct inventory cards. Duplicate asset collision identified on Bike Light accessory.
            </p>
          </div>
        </div>

        <button
          onClick={handlePushAllToJira}
          className="px-4 py-2 rounded-lg bg-[var(--color-error)] text-[var(--color-on-error)] text-xs font-bold hover:bg-white hover:text-black transition-all cursor-pointer whitespace-nowrap shadow-sm"
        >
          Push 4 Defect Tickets to Jira
        </button>
      </div>

      {/* Scraped Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-lg p-3">
          <span className="text-[11px] font-code-sm text-[var(--color-outline)] uppercase block">Total Scraped</span>
          <span className="text-xl font-bold font-mono text-[var(--color-on-surface)]">6 Inventory Items</span>
        </div>
        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-lg p-3">
          <span className="text-[11px] font-code-sm text-[var(--color-error)] uppercase block">Broken Assets</span>
          <span className="text-xl font-bold font-mono text-[var(--color-error)]">4 (66.7% failure)</span>
        </div>
        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-lg p-3">
          <span className="text-[11px] font-code-sm text-[var(--color-tertiary)] uppercase block">Hash Collisions</span>
          <span className="text-xl font-bold font-mono text-[var(--color-tertiary)]">1 Reused Asset</span>
        </div>
        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-lg p-3">
          <span className="text-[11px] font-code-sm text-[var(--color-warning)] uppercase block">Price Anomalies</span>
          <span className="text-xl font-bold font-mono text-[var(--color-warning)]">1 ($0.00 Zero Price)</span>
        </div>
      </div>

      {/* 6 Inventory Inspection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {INVENTORY_ITEMS.map((item) => {
          const currentMode = activeItemView[item.sku] || 'plp';
          return (
            <div
              key={item.sku}
              className={`bg-[var(--color-surface-container-low)] border rounded-xl overflow-hidden flex flex-col justify-between transition-all ${
                item.statusBadgeType === 'error'
                  ? 'border-[var(--color-error-container)]/60 hover:border-[var(--color-error)]'
                  : item.statusBadgeType === 'tertiary'
                  ? 'border-[var(--color-tertiary-container)]/60 hover:border-[var(--color-tertiary)]'
                  : 'border-[var(--color-surface-container-high)] hover:border-[var(--color-secondary)]'
              }`}
            >
              {/* Card Header with Badges */}
              <div className="p-4 border-b border-[var(--color-surface-container-high)] flex items-center justify-between">
                <div>
                  <span className="font-code-sm text-[10px] text-[var(--color-outline)] uppercase tracking-wider block">
                    {item.sku}
                  </span>
                  <h3 className="font-headline-md text-sm font-bold text-[var(--color-on-surface)] truncate max-w-[200px]">
                    {item.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-label-badge text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      item.statusBadgeType === 'error'
                        ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]'
                        : item.statusBadgeType === 'tertiary'
                        ? 'bg-[var(--color-on-tertiary)] text-[var(--color-tertiary)]'
                        : 'bg-[var(--color-on-secondary)] text-[var(--color-secondary)]'
                    }`}
                  >
                    {item.statusBadge}
                  </span>
                </div>
              </div>

              {/* Card Body: Image Preview */}
              <div className="p-4 flex flex-col items-center justify-center bg-[var(--color-surface)]/70 min-h-[180px] relative">
                <img
                  alt={item.imageAlt}
                  src={item.image}
                  className="h-36 w-auto object-contain rounded transition-transform hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {item.isGlitchOr404 && (
                  <div className="absolute bottom-2 inset-x-2 bg-[var(--color-error-container)]/90 backdrop-blur-xs text-[var(--color-on-error-container)] text-[10px] font-mono px-2 py-1 rounded text-center truncate border border-[var(--color-error)]/30">
                    {item.glitchLabel}
                  </div>
                )}
              </div>

              {/* Card Meta details */}
              <div className="p-4 space-y-2 text-xs font-code-sm border-t border-[var(--color-surface-container-high)]">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-outline)]">Live Price:</span>
                  <span
                    className={`font-mono font-bold ${
                      item.livePrice === '$0.00' ? 'text-[var(--color-error)] bg-[var(--color-error-container)]/40 px-1 rounded' : 'text-[var(--color-secondary)]'
                    }`}
                  >
                    {item.livePrice} <span className="text-[10px] text-[var(--color-outline)] font-normal">{item.priceNote}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-outline)]">{item.secondaryLabel}:</span>
                  <span className="text-[var(--color-on-surface)] font-mono">{item.secondaryValue}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-outline)]">Audit Scope:</span>
                  <span className="text-[var(--color-primary)]">{item.scope}</span>
                </div>

                {/* View Mode Toggle: PLP vs PDP */}
                <div className="pt-2 flex items-center justify-between border-t border-[var(--color-surface-container-high)]/60">
                  <div className="flex items-center gap-1 bg-[var(--color-surface)] p-0.5 rounded border border-[var(--color-surface-container-high)]">
                    <button
                      onClick={() =>
                        setActiveItemView((prev) => ({ ...prev, [item.sku]: 'plp' }))
                      }
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        currentMode === 'plp'
                          ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-bold'
                          : 'text-[var(--color-outline)] hover:text-[var(--color-on-surface)]'
                      }`}
                    >
                      PLP View
                    </button>
                    <button
                      onClick={() =>
                        setActiveItemView((prev) => ({ ...prev, [item.sku]: 'pdp' }))
                      }
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        currentMode === 'pdp'
                          ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-bold'
                          : 'text-[var(--color-outline)] hover:text-[var(--color-on-surface)]'
                      }`}
                    >
                      PDP Details
                    </button>
                  </div>

                  <button
                    onClick={() => handleCopyJiraSnippet(item)}
                    className="flex items-center gap-1 text-[11px] text-[var(--color-tertiary)] hover:text-[var(--color-on-surface)] transition-colors"
                    title="Copy Jira defect snippet"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                    <span>Copy Jira snippet</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Collapsible Real-Time Crawler Output Stream Console */}
      <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-surface-container-high)] rounded-xl overflow-hidden shadow-xl">
        <div
          onClick={() => setConsoleOpen(!consoleOpen)}
          className="px-4 py-3 bg-[var(--color-surface-container-low)] border-b border-[var(--color-surface-container-high)] flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-secondary)] animate-pulse"></span>
            <span className="font-code-sm text-xs font-bold text-[var(--color-on-surface)]">
              Crawler Execution Stream (Chromium v124 Headless)
            </span>
            <span className="font-label-badge text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface-container)] text-[var(--color-tertiary)]">
              {consoleLogs.length} events logged
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(consoleLogs.join('\n'));
                onShowToast('Crawler logs copied to clipboard', 'terminal');
              }}
              className="text-[11px] text-[var(--color-primary)] hover:text-[var(--color-on-surface)] font-mono px-2 py-0.5 rounded hover:bg-[var(--color-surface-container-high)]"
            >
              Export Logs
            </button>
            <span className="material-symbols-outlined text-[var(--color-outline)] text-lg">
              {consoleOpen ? 'expand_less' : 'expand_more'}
            </span>
          </div>
        </div>

        {consoleOpen && (
          <div className="p-4 font-mono text-xs text-[var(--color-on-surface-variant)] max-h-56 overflow-y-auto space-y-1 bg-[var(--color-surface-container-lowest)]">
            {consoleLogs.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.includes('FAIL')
                    ? 'text-[var(--color-error)] bg-[var(--color-error-container)]/20 px-2 py-0.5 rounded'
                    : line.includes('WARN')
                    ? 'text-[var(--color-warning)]'
                    : line.includes('SUMMARY')
                    ? 'text-[var(--color-tertiary)] font-bold'
                    : 'text-[var(--color-outline)]'
                }
              >
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
