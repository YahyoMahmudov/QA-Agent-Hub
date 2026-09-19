import React, { useState } from 'react';
import { NavigationTab } from '../types';
import { NOTIFICATIONS } from '../data/mockData';

interface HeaderProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onRunFullSuite: () => void;
  recordCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onRunFullSuite,
  recordCount,
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#000f21]/90 backdrop-blur-md border-b border-[#1b2b3f]/60">
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
            <span className="font-headline-md text-lg sm:text-xl text-[#d3e4fe] font-bold tracking-tight">
              QA Agent Hub
            </span>
          </button>

          <div className="hidden xl:flex items-center gap-2">
            <span className="font-label-badge uppercase px-2 py-1 rounded bg-[#102034] text-[#c0c1ff] border border-[#26364a]/50">
              SauceDemo Suite
            </span>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0b1c30] border border-[#26364a]/40">
              <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
              <span className="font-code-sm text-xs text-[#c7c4d7]">
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
                    ? 'bg-[#8083ff] text-[#0d0096] font-semibold shadow-sm'
                    : 'text-[#c7c4d7] hover:bg-[#102034] hover:text-[#d3e4fe]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Environment Info + Run Suite CTA + Notifications + Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden 2xl:flex items-center gap-2 px-2.5 py-1 rounded bg-[#0b1c30] border border-[#26364a]/50">
            <span className="font-code-sm text-xs text-[#4edea3]">
              https://www.saucedemo.com
            </span>
            <span className="font-label-badge uppercase px-1.5 py-0.5 rounded bg-[#102034] text-[#4cd7f6] text-[10px]">
              Chromium 124
            </span>
          </div>

          <button
            onClick={onRunFullSuite}
            type="button"
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded bg-[#8083ff] text-[#0d0096] text-xs sm:text-sm font-semibold hover:bg-[#c0c1ff] hover:text-[#1000a9] transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base sm:text-lg">play_arrow</span>
            <span>Run Full Suite</span>
          </button>

          {/* Notifications button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative flex items-center justify-center p-2 rounded-lg text-[#c7c4d7] hover:bg-[#102034] hover:text-[#d3e4fe] transition-colors cursor-pointer"
              title="Audit Notifications"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[1.125rem] h-4 px-1 rounded-full bg-[#ffb4ab] text-[#690005] font-label-badge text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#0b1c30] border border-[#26364a] shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 bg-[#102034] border-b border-[#26364a] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#d3e4fe]">Audit Notifications</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#93000a] text-[#ffdad6]">
                      {unreadCount} unread
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => setUnreadCount(0)}
                      className="text-xs text-[#c0c1ff] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-[#1b2b3f]">
                  {NOTIFICATIONS.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3 hover:bg-[#102034] transition-colors cursor-pointer flex items-start gap-2.5"
                    >
                      <span
                        className={`material-symbols-outlined text-base mt-0.5 shrink-0 ${
                          notif.type === 'error'
                            ? 'text-[#ffb4ab]'
                            : notif.type === 'warning'
                            ? 'text-amber-400'
                            : notif.type === 'success'
                            ? 'text-[#4edea3]'
                            : 'text-[#4cd7f6]'
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
                          <p className="text-xs font-semibold text-[#d3e4fe] truncate">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-[#908fa0] shrink-0 font-mono ml-2">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#c7c4d7] mt-0.5 leading-snug line-clamp-2">
                          {notif.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2.5 bg-[#000f21] text-center border-t border-[#1b2b3f]">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onTabChange('defect-issues');
                    }}
                    className="text-xs text-[#4cd7f6] hover:underline font-mono"
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
                className="w-8 h-8 rounded-full object-cover ring-1 ring-[#4cd7f6]/40 group-hover:ring-[#4cd7f6] transition-all"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8qZvJOIVnH6StyAz1ICjFe6ywit-12eKpRRnpnSStONKWpI4bGYdUamSP3zgUkuEgaphSsWyFDufauUQ5h4ymYG9eJQVkzG9PhuIq0nxrXWYl1IcM8SPF4Li9KP2y8ADziUR3kZ36c2Xc4nKW4kqwOTpsB-7DWHYX_WdB-eUC7gPFGC5n8Fqx7u6qM0577E_dTzDdoaI1eeUnTgzwzqKUMYZZzZ96M7zvs7LgJmfQQfEKzY4ljVEM8w"
              />
              <span className="material-symbols-outlined text-[#c7c4d7] group-hover:text-[#d3e4fe] transition-colors text-sm">
                expand_more
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0b1c30] border border-[#26364a] shadow-2xl z-50 p-2 text-xs">
                <div className="px-3 py-2 border-b border-[#1b2b3f] mb-1">
                  <p className="font-semibold text-[#d3e4fe] text-sm">Sarah Jenkins</p>
                  <p className="text-[#908fa0] text-[11px] font-mono">Lead QA Automation Architect</p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-[#102034] text-[#4edea3] font-mono text-[10px]">
                    Role: Admin / SDET
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onTabChange('review-pins');
                  }}
                  className="w-full text-left px-3 py-1.5 rounded hover:bg-[#102034] text-[#c7c4d7] flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm text-[#4cd7f6]">push_pin</span>
                  <span>My Dropped Review Pins (3)</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onTabChange('functional-tests');
                  }}
                  className="w-full text-left px-3 py-1.5 rounded hover:bg-[#102034] text-[#c7c4d7] flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm text-[#c0c1ff]">terminal</span>
                  <span>Playwright Runner Config</span>
                </button>
                <div className="border-t border-[#1b2b3f] my-1"></div>
                <div className="px-3 py-1 text-[10px] text-[#908fa0]">
                  SQLite Cluster: 4 Worker Threads (PID 4912-4915)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav strip */}
      <div className="lg:hidden flex items-center justify-around bg-[#031427] px-2 py-1.5 border-t border-[#1b2b3f] overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap font-medium ${
              activeTab === item.id
                ? 'bg-[#8083ff] text-[#0d0096] font-semibold'
                : 'text-[#c7c4d7] hover:text-[#d3e4fe]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
