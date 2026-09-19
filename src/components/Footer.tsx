import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[var(--color-surface-container-lowest)] py-5 border-t border-[var(--color-surface-container-high)]/60 mt-auto">
      <div className="w-full px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[var(--color-on-surface-variant)]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-code-sm text-xs text-[var(--color-on-surface-variant)]">
            © 2024 QA Agent Hub • SauceDemo Automation Core
          </span>
          <span className="font-label-badge uppercase px-2 py-0.5 rounded bg-[var(--color-surface-container)] text-[var(--color-secondary)] border border-[var(--color-surface-container-highest)]/50">
            Engine: Playwright v1.43
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-code-sm text-[var(--color-outline)]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--color-secondary)]"></span>
            Worker Cluster: 4/4 Active
          </span>
          <span>•</span>
          <span className="text-[var(--color-tertiary)]">SQLite Sync: Realtime WAL</span>
        </div>
      </div>
    </footer>
  );
};
