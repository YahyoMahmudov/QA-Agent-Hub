/**
 * Type definitions for QA Agent Hub
 */

export type NavigationTab = 
  | 'dashboard'
  | 'content-scraper'
  | 'functional-tests'
  | 'defect-issues'
  | 'review-pins';

export type UserPersona = 
  | 'standard_user'
  | 'problem_user'
  | 'performance_glitch_user'
  | 'error_user'
  | 'visual_user'
  | 'locked_out_user';

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IssueStatus = 'open' | 'in_progress' | 'fixed' | 'resolved';
export type IssueArea = 'PLP' | 'PDP' | 'Checkout Flow' | 'Login';
export type IssueSource = 'Content Scraper' | 'Playwright' | 'Review Pin';

export interface DefectIssue {
  id: string; // e.g. 'ISS-1042'
  title: string;
  diagnostic: string;
  area: IssueArea;
  firstSeen: string;
  lastSeen: string;
  source: IssueSource;
  severity: IssueSeverity;
  status: IssueStatus;
  locator?: string;
  persona?: UserPersona;
  traceArtifact?: string;
  snapshotUrl?: string;
}

export interface ReviewPin {
  id: string; // e.g. '#PIN-01'
  title: string;
  description: string;
  xpath: string;
  targetElement: string;
  page: 'PLP' | 'PDP' | 'CART' | 'CHECKOUT_1' | 'CHECKOUT_2';
  severity: IssueSeverity;
  author: string;
  timeAgo: string;
  status: 'open' | 'resolved';
  jiraKey?: string;
  coords?: { x: number; y: number };
}

export interface InventoryInspectionItem {
  sku: string;
  name: string;
  statusBadge: string;
  statusBadgeType: 'error' | 'warning' | 'tertiary' | 'success';
  image: string;
  imageAlt: string;
  isGlitchOr404: boolean;
  glitchLabel?: string;
  livePrice: string;
  priceNote?: string;
  secondaryLabel: string;
  secondaryValue: string;
  severity: string;
  scope: string;
  jiraKey: string;
  snippetText: string;
}

export interface TestExecutionStep {
  stepNumber: string;
  action: 'GOTO' | 'FILL' | 'CLICK' | 'EXPECT' | 'FAILED ACTION';
  code: string;
  duration: string;
  status: 'passed' | 'failed' | 'skipped';
  screenshot?: boolean;
  errorLog?: string;
}

export interface TestRunItem {
  id: string;
  spec: string;
  status: 'PASSED' | 'FAILED' | 'FLAKY';
  details: string;
  worker: string;
  duration: string;
  timeAgo: string;
  notes: string;
  actionType: 'trace' | 'diff' | 'waterfall';
}
