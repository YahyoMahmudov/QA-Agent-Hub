import React, { useState } from 'react';
import { DefectIssue, IssueArea, IssueSeverity, IssueStatus, IssueSource } from '../types';

interface DefectIssuesViewProps {
  issues: DefectIssue[];
  onUpdateIssueStatus: (id: string, newStatus: IssueStatus) => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const DefectIssuesView: React.FC<DefectIssuesViewProps> = ({
  issues,
  onUpdateIssueStatus,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [jiraModalIssue, setJiraModalIssue] = useState<DefectIssue | null>(null);
  const [jiraFormatTab, setJiraFormatTab] = useState<'markdown' | 'jira' | 'json'>('jira');

  // Filtering logic
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.diagnostic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = selectedArea === 'ALL' || issue.area === selectedArea;
    const matchesSeverity = selectedSeverity === 'ALL' || issue.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'ALL' || issue.status === selectedStatus;
    const matchesSource = selectedSource === 'ALL' || issue.source === selectedSource;

    return matchesSearch && matchesArea && matchesSeverity && matchesStatus && matchesSource;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRowIds(filteredIssues.map((i) => i.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedRowIds.includes(id)) {
      setSelectedRowIds(selectedRowIds.filter((item) => item !== id));
    } else {
      setSelectedRowIds([...selectedRowIds, id]);
    }
  };

  const handleExportCSV = () => {
    const headers = 'ID,Title,Area,Source,Severity,Status,FirstSeen,Diagnostic\n';
    const rows = filteredIssues
      .map(
        (i) =>
          `"${i.id}","${i.title}","${i.area}","${i.source}","${i.severity}","${i.status}","${i.firstSeen}","${i.diagnostic.replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saucedemo_defects_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    onShowToast(`Exported ${filteredIssues.length} defects to CSV`, 'download');
  };

  const handleCopyJira = () => {
    if (!jiraModalIssue) return;
    let content = '';
    if (jiraFormatTab === 'jira') {
      content = `h2. [SauceDemo] ${jiraModalIssue.title}
*Issue ID*: ${jiraModalIssue.id}
*Severity*: ${jiraModalIssue.severity.toUpperCase()}
*Area*: ${jiraModalIssue.area}
*Source*: ${jiraModalIssue.source}
*Persona Profile*: ${jiraModalIssue.persona || 'problem_user'}

h3. Diagnostic & Telemetry Log
{code}
${jiraModalIssue.diagnostic}
Selector: ${jiraModalIssue.locator || 'N/A'}
{code}

h3. Reproduction Steps
# Launch Chromium 124 Headless via Playwright
# Authenticate with persona: ${jiraModalIssue.persona || 'problem_user'} / secret_sauce
# Navigate to target route: /${jiraModalIssue.area.toLowerCase().replace(' ', '-')}.html
# Observe assertion failure or broken HTTP response status code

h3. Trace Artifacts
* Playwright Zip: ${jiraModalIssue.traceArtifact || 'trace_run_8941.zip'}
* Vault Record: local.db #${jiraModalIssue.id}`;
    } else if (jiraFormatTab === 'markdown') {
      content = `## [SauceDemo] ${jiraModalIssue.title}
- **Issue ID**: \`${jiraModalIssue.id}\`
- **Severity**: **${jiraModalIssue.severity.toUpperCase()}**
- **Area**: ${jiraModalIssue.area}
- **Persona**: \`${jiraModalIssue.persona || 'problem_user'}\`

### Diagnostic Log
\`\`\`
${jiraModalIssue.diagnostic}
\`\`\`

### Playwright Trace
- **Artifact**: \`${jiraModalIssue.traceArtifact || 'trace_run_8941.zip'}\``;
    } else {
      content = JSON.stringify(jiraModalIssue, null, 2);
    }

    navigator.clipboard.writeText(content);
    onShowToast(`Copied ${jiraFormatTab.toUpperCase()} Jira ticket content to clipboard`, 'content_copy');
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Breadcrumb & Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-code-sm text-[var(--color-outline)] mb-1">
            <span>QA Automation Hub</span>
            <span>/</span>
            <span>Defect Management</span>
            <span>/</span>
            <span className="text-[var(--color-error)]">Triage & Issue Queue</span>
          </div>
          <h1 className="font-headline-xl text-2xl sm:text-3xl font-bold text-[var(--color-on-surface)]">
            Defect Issues Repository
          </h1>
          <p className="font-body-md text-sm text-[var(--color-on-surface-variant)] mt-1">
            Triage, search, and export failures detected across Playwright suites, DOM scraper runs, and manual review pins.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] text-[var(--color-primary)] border border-[var(--color-surface-container-highest)] text-xs font-code-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              if (selectedRowIds.length === 0) {
                onShowToast('Select at least one issue below for bulk sync', 'info');
              } else {
                onShowToast(`Synced ${selectedRowIds.length} tickets to Jira Cloud API`, 'sync');
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs font-bold hover:bg-[var(--color-primary)] transition-all cursor-pointer shadow-md"
          >
            <span className="material-symbols-outlined text-base">cloud_upload</span>
            <span>Bulk Jira Sync ({selectedRowIds.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-lg p-3">
          <span className="text-[11px] font-code-sm text-[var(--color-outline)] uppercase block">Total Defects</span>
          <span className="text-xl font-bold font-mono text-[var(--color-on-surface)]">
            {issues.length} Issues Logged
          </span>
        </div>
        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-lg p-3">
          <span className="text-[11px] font-code-sm text-[var(--color-error)] uppercase block">Critical Severity</span>
          <span className="text-xl font-bold font-mono text-[var(--color-error)]">
            {issues.filter((i) => i.severity === 'critical').length} Blockers
          </span>
        </div>
        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-lg p-3">
          <span className="text-[11px] font-code-sm text-[var(--color-warning)] uppercase block">Open Triage</span>
          <span className="text-xl font-bold font-mono text-[var(--color-warning)]">
            {issues.filter((i) => i.status === 'open').length} Awaiting Fix
          </span>
        </div>
        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-lg p-3">
          <span className="text-[11px] font-code-sm text-[var(--color-tertiary)] uppercase block">Scraper Detected</span>
          <span className="text-xl font-bold font-mono text-[var(--color-tertiary)]">
            {issues.filter((i) => i.source === 'Content Scraper').length} Auto-scraped
          </span>
        </div>
      </div>

      {/* Search & Multi-Facet Filters */}
      <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full lg:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[var(--color-outline)] text-sm">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, diagnostic, or URL..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-container-high)] text-xs text-[var(--color-on-surface)] placeholder-[var(--color-outline)] focus:border-[var(--color-primary-container)] focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-[var(--color-outline)] hover:text-[var(--color-on-surface)]"
            >
              <span className="material-symbols-outlined text-xs">close</span>
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto text-xs font-code-sm">
          {/* Area */}
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] focus:border-[var(--color-primary-container)] focus:outline-hidden"
          >
            <option value="ALL">All Areas</option>
            <option value="PLP">PLP</option>
            <option value="PDP">PDP</option>
            <option value="Checkout Flow">Checkout Flow</option>
          </select>

          {/* Severity */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] focus:border-[var(--color-primary-container)] focus:outline-hidden"
          >
            <option value="ALL">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] focus:border-[var(--color-primary-container)] focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="fixed">Fixed</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Source */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] focus:border-[var(--color-primary-container)] focus:outline-hidden"
          >
            <option value="ALL">All Sources</option>
            <option value="Content Scraper">Content Scraper</option>
            <option value="Playwright">Playwright</option>
            <option value="Review Pin">Review Pin</option>
          </select>
        </div>
      </div>

      {/* Main Issues Data Table */}
      <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-code-sm text-xs">
            <thead>
              <tr className="bg-[var(--color-surface-container)] border-b border-[var(--color-surface-container-high)] text-[11px] text-[var(--color-outline)] uppercase tracking-wider">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredIssues.length > 0 &&
                      selectedRowIds.length === filteredIssues.length
                    }
                    onChange={handleSelectAll}
                    className="accent-[var(--color-primary-container)] rounded"
                  />
                </th>
                <th className="p-3.5 font-semibold">Issue ID & Diagnostic Title</th>
                <th className="p-3.5 font-semibold">Area</th>
                <th className="p-3.5 font-semibold">Source</th>
                <th className="p-3.5 font-semibold">Severity</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold">Last Seen</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-surface-container-high)]/60 font-body-sm">
              {filteredIssues.map((issue) => {
                const isSelected = selectedRowIds.includes(issue.id);
                return (
                  <tr
                    key={issue.id}
                    className={`hover:bg-[var(--color-surface-container)]/60 transition-colors ${
                      isSelected ? 'bg-[var(--color-primary-container)]/10' : ''
                    }`}
                  >
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(issue.id)}
                        className="accent-[var(--color-primary-container)] rounded"
                      />
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[var(--color-primary-container)]">{issue.id}</span>
                        <span className="font-semibold text-[var(--color-on-surface)]">{issue.title}</span>
                      </div>
                      <div className="text-[11px] font-mono text-[var(--color-outline)] mt-0.5 truncate max-w-lg">
                        {issue.diagnostic}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-surface-container-high)] text-[var(--color-primary)] font-mono text-[10px]">
                        {issue.area}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[var(--color-on-surface-variant)] text-xs">
                      {issue.source}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-label-badge text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                          issue.severity === 'critical'
                            ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]'
                            : issue.severity === 'high'
                            ? 'bg-[var(--color-warning)]/30 text-[var(--color-warning)]'
                            : issue.severity === 'medium'
                            ? 'bg-[var(--color-on-tertiary)] text-[var(--color-tertiary)]'
                            : 'bg-[var(--color-surface-container-high)] text-[var(--color-outline)]'
                        }`}
                      >
                        {issue.severity}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={issue.status}
                        onChange={(e) =>
                          onUpdateIssueStatus(issue.id, e.target.value as IssueStatus)
                        }
                        className="bg-[var(--color-surface)] border border-[var(--color-surface-container-high)] text-[var(--color-on-surface)] font-mono text-[11px] px-2 py-1 rounded focus:border-[var(--color-primary-container)] focus:outline-hidden"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="fixed">Fixed</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[var(--color-outline)]">
                      {issue.lastSeen}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setJiraModalIssue(issue)}
                        className="p-1.5 rounded hover:bg-[var(--color-surface-container)] text-[var(--color-tertiary)] hover:text-[var(--color-on-surface)] transition-colors"
                        title="Open Jira Ticket Exporter"
                      >
                        <span className="material-symbols-outlined text-base">article</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Context & Defect Artifact Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-xl overflow-hidden p-4">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--color-outline)] mb-2">
            <span>Trace Artifact: Backpack 404</span>
            <span className="text-[var(--color-error)]">HTTP 404</span>
          </div>
          <div className="h-40 bg-[var(--color-surface-container-lowest)] rounded-lg overflow-hidden flex items-center justify-center border border-[var(--color-surface-container-high)]">
            <img
              alt="Backpack 404 trace"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwLC7MO2uxaaiXptDmhWOC3rI424-IJff7rifcHEl8z7S5G8X_VTNn2JPUbqN4Kc4K4tRsNDTeegnEVNi8RwIxuqfbuAfTY5tMHShn7df_GoSObOT-xwWZEMzb8FDFmyFY4ijFZEUmC1C9DBphd4-EC0bR1lmUZt5NChGsAnPROSvMN68I6Pth4AqzXrI-XrPgE-tV4g9SVweMRMh5x1703duZfwLH02uP8yLmI3UaP79mWn99Rx2TxA"
              className="h-full w-auto object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="font-mono text-[11px] text-[var(--color-on-surface-variant)] mt-2">
            ISS-1042: Scraped from /inventory.html for problem_user
          </p>
        </div>

        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-xl overflow-hidden p-4">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--color-outline)] mb-2">
            <span>Trace Artifact: Step 7 Snapshot</span>
            <span className="text-[var(--color-error)]">TimeoutError</span>
          </div>
          <div className="h-40 bg-[var(--color-surface-container-lowest)] rounded-lg overflow-hidden flex items-center justify-center border border-[var(--color-surface-container-high)]">
            <img
              alt="Checkout failure snapshot"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7DdDf9mtdG4VP7IEa7ggWzNEg2pfG__de3Qxm8zPJYaZnjz9kDEnyXdsvnxySHMSkTnSmRv-9_AyL3UnGPphg6jB5RN-c7NthOZJ1YcSS3KXkJr2wx5PZDkXLEQubJyUowe07HzOksgDzLHJBh31q4S8gj1HxJiYzhdls4tFT2S1aODbmXh01HY39WsiesQsg3P6TE8eT3gFIpSBAfEqriYLk_tHDJlIBXoWBYrqfoQWf6wDUK1we-A"
              className="h-full w-auto object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="font-mono text-[11px] text-[var(--color-on-surface-variant)] mt-2">
            ISS-1041: #last-name input field locked during fill action
          </p>
        </div>

        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-xl overflow-hidden p-4">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--color-outline)] mb-2">
            <span>Trace Artifact: Zero Price PDP</span>
            <span className="text-[var(--color-warning)]">$0.00 Glitch</span>
          </div>
          <div className="h-40 bg-[var(--color-surface-container-lowest)] rounded-lg overflow-hidden flex items-center justify-center border border-[var(--color-surface-container-high)]">
            <img
              alt="Bolt t-shirt zero price"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoupMFt4CDhqXM0jLZ0C9VWl8L_JcZMEMiPc8NlfLBD1y-PSV4lVmSChzkcGL7rtIF8QBcXNDjFIsFaXZIkDc2p1sMxP2EQbZaEaaaD0Oe2QQ68PoFMPkOlbiF73-K1OwtyzmS758nx4bfcjVBQejOExZwm65hKOSM4-qYo59Nr35BmU8qxHq9VHMcZX5yrMcXE6c0mUUPQSnY2CHoOOouytntXVKGfzPrHPbB-iIYkiy415Z5cKn1zQ"
              className="h-full w-auto object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="font-mono text-[11px] text-[var(--color-on-surface-variant)] mt-2">
            ISS-1039: Scraped price returns zero value on PDP navigation
          </p>
        </div>
      </div>

      {/* Jira Export Modal */}
      {jiraModalIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-surface-container-lowest)]/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-highest)] rounded-xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 bg-[var(--color-surface-container)] border-b border-[var(--color-surface-container-highest)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--color-primary-container)] text-xl">
                  confirmation_number
                </span>
                <div>
                  <h3 className="font-headline-md text-base font-bold text-[var(--color-on-surface)]">
                    Jira Defect Ticket Exporter
                  </h3>
                  <p className="font-code-sm text-xs text-[var(--color-outline)]">
                    Generated from SauceDemo telemetry for {jiraModalIssue.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setJiraModalIssue(null)}
                className="p-1 text-[var(--color-outline)] hover:text-[var(--color-on-surface)]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Format Picker Tabs */}
            <div className="px-5 pt-3 bg-[var(--color-surface)] border-b border-[var(--color-surface-container-high)] flex items-center gap-2">
              {(['jira', 'markdown', 'json'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setJiraFormatTab(tab)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-t-lg transition-all border-t border-x ${
                    jiraFormatTab === tab
                      ? 'bg-[var(--color-surface-container-low)] text-[var(--color-tertiary)] border-[var(--color-surface-container-highest)] font-bold'
                      : 'bg-transparent text-[var(--color-outline)] border-transparent hover:text-[var(--color-on-surface)]'
                  }`}
                >
                  {tab === 'jira'
                    ? 'Atlassian Jira Markup'
                    : tab === 'markdown'
                    ? 'Markdown Format'
                    : 'JSON Payload'}
                </button>
              ))}
            </div>

            {/* Content Preview */}
            <div className="p-5 font-mono text-xs bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface-variant)] max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
              {jiraFormatTab === 'jira' ? (
                <>
                  h2. [SauceDemo] {jiraModalIssue.title}
                  {'\n'}*Issue ID*: {jiraModalIssue.id}
                  {'\n'}*Severity*: {jiraModalIssue.severity.toUpperCase()}
                  {'\n'}*Area*: {jiraModalIssue.area}
                  {'\n'}*Source*: {jiraModalIssue.source}
                  {'\n'}*Persona*: {jiraModalIssue.persona || 'problem_user'}
                  {'\n\n'}h3. Diagnostic & Telemetry Log
                  {'\n'}&#123;code&#125;
                  {'\n'}{jiraModalIssue.diagnostic}
                  {'\n'}Selector: {jiraModalIssue.locator || 'N/A'}
                  {'\n'}&#123;code&#125;
                  {'\n\n'}h3. Reproduction Steps
                  {'\n'}# Launch Chromium 124 Headless via Playwright
                  {'\n'}# Authenticate with persona: {jiraModalIssue.persona || 'problem_user'}
                  {'\n'}# Navigate to target route: /{jiraModalIssue.area.toLowerCase().replace(' ', '-')}.html
                  {'\n'}# Observe assertion failure or broken HTTP response status code
                  {'\n\n'}h3. Attachments & Trace
                  {'\n'}* Playwright Artifact: {jiraModalIssue.traceArtifact || 'trace_run_8941.zip'}
                </>
              ) : jiraFormatTab === 'markdown' ? (
                <>
                  ## [SauceDemo] {jiraModalIssue.title}
                  {'\n'}- **Issue ID**: `{jiraModalIssue.id}`
                  {'\n'}- **Severity**: **{jiraModalIssue.severity.toUpperCase()}**
                  {'\n'}- **Area**: {jiraModalIssue.area}
                  {'\n'}- **Persona**: `{jiraModalIssue.persona || 'problem_user'}`
                  {'\n\n'}### Diagnostic Log
                  {'\n'}```
                  {'\n'}{jiraModalIssue.diagnostic}
                  {'\n'}```
                </>
              ) : (
                JSON.stringify(jiraModalIssue, null, 2)
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-5 py-3 bg-[var(--color-surface-container)] border-t border-[var(--color-surface-container-highest)] flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--color-outline)]">
                Ready to paste into Jira issue description
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJira}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs font-bold hover:bg-[var(--color-primary)] transition-all cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                  <span>Copy Ticket Content</span>
                </button>

                <button
                  onClick={() => setJiraModalIssue(null)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-container-high)] hover:bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)] text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
