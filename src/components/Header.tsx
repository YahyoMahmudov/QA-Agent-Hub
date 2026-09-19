import React, { useState } from 'react';
import { NavigationTab } from '../types';
import { NOTIFICATIONS } from '../data/mockData';
import { Theme } from '../hooks/useTheme';

interface HeaderProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onRunFullSuite: () => void;
  recordCount: number;
  theme: Theme;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onRunFullSuite,
  recordCount,
  theme,
  onToggleTheme,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(7);

  const navItems: { id: NavigationTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'content-scraper', label: 'Content Scraper' },
    { id: 'functional-tests', label: 'Functional Tests' },
    { id: 'defect-issues', label: 'Defect Issues' },
    { id: 'review-pins', label: 'Review Pins' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-surface-container-lowest)]/90 backdrop-blur-md border-b border-[var(--color-surface-container-high)]/60">
      <div className="h-16 w-full px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Brand + SQLite Status */}
        <div className="flex items-center gap-3 lg:gap-4">
          <button
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <img
              alt="QA Agent Hub Logo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida/AEtjO1UEoQQrvwgYvOtBFDhsUPgsEWRG2rUn_OqPt39Jr4Ve5lxhuYaq1l8IsR6C_QC4IEm8_Bf3dZfpWxGC5K4ydc7bYMm69JYVWMRVzTz8t8_0SUxaEj8pcBN8E3MAoonJ2XS58xjdWXW-OdPFU2O9Aovk8t8lwA0e2PM6YntiCznxgTmFmkZxmTGQ5BuWsb-skgyE5z6H_-c2AmTQY56dL0Hp6971_5yDFZ11oAGQk-gB3sR3dqRA9tvStN4"
            />
            <span className="font-headline-md text-lg sm:text-xl text-[var(--color-on-surface)] font-bold tracking-tight">
              QA Agent Hub
            </span>
          </button>

          <div className="hidden xl:flex items-center gap-2">
            <span className="font-label-badge uppercase px-2 py-1 rounded bg-[var(--color-surface-container)] text-[var(--color-primary)] border border-[var(--color-surface-container-highest)]/50">
              SauceDemo Suite
            </span>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-highest)]/40">
              <span className="w-2 h-2 rounded-full bg-[var(--color-secondary)] animate-pulse"></span>
              <span className="font-code-sm text-xs text-[var(--color-on-surface-variant)]">
                SQLite: connected (local.db - 42.8 MB • {recordCount.toLocaleString()} rows)
              </span>
            </div>
          </div>
        </div>

        {/* Center: Navigation tabs */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-semibold shadow-sm'
                    : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Environment Info + Run Suite CTA + Notifications + Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden 2xl:flex items-center gap-2 px-2.5 py-1 rounded bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-highest)]/50">
            <span className="font-code-sm text-xs text-[var(--color-secondary)]">
              https://www.saucedemo.com
            </span>
            <span className="font-label-badge uppercase px-1.5 py-0.5 rounded bg-[var(--color-surface-container)] text-[var(--color-tertiary)] text-[10px]">
              Chromium 124
            </span>
          </div>

          <button
            onClick={onRunFullSuite}
            type="button"
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs sm:text-sm font-semibold hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)] transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base sm:text-lg">play_arrow</span>
            <span>Run Full Suite</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            type="button"
            className="flex items-center justify-center p-2 rounded-lg text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="material-symbols-outlined text-xl">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Notifications button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative flex items-center justify-center p-2 rounded-lg text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer"
              title="Audit Notifications"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[1.125rem] h-4 px-1 rounded-full bg-[var(--color-error)] text-[var(--color-on-error)] font-label-badge text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-highest)] shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 bg-[var(--color-surface-container)] border-b border-[var(--color-surface-container-highest)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--color-on-surface)]">Audit Notifications</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--color-error-container)] text-[var(--color-on-error-container)]">
                      {unreadCount} unread
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => setUnreadCount(0)}
                      className="text-xs text-[var(--color-primary)] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-[var(--color-surface-container-high)]">
                  {NOTIFICATIONS.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3 hover:bg-[var(--color-surface-container)] transition-colors cursor-pointer flex items-start gap-2.5"
                    >
                      <span
                        className={`material-symbols-outlined text-base mt-0.5 shrink-0 ${
                          notif.type === 'error'
                            ? 'text-[var(--color-error)]'
                            : notif.type === 'warning'
                            ? 'text-[var(--color-warning)]'
                            : notif.type === 'success'
                            ? 'text-[var(--color-secondary)]'
                            : 'text-[var(--color-tertiary)]'
                        }`}
                      >
                        {notif.type === 'error'
                          ? 'error'
                          : notif.type === 'warning'
                          ? 'warning'
                          : notif.type === 'success'
                          ? 'check_circle'
                          : 'info'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-[var(--color-on-surface)] truncate">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-[var(--color-outline)] shrink-0 font-mono ml-2">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--color-on-surface-variant)] mt-0.5 leading-snug line-clamp-2">
                          {notif.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2.5 bg-[var(--color-surface-container-lowest)] text-center border-t border-[var(--color-surface-container-high)]">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onTabChange('defect-issues');
                    }}
                    className="text-xs text-[var(--color-tertiary)] hover:underline font-mono"
                  >
                    View all 46 telemetry findings →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile avatar dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-1 pl-1 cursor-pointer group"
            >
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-[var(--color-tertiary)]/40 group-hover:ring-[var(--color-tertiary)] transition-all"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8qZvJOIVnH6StyAz1ICjFe6ywit-12eKpRRnpnSStONKWpI4bGYdUamSP3zgUkuEgaphSsWyFDufauUQ5h4ymYG9eJQVkzG9PhuIq0nxrXWYl1IcM8SPF4Li9KP2y8ADziUR3kZ36c2Xc4nKW4kqwOTpsB-7DWHYX_WdB-eUC7gPFGC5n8Fqx7u6qM0577E_dTzDdoaI1eeUnTgzwzqKUMYZZzZ96M7zvs7LgJmfQQfEKzY4ljVEM8w"
              />
              <span className="material-symbols-outlined text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-on-surface)] transition-colors text-sm">
                expand_more
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-highest)] shadow-2xl z-50 p-2 text-xs">
                <div className="px-3 py-2 border-b border-[var(--color-surface-container-high)] mb-1">
                  <p className="font-semibold text-[var(--color-on-surface)] text-sm">Sarah Jenkins</p>
                  <p className="text-[var(--color-outline)] text-[11px] font-mono">Lead QA Automation Architect</p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-[var(--color-surface-container)] text-[var(--color-secondary)] font-mono text-[10px]">
                    Role: Admin / SDET
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onTabChange('review-pins');
                  }}
                  className="w-full text-left px-3 py-1.5 rounded hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm text-[var(--color-tertiary)]">push_pin</span>
                  <span>My Dropped Review Pins (3)</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onTabChange('functional-tests');
                  }}
                  className="w-full text-left px-3 py-1.5 rounded hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm text-[var(--color-primary)]">terminal</span>
                  <span>Playwright Runner Config</span>
                </button>
                <div className="border-t border-[var(--color-surface-container-high)] my-1"></div>
                <div className="px-3 py-1 text-[10px] text-[var(--color-outline)]">
                  SQLite Cluster: 4 Worker Threads (PID 4912-4915)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav strip */}
      <div className="lg:hidden flex items-center justify-around bg-[var(--color-surface)] px-2 py-1.5 border-t border-[var(--color-surface-container-high)] overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap font-medium ${
              activeTab === item.id
                ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-semibold'
                : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
