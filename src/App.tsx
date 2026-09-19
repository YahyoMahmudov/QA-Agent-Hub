import React, { useState } from 'react';
import { NavigationTab, DefectIssue, ReviewPin, IssueStatus } from './types';
import { INITIAL_DEFECT_ISSUES, INITIAL_REVIEW_PINS } from './data/mockData';
import { useTheme } from './hooks/useTheme';
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
  const [issues, setIssues] = useState<DefectIssue[]>(INITIAL_DEFECT_ISSUES);
  const [pins, setPins] = useState<ReviewPin[]>(INITIAL_REVIEW_PINS);
  const [recordCount, setRecordCount] = useState<number>(1482);
  const [isSuiteModalOpen, setIsSuiteModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);

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
    setIssues((prev) =>
      prev.map((issue) => (issue.id === id ? { ...issue, status: newStatus } : issue))
    );
    showToast(`Updated defect ${id} status to ${newStatus}`, 'update');
  };

  const handleAddReviewPin = (newPin: ReviewPin) => {
    setPins((prev) => [newPin, ...prev]);
    setRecordCount((c) => c + 1);
  };

  const handleSuiteCompleted = (newRecords: number) => {
    setRecordCount((prev) => prev + newRecords);
    showToast(`Suite run complete. Synced +${newRecords} audit rows to local.db`, 'sync');
  };

  const handleLogJiraFromFailure = () => {
    const newIssue: DefectIssue = {
      id: `ISS-${1042 + issues.length + 1}`,
      title: 'Checkout Step 7: Last Name input field locked during fill action',
      diagnostic: "TimeoutError: locator('#last-name').fill() exceeded 5000ms • problem_user defect lock",
      area: 'Checkout Flow',
      firstSeen: new Date().toLocaleTimeString(),
      lastSeen: 'Just now',
      source: 'Playwright',
      severity: 'critical',
      status: 'open',
      locator: '#last-name',
      persona: 'problem_user',
      traceArtifact: 'trace_run_8941_step7.zip',
    };
    setIssues((prev) => [newIssue, ...prev]);
    setRecordCount((c) => c + 1);
    setActiveTab('defect-issues');
    showToast(`Created defect ticket ${newIssue.id} in triage repository`, 'post_add');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)] text-[var(--color-on-surface)] antialiased">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRunFullSuite={() => setIsSuiteModalOpen(true)}
        recordCount={recordCount}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-8">
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
