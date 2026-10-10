import React, { useState, useEffect } from 'react';
import { InventoryInspectionItem, UserPersona } from '../types';
import { ScraperApi } from '../lib/api';

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
  const [items, setItems] = useState<InventoryInspectionItem[]>([]);
  const [runId, setRunId] = useState<string | undefined>(undefined);
  const [activeItemView, setActiveItemView] = useState<{ [sku: string]: 'plp' | 'pdp' }>({});
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[idle] Run a live content audit to launch the real Playwright crawler against saucedemo.com',
  ]);

  useEffect(() => {
    ScraperApi.latest()
      .then((latest) => {
        if (latest) {
          setItems(latest.items);
          setRunId(latest.runId);
          setConsoleLogs(latest.logs);
        }
      })
      .catch(() => {});
  }, []);

  const summary = {
    total: items.length,
    broken: items.filter((i) => i.statusBadgeType === 'error').length,
    hash: items.filter((i) => i.statusBadgeType === 'tertiary').length,
    price: items.filter((i) => i.priceNote === '(Zero Price)').length,
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    onShowToast(`Executing Playwright DOM asset scraper for ${selectedPersona}...`);
    try {
      const result = await ScraperApi.run({
        persona: selectedPersona,
        plp: plpChecked,
        pdp: pdpChecked,
        hash: hashChecked,
      });
      setItems(result.items);
      setRunId(result.runId);
      setConsoleLogs(result.logs);
      onShowToast(
        `Audit sweep complete: ${result.summary.brokenAssets} broken asset(s), ${result.summary.hashCollisions} hash collision group(s)`,
        'check_circle'
      );
    } catch (err) {
      onShowToast(`Scrape failed: ${(err as Error).message}`, 'error');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCopyJiraSnippet = (item: InventoryInspectionItem) => {
    navigator.clipboard.writeText(item.snippetText);
    onShowToast(`Copied Jira defect snippet for ${item.name}`, 'content_copy');
  };

  const handlePushAllToJira = async () => {
    try {
      const result = await ScraperApi.pushDefects(runId);
      onShowToast(`Pushed ${result.count} defect issue(s) to the triage queue`, 'send');
      setTimeout(() => onNavigateToIssues(), 600);
    } catch (err) {
      onShowToast(`Failed to push defects: ${(err as Error).message}`, 'error');
    }
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
      {items.length === 0 ? (
        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-xl p-5 text-center text-sm text-[var(--color-on-surface-variant)]">
          No audit results yet. Click <span className="font-bold text-[var(--color-on-surface)]">Run Live Content Audit</span> to launch the real Playwright crawler against saucedemo.com.
        </div>
      ) : summary.broken + summary.hash + summary.price > 0 ? (
        <div className="bg-[var(--color-error-container)]/20 border border-[var(--color-error-container)]/60 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[var(--color-error)] text-2xl mt-0.5">
              error
            </span>
            <div>
              <h3 className="font-headline-md text-base font-bold text-[var(--color-error)]">
                {summary.broken + summary.hash + summary.price} Asset Defect(s) Detected
              </h3>
              <p className="font-body-md text-xs text-[var(--color-error)] mt-0.5">
                <code className="text-[var(--color-on-surface)] font-mono bg-[var(--color-error-container)]/40 px-1 rounded">{selectedPersona}</code> triggered {summary.broken} broken HTTP asset(s), {summary.hash} duplicate-image collision(s), and {summary.price} price anomaly(ies) across {summary.total} scraped products.
              </p>
            </div>
          </div>

          <button
            onClick={handlePushAllToJira}
            className="px-4 py-2 rounded-lg bg-[var(--color-error)] text-[var(--color-on-error)] text-xs font-bold hover:bg-white hover:text-black transition-all cursor-pointer whitespace-nowrap shadow-sm"
          >
            Push {summary.broken + summary.hash + summary.price} Defect Ticket(s) to Jira
          </button>
        </div>
      ) : (
        <div className="bg-[var(--color-secondary)]/10 border border-[var(--color-surface-container-high)] rounded-xl p-4 sm:p-5 text-sm text-[var(--color-secondary)]">
          Clean scrape for <span className="font-bold">{selectedPersona}</span> — no broken assets, duplicate images, or price anomalies detected across {summary.total} products.
        </div>
      )}

      {/* Scraped Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-lg p-3">
          <span className="text-[11px] font-code-sm text-[var(--color-outline)] uppercase block">Total Scraped</span>
          <span className="text-xl font-bold font-mono text-[var(--color-on-surface)]">{summary.total} Inventory Items</span>
        </div>
        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-lg p-3">
          <span className="text-[11px] font-code-sm text-[var(--color-error)] uppercase block">Broken Assets</span>
          <span className="text-xl font-bold font-mono text-[var(--color-error)]">
            {summary.broken}{summary.total > 0 ? ` (${((summary.broken / summary.total) * 100).toFixed(1)}% failure)` : ''}
          </span>
        </div>
        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-lg p-3">
          <span className="text-[11px] font-code-sm text-[var(--color-tertiary)] uppercase block">Hash Collisions</span>
          <span className="text-xl font-bold font-mono text-[var(--color-tertiary)]">{summary.hash} Reused Asset(s)</span>
        </div>
        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-lg p-3">
          <span className="text-[11px] font-code-sm text-[var(--color-warning)] uppercase block">Price Anomalies</span>
          <span className="text-xl font-bold font-mono text-[var(--color-warning)]">{summary.price} ($0.00 Zero Price)</span>
        </div>
      </div>

      {/* Inventory Inspection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => {
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
              Crawler Execution Stream (Chromium v153 Headless)
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
