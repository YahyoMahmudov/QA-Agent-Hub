import React, { useState } from 'react';
import { ReviewPin, IssueSeverity } from '../types';

interface ReviewPinsViewProps {
  pins: ReviewPin[];
  onAddPin: (pin: ReviewPin) => void;
  onShowToast: (message: string, icon?: string) => void;
  onNavigateToIssues: () => void;
}

export const ReviewPinsView: React.FC<ReviewPinsViewProps> = ({
  pins,
  onAddPin,
  onShowToast,
  onNavigateToIssues,
}) => {
  const [selectedPinId, setSelectedPinId] = useState<string | null>('#PIN-01');
  const [pageFilter, setPageFilter] = useState<'ALL' | 'PLP' | 'PDP' | 'CHECKOUT'>('ALL');
  const [showBookmarkletCode, setShowBookmarkletCode] = useState(false);
  const [isDropMode, setIsDropMode] = useState(false);

  // Form states for manual pin creation
  const [newTitle, setNewTitle] = useState('');
  const [newSelector, setNewSelector] = useState('img.inventory_item_img');
  const [newSeverity, setNewSeverity] = useState<IssueSeverity>('high');
  const [newDescription, setNewDescription] = useState('');

  const bookmarkletCode = `javascript:(function(){const s=document.createElement('script');s.src='https://qa-agent-hub.local/review-pins-injector.js';s.onload=function(){window.initQAPinCollector('https://qa-agent-hub.local/api/pins');};document.body.appendChild(s);})();`;

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    onShowToast('Bookmarklet snippet copied! Drag or paste into your bookmarks bar', 'bookmark');
  };

  const handleCreatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      onShowToast('Please enter a pin title', 'error');
      return;
    }

    const newPin: ReviewPin = {
      id: `#PIN-0${pins.length + 1}`,
      title: newTitle,
      description: newDescription || 'Manual visual inspection pin recorded during QA audit.',
      xpath: `//${newSelector.replace('.', '[@class="')}"]`,
      targetElement: newSelector,
      page: 'PLP',
      severity: newSeverity,
      author: 'Sarah (Lead QA)',
      timeAgo: 'Just now',
      status: 'open',
      jiraKey: `PROJ-${1043 + pins.length}`,
      coords: { x: 300, y: 200 },
    };

    onAddPin(newPin);
    setSelectedPinId(newPin.id);
    setNewTitle('');
    setNewDescription('');
    setIsDropMode(false);
    onShowToast(`Created review pin ${newPin.id}: "${newPin.title}"`, 'push_pin');
  };

  const filteredPins = pins.filter((p) => {
    if (pageFilter === 'ALL') return true;
    return p.page === pageFilter;
  });

  const selectedPin = pins.find((p) => p.id === selectedPinId) || pins[0];

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Breadcrumb & Heading */}
      <div>
        <div className="flex items-center gap-2 text-xs font-code-sm text-[var(--color-outline)] mb-1">
          <span>QA Automation Hub</span>
          <span>/</span>
          <span>Visual Quality Inspector</span>
          <span>/</span>
          <span className="text-[var(--color-tertiary)]">In-Browser Review Pins</span>
        </div>
        <h1 className="font-headline-xl text-2xl sm:text-3xl font-bold text-[var(--color-on-surface)]">
          Visual Review Pins & Bookmarklet Injector
        </h1>
        <p className="font-body-md text-sm text-[var(--color-on-surface-variant)] mt-1">
          Drop visual QA pins directly inside the live SauceDemo DOM. Automatically captures XPath, computed styles, viewport coordinates, and syncs into the SQLite test vault.
        </p>
      </div>

      {/* Bookmarklet installation banner */}
      <div className="bg-[var(--color-surface-container)] border border-[var(--color-surface-container-highest)] rounded-xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-container)]/20 text-[var(--color-primary-container)] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">bookmark_add</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base font-bold text-[var(--color-on-surface)]">
                Install One-Click QA Bookmarklet
              </h3>
              <p className="font-body-md text-xs text-[var(--color-on-surface-variant)] mt-0.5">
                Drag the button below directly to your browser's bookmarks bar, or copy the JavaScript snippet to inject review pin overlays onto any page of <span className="text-[var(--color-tertiary)] font-mono">saucedemo.com</span>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
            {/* Draggable bookmarklet link */}
            <a
              href={bookmarkletCode}
              onClick={(e) => {
                e.preventDefault();
                handleCopyBookmarklet();
              }}
              draggable="true"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs font-bold hover:bg-[var(--color-primary)] transition-all cursor-grab active:cursor-grabbing shadow-md select-none"
              title="Drag this button to your bookmarks toolbar"
            >
              <span className="material-symbols-outlined text-base">push_pin</span>
              <span>+ Pin SauceDemo Defect (Drag to Bar)</span>
            </a>

            <button
              onClick={handleCopyBookmarklet}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container-high)] text-[var(--color-primary)] border border-[var(--color-surface-container-highest)] text-xs font-code-sm transition-all"
            >
              <span className="material-symbols-outlined text-base">content_copy</span>
              <span>Copy JS Code</span>
            </button>

            <button
              onClick={() => setShowBookmarkletCode(!showBookmarkletCode)}
              className="p-2 rounded-lg bg-[var(--color-surface-container-low)] text-[var(--color-outline)] hover:text-[var(--color-on-surface)] border border-[var(--color-surface-container-highest)]"
              title="Toggle code view"
            >
              <span className="material-symbols-outlined text-base">
                {showBookmarkletCode ? 'unfold_less' : 'code'}
              </span>
            </button>
          </div>
        </div>

        {/* Expandable Bookmarklet code box */}
        {showBookmarkletCode && (
          <div className="mt-4 pt-3 border-t border-[var(--color-surface-container-high)] font-mono text-xs">
            <span className="text-[var(--color-outline)] block mb-1 text-[11px]">Bookmarklet Source Code:</span>
            <div className="p-3 rounded bg-[var(--color-surface)] border border-[var(--color-surface-container-high)] text-[var(--color-tertiary)] overflow-x-auto whitespace-pre-wrap select-all">
              {bookmarkletCode}
            </div>
          </div>
        )}
      </div>

      {/* Main 12-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Interactive Simulated SauceDemo Viewport */}
        <div className="lg:col-span-7 bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-surface-container-high)]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-tertiary)]">devices</span>
              <h2 className="font-headline-md text-base font-bold text-[var(--color-on-surface)]">
                Simulated SauceDemo Viewport
              </h2>
            </div>
            <button
              onClick={() => {
                setIsDropMode(!isDropMode);
                if (!isDropMode) {
                  onShowToast('Click anywhere on the viewport below to position your review pin');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                isDropMode
                  ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)] animate-pulse'
                  : 'bg-[var(--color-surface-container)] text-[var(--color-secondary)] hover:bg-[var(--color-surface-container-high)]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {isDropMode ? 'pin_drop' : 'add_location_alt'}
              </span>
              <span>{isDropMode ? 'Cancel Drop Mode' : '+ Drop New Pin'}</span>
            </button>
          </div>

          {/* Browser Mockup Chrome */}
          <div className="mt-4 rounded-lg overflow-hidden border border-[var(--color-surface-container-highest)] bg-[var(--color-surface-container-lowest)] flex flex-col flex-1 shadow-2xl">
            {/* Browser Address Bar */}
            <div className="px-3 py-2 bg-[var(--color-surface-container)] border-b border-[var(--color-surface-container-highest)] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-error)]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-warning)]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-secondary)]"></span>
              </div>

              <div className="flex-1 max-w-sm mx-4 px-3 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-surface-container-highest)] text-[var(--color-secondary)] text-[11px] truncate flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-[var(--color-outline)]">lock</span>
                <span>https://www.saucedemo.com/inventory.html</span>
              </div>

              <div className="flex items-center gap-2 text-[var(--color-outline)]">
                <span className="material-symbols-outlined text-sm">refresh</span>
                <span className="text-[10px]">100%</span>
              </div>
            </div>

            {/* Interactive Viewport Canvas */}
            <div
              onClick={(e) => {
                if (isDropMode) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.round(e.clientX - rect.left);
                  const y = Math.round(e.clientY - rect.top);
                  setNewTitle(`Element at [X:${x}, Y:${y}]`);
                  setNewSelector(`div.inventory_container div.inventory_item:nth-child(1)`);
                  setNewDescription(`Visual inspection pinned at coordinate [${x}, ${y}] inside inventory viewport.`);
                  onShowToast(`Coordinates recorded: [X:${x}, Y:${y}]. Complete form to save.`, 'location_on');
                }
              }}
              className={`relative p-4 bg-[var(--color-surface)] overflow-hidden min-h-[420px] select-none ${
                isDropMode ? 'cursor-crosshair' : 'cursor-default'
              }`}
            >
              {/* Simulated SauceDemo Top Nav inside Canvas */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--color-surface-container-high)] relative">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[var(--color-on-surface)] text-lg">menu</span>
                  <span className="font-bold tracking-tight text-[var(--color-on-surface)] font-headline-md text-sm">
                    Swag Labs
                  </span>
                </div>

                {/* Cart link with Pin #03 */}
                <div className="relative">
                  <span className="material-symbols-outlined text-[var(--color-on-surface)] text-xl">
                    shopping_cart
                  </span>
                  <span className="absolute -top-1 -right-2 bg-[var(--color-error)] text-[var(--color-on-error)] font-mono text-[9px] font-bold px-1 rounded-full">
                    3
                  </span>

                  {/* Pin 03 Anchor */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPinId('#PIN-03');
                    }}
                    className={`absolute -top-3 -right-6 w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shadow-lg transition-transform hover:scale-125 cursor-pointer ${
                      selectedPinId === '#PIN-03'
                        ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] ring-2 ring-white scale-110'
                        : 'bg-[var(--color-secondary)] text-[var(--color-on-secondary)]'
                    }`}
                    title="Pin #03: Badge count alignment"
                  >
                    03
                  </button>
                </div>
              </div>

              {/* Simulated Products Grid inside Canvas */}
              <div className="grid grid-cols-2 gap-4">
                {/* Product 1: Backpack with Pin #01 */}
                <div className="p-3 rounded-lg bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] relative group">
                  {/* Pin 01 Anchor */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPinId('#PIN-01');
                    }}
                    className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shadow-lg transition-transform hover:scale-125 cursor-pointer ${
                      selectedPinId === '#PIN-01'
                        ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] ring-2 ring-white scale-110'
                        : 'bg-[var(--color-error)] text-[var(--color-on-error)] animate-bounce'
                    }`}
                    title="Pin #01: Broken Product Image 404"
                  >
                    01
                  </button>

                  <div className="h-28 bg-[var(--color-surface-container-lowest)] rounded flex items-center justify-center relative overflow-hidden border border-[var(--color-error-container)]/50">
                    <img
                      alt="Sauce Labs Backpack"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvtE7afTIznNLeVG8oWcdeO5oOoFoVcPFQGRPJgpAdn52--oIZdgujNlH7jeV8hdNOd-SqNcMLI5ta0H0JrYt4Tlx6XHqL7jn6RBLuBWjeVrtNczg_1OVJhyBAV_ICrWE_FTz5RSXnjKNS_UeqTWfe31pOYnG9xZYXb0L4SRqnQzOhdMj2gmTjbKM-JJaXfAhlXJGzcWE6NoaLT2OTBGyg01Fg79iUOJKI2eS1gsAQGeDm7hQPZt9gyw"
                      className="h-24 w-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-[var(--color-error-container)]/40 flex items-center justify-center">
                      <span className="font-mono text-[10px] text-[var(--color-on-error-container)] font-bold bg-[var(--color-error-container)] px-1.5 py-0.5 rounded border border-[var(--color-error)]/40">
                        HTTP 404
                      </span>
                    </div>
                  </div>

                  <h4 className="font-bold text-xs text-[var(--color-on-surface)] mt-2">Sauce Labs Backpack</h4>
                  <p className="text-[10px] text-[var(--color-outline)] line-clamp-2 mt-0.5">
                    carry.allTheThings() with the sleek, streamlined Sly Pack.
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-mono text-xs font-bold text-[var(--color-secondary)]">$29.99</span>
                    <span className="text-[10px] font-mono text-[var(--color-error)] bg-[var(--color-error-container)]/20 px-1 rounded">
                      Remove
                    </span>
                  </div>
                </div>

                {/* Product 2: Bike Light with Pin #02 */}
                <div className="p-3 rounded-lg bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] relative group">
                  {/* Pin 02 Anchor */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPinId('#PIN-02');
                    }}
                    className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shadow-lg transition-transform hover:scale-125 cursor-pointer ${
                      selectedPinId === '#PIN-02'
                        ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] ring-2 ring-white scale-110'
                        : 'bg-[var(--color-tertiary)] text-[var(--color-on-tertiary)]'
                    }`}
                    title="Pin #02: Duplicate Graphic Inspection"
                  >
                    02
                  </button>

                  <div className="h-28 bg-[var(--color-surface-container-lowest)] rounded flex items-center justify-center relative overflow-hidden border border-[var(--color-tertiary-container)]/40">
                    <img
                      alt="Sauce Labs Bike Light"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwYvsWC-5HyeY6Lqm7q6QtqsiZTi12tZVCkpvYMg6xaqXctxP27APMuSY1UqMgHPQfbU_6ZPo3mRNKpHvl5V15PUTaRc1WFbtG40CQUyH9mHm0Fdv3witJy7FStIYsCvyeR-jaaW28JFCWbxFqnF3E6FM9YaexTlA7T4Ql50gFvg62FCglXthwTkvdoQzHTQH52X_cuUazxx7QsOk2lwfQuJymV3r34gd9KZiD1OA6ywfQamerfoU-Vg"
                      className="h-24 w-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <h4 className="font-bold text-xs text-[var(--color-on-surface)] mt-2">Sauce Labs Bike Light</h4>
                  <p className="text-[10px] text-[var(--color-outline)] line-clamp-2 mt-0.5">
                    A red light isn't the desired state in testing but it is with this bike light.
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-mono text-xs font-bold text-[var(--color-secondary)]">$9.99</span>
                    <span className="text-[10px] font-mono text-[var(--color-primary-container)] bg-[var(--color-surface-container)] px-1.5 py-0.5 rounded">
                      Add to cart
                    </span>
                  </div>
                </div>
              </div>

              {/* Pin Active Inspector Tooltip Popover inside Canvas */}
              {selectedPin && (
                <div className="mt-4 p-3 rounded-lg bg-[var(--color-surface-container-low)]/95 border border-[var(--color-primary-container)]/60 shadow-xl flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[var(--color-primary-container)]">{selectedPin.id}</span>
                      <span className="font-bold text-[var(--color-on-surface)]">{selectedPin.title}</span>
                      <span
                        className={`font-label-badge text-[9px] px-1.5 py-0.2 rounded uppercase ${
                          selectedPin.severity === 'critical'
                            ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]'
                            : 'bg-[var(--color-surface-container)] text-[var(--color-tertiary)]'
                        }`}
                      >
                        {selectedPin.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-on-surface-variant)] mt-1">{selectedPin.description}</p>
                    <code className="text-[10px] font-mono text-[var(--color-tertiary)] block mt-1">
                      XPath: {selectedPin.xpath}
                    </code>
                  </div>

                  <button
                    onClick={() => {
                      onShowToast(`Opened Jira reference ${selectedPin.jiraKey}`);
                    }}
                    className="px-2.5 py-1 rounded bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-mono text-[11px] font-bold shrink-0 hover:bg-[var(--color-primary)]"
                  >
                    {selectedPin.jiraKey}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Manual Pin Creation & Active Pins List */}
        <div className="lg:col-span-5 space-y-6">
          {/* Form: Manual Pin Dropper / Creator */}
          <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-xl p-5">
            <h2 className="font-headline-md text-base font-bold text-[var(--color-on-surface)] pb-3 border-b border-[var(--color-surface-container-high)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary-container)]">edit_location</span>
              <span>Manual Pin Dropper / Inspector</span>
            </h2>

            <form onSubmit={handleCreatePin} className="mt-4 space-y-3 font-code-sm text-xs">
              <div>
                <label className="block text-[var(--color-outline)] mb-1">Defect Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Broken CTA button on inventory item"
                  className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-container-high)] text-[var(--color-on-surface)] focus:border-[var(--color-primary-container)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[var(--color-outline)] mb-1">Target Element / CSS Selector</label>
                <input
                  type="text"
                  value={newSelector}
                  onChange={(e) => setNewSelector(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-container-high)] text-[var(--color-tertiary)] font-mono focus:border-[var(--color-primary-container)] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--color-outline)] mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as IssueSeverity)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-container-high)] text-[var(--color-on-surface)] focus:border-[var(--color-primary-container)] focus:outline-hidden"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--color-outline)] mb-1">Page Scope</label>
                  <select
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-container-high)] text-[var(--color-on-surface)] focus:border-[var(--color-primary-container)] focus:outline-hidden"
                  >
                    <option value="PLP">PLP (/inventory.html)</option>
                    <option value="PDP">PDP (/inventory-item.html)</option>
                    <option value="CHECKOUT_1">Checkout Step 1</option>
                    <option value="CHECKOUT_2">Checkout Step 2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[var(--color-outline)] mb-1">Observation Notes</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Computed style misalignment, 404 response, or unexpected behavior..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-container-high)] text-[var(--color-on-surface)] focus:border-[var(--color-primary-container)] focus:outline-hidden resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-bold text-xs hover:bg-[var(--color-primary)] transition-all cursor-pointer shadow-md"
              >
                + Save Pin to SQLite Vault
              </button>
            </form>
          </div>

          {/* Active Review Pins in Vault */}
          <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)] rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-surface-container-high)]">
              <div>
                <h2 className="font-headline-md text-base font-bold text-[var(--color-on-surface)]">
                  Active Review Pins ({filteredPins.length})
                </h2>
                <p className="font-code-sm text-xs text-[var(--color-outline)]">
                  Visual defect anchors registered in SQLite local.db
                </p>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1 bg-[var(--color-surface)] p-0.5 rounded border border-[var(--color-surface-container-high)]">
                {(['ALL', 'PLP', 'PDP', 'CHECKOUT'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPageFilter(mode)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      pageFilter === mode
                        ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-bold'
                        : 'text-[var(--color-outline)] hover:text-[var(--color-on-surface)]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {filteredPins.map((pin) => (
                <div
                  key={pin.id}
                  onClick={() => setSelectedPinId(pin.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedPinId === pin.id
                      ? 'bg-[var(--color-surface-container)] border-[var(--color-primary-container)]'
                      : 'bg-[var(--color-surface)] border-[var(--color-surface-container-high)] hover:border-[var(--color-surface-container-highest)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[var(--color-primary-container)]">
                        {pin.id}
                      </span>
                      <span className="font-bold text-xs text-[var(--color-on-surface)] truncate max-w-[160px]">
                        {pin.title}
                      </span>
                    </div>

                    <span
                      className={`font-mono text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                        pin.severity === 'critical'
                          ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]'
                          : pin.severity === 'high'
                          ? 'bg-[var(--color-warning)]/30 text-[var(--color-warning)]'
                          : 'bg-[var(--color-on-tertiary)] text-[var(--color-tertiary)]'
                      }`}
                    >
                      {pin.severity}
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--color-on-surface-variant)] mt-1 line-clamp-2">
                    {pin.description}
                  </p>

                  <div className="mt-2 pt-2 border-t border-[var(--color-surface-container-high)]/60 flex items-center justify-between text-[10px] font-mono text-[var(--color-outline)]">
                    <span>By: {pin.author}</span>
                    <span className="text-[var(--color-tertiary)]">{pin.timeAgo}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onNavigateToIssues}
              className="w-full mt-4 py-2 rounded-lg bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] text-[var(--color-primary)] border border-[var(--color-surface-container-highest)] text-xs font-semibold text-center transition-all"
            >
              Inspect in Defect Issues Repository →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
