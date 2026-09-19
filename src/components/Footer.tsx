import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#000f21] py-5 border-t border-[#1b2b3f]/60 mt-auto">
      <div className="w-full px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[#c7c4d7]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-code-sm text-xs text-[#c7c4d7]">
            © 2024 QA Agent Hub • SauceDemo Automation Core
          </span>
          <span className="font-label-badge uppercase px-2 py-0.5 rounded bg-[#102034] text-[#4edea3] border border-[#26364a]/50">
            Engine: Playwright v1.43
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-code-sm text-[#908fa0]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
            Worker Cluster: 4/4 Active
          </span>
          <span>•</span>
          <span className="text-[#4cd7f6]">SQLite Sync: Realtime WAL</span>
        </div>
      </div>
    </footer>
  );
};
