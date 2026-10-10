import React, { useEffect, useState } from 'react';
import { NavigationTab, DefectIssue, ReviewPin, IssueStatus } from './types';
import { useTheme } from './hooks/useTheme';
import { IssuesApi, PinsApi, DashboardApi } from './lib/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DashboardView } from './components/DashboardView';
import { ContentScraperView } from './components/ContentScraperView';
import { FunctionalTestsView } from './components/FunctionalTestsView';
import { DefectIssuesView } from './components/DefectIssuesView';
import { ReviewPinsView } from './components/ReviewPinsView';
import { RunSuiteModal } from './components/RunSuiteModal';
import { Toast, ToastData } from './components/Toast';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [issues, setIssues] = useState<DefectIssue[]>([]);
  const [pins, setPins] = useState<ReviewPin[]>([]);
  const [recordCount, setRecordCount] = useState<number>(0);
  const [dbSizeMB, setDbSizeMB] = useState<number | null>(null);
  const [isSuiteModalOpen, setIsSuiteModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [backendError, setBackendError] = useState<string | null>(null);

  const refreshRecordCount = () => {
    DashboardApi.stats()
      .then((stats) => {
        setRecordCount(stats.recordCount);
        setDbSizeMB(stats.dbSizeMB);
      })
      .catch(() => {});
  };

  useEffect(() => {
    Promise.all([IssuesApi.list(), PinsApi.list(), DashboardApi.stats()])
      .then(([issuesData, pinsData, stats]) => {
        setIssues(issuesData);
        setPins(pinsData);
        setRecordCount(stats.recordCount);
        setDbSizeMB(stats.dbSizeMB);
      })
      .catch((err) => {
        setBackendError(
          `Could not reach the QA Agent Hub backend (${err.message}). Start it with "npm run dev:server" (or "npm run dev" to run both).`
        );
      });
  }, []);

  const showToast = (message: string, icon: string = 'check_circle') => {
    const newToast: ToastData = {
      id: String(Date.now() + Math.random()),
      message,
      icon,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateIssueStatus = (id: string, newStatus: IssueStatus) => {
    // Optimistic update, reconciled with the server's response (which also
    // refreshes lastSeen).
    setIssues((prev) => prev.map((issue) => (issue.id === id ? { ...issue, status: newStatus } : issue)));
    IssuesApi.updateStatus(id, newStatus)
      .then((updated) => {
        setIssues((prev) => prev.map((issue) => (issue.id === id ? updated : issue)));
        showToast(`Updated defect ${id} status to ${newStatus}`, 'update');
      })
      .catch((err) => showToast(`Failed to update ${id}: ${err.message}`, 'error'));
  };

  const handleAddReviewPin = (newPin: Omit<ReviewPin, 'id' | 'timeAgo'>) => {
    PinsApi.create(newPin)
      .then((created) => {
        setPins((prev) => [created, ...prev]);
        refreshRecordCount();
        showToast(`Created review pin ${created.id}: "${created.title}"`, 'push_pin');
      })
      .catch((err) => showToast(`Failed to create pin: ${err.message}`, 'error'));
  };

  const handleSuiteCompleted = (passed: number, failed: number) => {
    refreshRecordCount();
    IssuesApi.list()
      .then(setIssues)
      .catch(() => {});
    showToast(
      `Suite run complete: ${passed} passed, ${failed} failed. Synced results to local_qa_vault.db`,
      'sync'
    );
  };

  const handleLogJiraFromFailure = () => {
    // Files the failure currently shown in the Functional Tests trace
    // waterfall as a real, persisted defect (source: Playwright).
    IssuesApi.create({
      title: 'Checkout Step 7: Last Name input field locked during fill action',
      diagnostic: "TimeoutError: locator('#last-name').fill() exceeded 5000ms • problem_user defect lock",
      area: 'Checkout Flow',
      source: 'Playwright',
      severity: 'critical',
      status: 'open',
      locator: '#last-name',
      persona: 'problem_user',
      traceArtifact: 'trace_run_8941_step7.zip',
    })
      .then((created) => {
        setIssues((prev) => [created, ...prev]);
        refreshRecordCount();
        setActiveTab('defect-issues');
        showToast(`Created defect ticket ${created.id} in triage repository`, 'post_add');
      })
      .catch((err) => showToast(`Failed to create ticket: ${err.message}`, 'error'));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)] text-[var(--color-on-surface)] antialiased">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRunFullSuite={() => setIsSuiteModalOpen(true)}
        recordCount={recordCount}
        dbSizeMB={dbSizeMB}
        issues={issues}
        pins={pins}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-8">
        {backendError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-[var(--color-error-container)]/20 border border-[var(--color-error-container)]/60 text-xs font-code-sm text-[var(--color-error)] flex items-start gap-2">
            <span className="material-symbols-outlined text-base mt-0.5">cloud_off</span>
            <span>{backendError}</span>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigateTab={setActiveTab}
            onTriggerAudit={() => setIsSuiteModalOpen(true)}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'content-scraper' && (
          <ContentScraperView
            onShowToast={showToast}
            onNavigateToIssues={() => setActiveTab('defect-issues')}
          />
        )}

        {activeTab === 'functional-tests' && (
          <FunctionalTestsView
            onShowToast={showToast}
            onLogJiraIssue={handleLogJiraFromFailure}
          />
        )}

        {activeTab === 'defect-issues' && (
          <DefectIssuesView
            issues={issues}
            onUpdateIssueStatus={handleUpdateIssueStatus}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'review-pins' && (
          <ReviewPinsView
            pins={pins}
            onAddPin={handleAddReviewPin}
            onShowToast={showToast}
            onNavigateToIssues={() => setActiveTab('defect-issues')}
          />
        )}
      </main>

      {/* Persistent Bottom Status Footer */}
      <Footer />

      {/* Full Suite Run Interactive Modal */}
      <RunSuiteModal
        isOpen={isSuiteModalOpen}
        onClose={() => setIsSuiteModalOpen(false)}
        onRunComplete={handleSuiteCompleted}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
