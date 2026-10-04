/**
 * Thin fetch client for the QA Agent Hub backend (server/index.ts).
 * In dev, Vite proxies /api/* to the Express server (see vite.config.ts).
 */
import {
  DefectIssue,
  IssueStatus,
  ReviewPin,
  InventoryInspectionItem,
  TestRunItem,
  UserPersona,
} from '../types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore, use default message
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---- Issues ----
export const IssuesApi = {
  list: () => request<DefectIssue[]>('/issues'),
  updateStatus: (id: string, status: IssueStatus) =>
    request<DefectIssue>(`/issues/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  create: (issue: Partial<DefectIssue>) =>
    request<DefectIssue>('/issues', { method: 'POST', body: JSON.stringify(issue) }),
};

// ---- Review pins ----
export const PinsApi = {
  list: () => request<ReviewPin[]>('/pins'),
  create: (pin: Partial<ReviewPin>) =>
    request<ReviewPin>('/pins', { method: 'POST', body: JSON.stringify(pin) }),
  update: (id: string, patch: { status?: string; jiraKey?: string }) =>
    request<ReviewPin>(`/pins/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) }),
};

// ---- Dashboard ----
export interface DashboardStats {
  recordCount: number;
  openIssues: number;
  criticalIssues: number;
  totalPins: number;
  openPins: number;
  passRate: number | null;
  lastSuiteRunAgo: string | null;
  lastScrapeAgo: string | null;
  dbSizeMB: number | null;
}

export interface DashboardCell {
  label: string;
  status: 'pass' | 'warning' | 'error' | 'neutral';
  note: string;
}
export interface DashboardOverview {
  passRate: { rate: number | null; total: number; passed: number; failed: number; flaky: number };
  defects: { total: number; critical: number; high: number; medium: number; low: number };
  defectDistribution: { area: string; count: number; pct: number }[];
  personaMatrix: {
    persona: UserPersona;
    auth: DashboardCell;
    plp: DashboardCell;
    checkout: DashboardCell;
    avgDurationMs: number | null;
  }[];
  personaCoverage: { tested: number; total: number; flagged: number };
  assetDetections: {
    brokenAssets: number;
    hashCollisions: number;
    priceAnomalies: number;
    persona: string;
  } | null;
}
export const DashboardApi = {
  stats: () => request<DashboardStats>('/dashboard/stats'),
  overview: () => request<DashboardOverview>('/dashboard/overview'),
};

// ---- Content scraper ----
export interface ScraperRunResponse {
  runId: string;
  items: InventoryInspectionItem[];
  logs: string[];
  summary: {
    totalItems: number;
    brokenAssets: number;
    hashCollisions: number;
    priceAnomalies: number;
    durationMs: number;
  };
}
export const ScraperApi = {
  run: (opts: { persona: UserPersona; plp: boolean; pdp: boolean; hash: boolean }) =>
    request<ScraperRunResponse>('/scraper/run', { method: 'POST', body: JSON.stringify(opts) }),
  latest: () => request<(ScraperRunResponse & { persona: string }) | null>('/scraper/latest'),
  pushDefects: (runId?: string) =>
    request<{ created: { id: string; title: string }[]; count: number }>('/scraper/push-defects', {
      method: 'POST',
      body: JSON.stringify({ runId }),
    }),
};

// ---- Functional test suite ----
export interface SuiteRunStartResponse {
  runId: string;
  // Present when the suite ran to completion synchronously before
  // responding (the Vercel serverless path, which can't stream progress
  // the way the local backend's SSE flow does).
  completed?: boolean;
  passed?: number;
  failed?: number;
  total?: number;
}
export const SuiteApi = {
  start: () => request<SuiteRunStartResponse>('/suite/run', { method: 'POST' }),
  runs: (limit = 20) => request<TestRunItem[]>(`/suite/runs?limit=${limit}`),
  /** Opens an EventSource against the live run stream; caller owns its lifecycle. */
  stream: (runId: string) => new EventSource(`/api/suite/stream/${runId}`),
};

// ---- AI triage ----
export const AiApi = {
  status: () => request<{ configured: boolean }>('/ai/status'),
  triage: (input: { issueId?: string; title?: string; diagnostic?: string; area?: string; severity?: string; persona?: string }) =>
    request<{ summary: string }>('/ai/triage', { method: 'POST', body: JSON.stringify(input) }),
};
