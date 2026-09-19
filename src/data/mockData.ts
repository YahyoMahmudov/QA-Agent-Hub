import { DefectIssue, ReviewPin, InventoryInspectionItem, TestExecutionStep, TestRunItem } from '../types';

export const INITIAL_DEFECT_ISSUES: DefectIssue[] = [
  {
    id: 'ISS-1042',
    title: 'Broken product image 404 on PLP for Sauce Labs Backpack',
    diagnostic: 'HTTP 404 • GET /static/media/sauce-backpack-1200x1500.0a0b85a3.jpg • DOM: img.inventory_item_img',
    area: 'PLP',
    firstSeen: '2025-05-10 09:12',
    lastSeen: '10 mins ago',
    source: 'Content Scraper',
    severity: 'high',
    status: 'open',
    locator: '.inventory_item_img',
    persona: 'problem_user',
    traceArtifact: '/artifacts/scrapes/scrape_8941_plp_backpack.json',
  },
  {
    id: 'ISS-1041',
    title: 'Checkout Step 7: Last Name input field rejected for problem_user',
    diagnostic: "TimeoutError: locator('#last-name').fill() exceeded 5000ms • State: editable=false",
    area: 'Checkout Flow',
    firstSeen: '2025-05-10 08:30',
    lastSeen: '15 mins ago',
    source: 'Playwright',
    severity: 'critical',
    status: 'open',
    locator: '#last-name',
    persona: 'problem_user',
    traceArtifact: 'run_8941_step7.zip',
    snapshotUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4MVkefb7lALO_fpBospcm8y5BrzT4Mt2wla_hj5ihJAT3hTjTxXxA4vmU-KseN26gAgsr-IfNoJxcD8O2p4WcMmlUWZnkijsnTec3yue-ohJaHjIwAFHEbJ6-8Bs2BYPUYhOcrwDO45cCbxus4AR8o29heEQhS_T-AwaNXYaanuAj8jCwnR6_5cLcn7YSc7NBllHl_7l69_UIKlbrX75u8Z3MjaAkE4B3SxSa4A8MZA9h_xDzbC60wQ',
  },
  {
    id: 'ISS-1040',
    title: 'Duplicate asset reuse: Bike light displaying backpack graphic',
    diagnostic: 'Visual SHA256 Collision match • item_0_img_link matches item_4_img_link',
    area: 'PLP',
    firstSeen: '2025-05-09 16:45',
    lastSeen: '1 hr ago',
    source: 'Content Scraper',
    severity: 'medium',
    status: 'in_progress',
    locator: '#item_0_img_link',
    persona: 'problem_user',
  },
  {
    id: 'ISS-1039',
    title: 'Zero price displayed ($0.00) on Sauce Labs Bolt T-Shirt PDP',
    diagnostic: 'Scraped .inventory_details_price returned "$0" • Expected float >= 9.99',
    area: 'PDP',
    firstSeen: '2025-05-09 14:20',
    lastSeen: '2 hrs ago',
    source: 'Content Scraper',
    severity: 'high',
    status: 'open',
    locator: '.inventory_details_price',
    persona: 'problem_user',
  },
  {
    id: 'ISS-1038',
    title: 'Broken PDP navigation link on Onesie footer',
    diagnostic: 'Review Pin #RP-44 pinned at coords [X:412, Y:890] • Verified fixed in patch 1.14',
    area: 'PDP',
    firstSeen: '2025-05-08 11:00',
    lastSeen: 'Yesterday',
    source: 'Review Pin',
    severity: 'low',
    status: 'resolved',
    locator: 'footer.footer_copy',
  },
  {
    id: 'ISS-1037',
    title: 'Error User checkout finish button throws 404 payload',
    diagnostic: 'POST /checkout-complete.html HTTP 404 • playwright action failed: page.waitForURL()',
    area: 'Checkout Flow',
    firstSeen: '2025-05-08 09:15',
    lastSeen: 'Yesterday',
    source: 'Playwright',
    severity: 'critical',
    status: 'fixed',
    locator: '#finish',
    persona: 'error_user',
  },
];

export const INITIAL_REVIEW_PINS: ReviewPin[] = [
  {
    id: '#PIN-01',
    title: 'Broken Product Image',
    description: 'Image src pointing to sl-404.jpg returns 404 in console during Playwright page evaluation.',
    xpath: "//div[@class='inventory_item'][1]//img",
    targetElement: "img.inventory_item_img",
    page: 'PLP',
    severity: 'critical',
    author: 'Sarah (Lead QA)',
    timeAgo: '14 mins ago',
    status: 'open',
    jiraKey: 'PROJ-1042',
    coords: { x: 120, y: 190 },
  },
  {
    id: '#PIN-02',
    title: 'Duplicate Graphic Inspection',
    description: 'Verify if image matches bike light or backpack catalog thumbnail before production rollout.',
    xpath: "//div[@class='inventory_item'][2]//div[@class='inventory_item_price']",
    targetElement: ".inventory_item_price",
    page: 'PLP',
    severity: 'medium',
    author: 'Alex (SDET)',
    timeAgo: '1 hr ago',
    status: 'open',
    jiraKey: 'PROJ-1040',
    coords: { x: 480, y: 340 },
  },
  {
    id: '#PIN-03',
    title: 'Badge count alignment',
    description: 'Counter text slightly misaligned on mobile viewport (1px shift downwards under Safari 17).',
    xpath: "//a[@class='shopping_cart_link']/span",
    targetElement: ".shopping_cart_badge",
    page: 'PLP',
    severity: 'low',
    author: 'Sarah (Lead QA)',
    timeAgo: '3 hrs ago',
    status: 'open',
    jiraKey: 'PROJ-1033',
    coords: { x: 890, y: 30 },
  },
];

export const INVENTORY_ITEMS: InventoryInspectionItem[] = [
  {
    sku: 'SAUCE-BP-001',
    name: 'Sauce Labs Backpack',
    statusBadge: 'HTTP 404',
    statusBadgeType: 'error',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqukJWff8wm_pjVSUKR-nqQ30x9o95GI_WxJY79yvkwndsz8n5jEubZcVJXZD-J0-tQguI4IMMDk12KXIa6_P1QfUiaqVD7IfKDHEw8Hhb62DvcbyhttPkYt8u1dP_2INdsrjftYOy95U8o3Zzy8CjmVECP6e9Qs1eHpaG8Mq981u_08Q3xxRNY-PW8RG1i7TaDKzvka_y_O7GBA411RrAXp5bYroeqVu0wd1L6QWHUxW_bK43mYDXGA',
    imageAlt: 'Sauce Labs Backpack with broken asset indicator',
    isGlitchOr404: true,
    glitchLabel: 'sl-404.16f35e69.jpg - Target asset returned status code 404',
    livePrice: '$29.99',
    priceNote: '(Valid)',
    secondaryLabel: 'First Seen',
    secondaryValue: '2 hrs ago (Auto-sync)',
    severity: 'Medium',
    scope: 'PLP + PDP',
    jiraKey: 'BACKPACK-404',
    snippetText: `h2. SauceDemo Asset 404: Sauce Labs Backpack\n*Persona*: problem_user\n*URL*: https://www.saucedemo.com/inventory.html\n*Failed Asset*: sl-404.16f35e69.jpg (HTTP 404 Not Found)`
  },
  {
    sku: 'SAUCE-BL-002',
    name: 'Sauce Labs Bike Light',
    statusBadge: 'Asset Reused',
    statusBadgeType: 'tertiary',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXeJD-v30hCn_KjtiulohX2nMyhgAjZeG0BeLF5Ms_d-9dsMOAU1Ssi0rohAGae73RkRjNFEGgh91y4eN2s_20YVrI6CNgJfZZCitiPtywFKS_MHHz3GdXy_QJju_a-HVM5p8v--ShrFW-lHKrC6rV7v-YOo0OW57gk8wIFQqfDJK454F5nlmWx3TmZJtLwRrea2ZelNkurZCUJ0VRsklKfdIgE54ktDUiayfaGvzcvfhSmzv-4_UE9Q',
    imageAlt: 'Comparison split audit view showing reused asset collision',
    isGlitchOr404: true,
    glitchLabel: 'MD5 Collision Detected: Bike Light renders sl-404.jpg instead of bike-light-1200x1500.jpg',
    livePrice: '$9.99',
    priceNote: '(Valid)',
    secondaryLabel: 'Hash Check',
    secondaryValue: 'e83a...b09c (DUP)',
    severity: 'Low / Glitch',
    scope: 'PLP Viewport',
    jiraKey: 'BIKELIGHT-HASH',
    snippetText: `h2. SauceDemo Image Hash Conflict: Bike Light\n*Persona*: problem_user\n*Issue*: Image matches Backpack hash instead of light accessory asset`
  },
  {
    sku: 'SAUCE-TS-003',
    name: 'Sauce Labs Bolt T-Shirt',
    statusBadge: 'High Severity',
    statusBadgeType: 'error',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2t0mgfh1jFNlCyyEuoUIeeft2YIhmJfvI4cGUjgtisv7-G4OLsM826whu7luOVwoFmQuZkc8D_dcT-7WbAOU78zBrv9rcZ-G2COxMbGCamTYSDGeWC9f0KFsegsZSyRyIjvoq7ZyJNV9YNRh4LzxqN6n2Kl23ktSf_Nqg2XT-vZWYo8k2TsUh_tCQz2c5WJwj00kGzOjcMy5f0Kk6VvNYinM5NfnxL1NgGRRSve6d1jn8XYO9YIQvig',
    imageAlt: 'Sauce Labs Bolt T-Shirt with PDP price $0.00 zero price glitch',
    isGlitchOr404: true,
    glitchLabel: 'PDP Price = $0.00 (Broken Image + Zero Price assertion trigger)',
    livePrice: '$0.00',
    priceNote: '(Zero Price)',
    secondaryLabel: 'Asset State',
    secondaryValue: 'Broken (HTTP 404)',
    severity: 'High / Critical',
    scope: 'PDP Route Impacted',
    jiraKey: 'BOLT-CRITICAL',
    snippetText: `h2. SauceDemo Critical PDP Zero Price: Bolt T-Shirt\n*Persona*: problem_user\n*Selector*: .inventory_details_price\n*Detected Value*: $0.00`
  },
  {
    sku: 'SAUCE-FJ-004',
    name: 'Sauce Labs Fleece Jacket',
    statusBadge: 'HTTP 404',
    statusBadgeType: 'error',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA12LjGHCaxwh9D9uH_pfujcR3LB-g8wN2kAdW2TibM9BMQ0iciMJH8N39lCM52l9gyj7UXcCSXfTzJj8q7GHsJ-LEmIitzoxAaFf7zOS16bSxK97gB2ydTK-8tURjRvpE0rsin85G-ugU1M6P7GiT06pLrpiWlxwxdimTPR0BzSEWZA0Usg7CnEG4tui2MuHIO0k6ir8dmz0OafU2QjQ6FUpom1PyPrFhzg2mV8kjZfD8amgqbyKWG4w',
    imageAlt: 'Sauce Labs Fleece Jacket missing asset',
    isGlitchOr404: true,
    glitchLabel: 'sauce-pullover-404.jpg - Missing source asset on static CDN',
    livePrice: '$49.99',
    priceNote: '(Valid)',
    secondaryLabel: 'Area',
    secondaryValue: 'Inventory Grid PLP',
    severity: 'Medium',
    scope: 'PLP Viewport',
    jiraKey: 'FLEECE-404',
    snippetText: `h2. SauceDemo Asset 404: Fleece Jacket\n*Persona*: problem_user\n*Missing Asset*: sauce-pullover-404.jpg`
  },
  {
    sku: 'SAUCE-ON-005',
    name: 'Sauce Labs Onesie',
    statusBadge: 'Clean / Pass',
    statusBadgeType: 'success',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmz9jmSHOVYnhPME_pjJpyeqcDZzAaglmthOGqUkOEe4pOcy5JVHAhU3cwoFfht14X8-d-zUI4UAqft3G4o34yGZuMpm-iB3D9B1OBdKM1waBI8kP3YQB-cl7Za0Qvbr4VdKK0NweHGgIP5uUzCBYXzln3fKpSGt3gh21yl-kAjiux_Rwjb3yWCOxytw5-83kTsKl_FADyUtXsScUWzUIw5VPkdEHLI2fWt70pAwPQ0TPkDEwuS7m5lg',
    imageAlt: 'Sauce Labs Onesie high resolution valid studio photo',
    isGlitchOr404: false,
    glitchLabel: 'red-onesie-1200x1500.jpg 200 OK',
    livePrice: '$7.99',
    priceNote: '(Valid)',
    secondaryLabel: 'Image Integrity',
    secondaryValue: 'SHA256 Match',
    severity: 'Clean',
    scope: 'Ready For Prod',
    jiraKey: 'ONESIE-PASS',
    snippetText: `h2. SauceDemo Asset Verified: Onesie\n*Status*: 200 OK Clean Verification`
  },
  {
    sku: 'SAUCE-TAT-006',
    name: 'Test.allTheThings() T-Shirt',
    statusBadge: 'HTTP 404',
    statusBadgeType: 'error',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFCbmTcOMmvxhU4jxTlFDCnt9im4wukn5dP4BZzS6G2qACshdKoPif6TxrUL-1VYdJKLoxhX1ZI6GBTmpewUq2b6i81D50mBVK6x0Au-nUVNRXjUjugzjEKGD1fV8GILkEYcpZd9e6X_PB6Ib611kb_0wqPOIrB46gsLh_FbTRgkX-kz95Ra3SpLGS4V5ErBzXpS1rC_EJMbmjlGPUhH1tSNq47oxo1eWwGa9JumbI0T3UJMmk0uLFpg',
    imageAlt: 'Test.allTheThings red t-shirt 404 asset glitch',
    isGlitchOr404: true,
    glitchLabel: 'red-tatt-404.jpg - Image element rendering failed on PLP',
    livePrice: '$15.99',
    priceNote: '(Valid)',
    secondaryLabel: 'Area',
    secondaryValue: 'PLP Product Card',
    severity: 'Medium',
    scope: 'PLP Viewport',
    jiraKey: 'TATT-404',
    snippetText: `h2. SauceDemo Asset 404: Test.allTheThings T-Shirt\n*Persona*: problem_user\n*Missing Asset*: red-tatt-404.jpg`
  }
];

export const WATERFALL_STEPS: TestExecutionStep[] = [
  {
    stepNumber: '01',
    action: 'GOTO',
    code: 'page.goto("https://www.saucedemo.com")',
    duration: '340ms',
    status: 'passed'
  },
  {
    stepNumber: '02',
    action: 'FILL',
    code: 'page.fill("#user-name", "problem_user") & page.fill("#password", "secret_sauce")',
    duration: '180ms',
    status: 'passed'
  },
  {
    stepNumber: '03',
    action: 'CLICK',
    code: 'page.click("#login-button")',
    duration: '420ms',
    status: 'passed',
    screenshot: true
  },
  {
    stepNumber: '04',
    action: 'CLICK',
    code: 'page.click("[data-test=\'add-to-cart-sauce-labs-backpack\']")',
    duration: '120ms',
    status: 'passed'
  },
  {
    stepNumber: '05',
    action: 'CLICK',
    code: 'page.click(".shopping_cart_link")',
    duration: '150ms',
    status: 'passed'
  },
  {
    stepNumber: '06',
    action: 'CLICK',
    code: 'page.click("[data-test=\'checkout\']")',
    duration: '110ms',
    status: 'passed'
  },
  {
    stepNumber: '07',
    action: 'FAILED ACTION',
    code: 'page.fill("#last-name", "Tester")',
    duration: '5000ms (Timeout)',
    status: 'failed',
    errorLog: `TimeoutError: locator.fill: Timeout 5000ms exceeded.
=========================== logs ===========================
waiting for locator('#last-name')
  locator resolved to <input class="input_error form_input" placeholder="Last Name" type="text" id="last-name"/>
element is visible, enabled and stable
scrolling into view if needed
element is not editable - problem_user simulated defect locks the input component value state.
============================================================`
  },
  {
    stepNumber: '08',
    action: 'CLICK',
    code: 'page.click("#continue")',
    duration: '0ms',
    status: 'skipped'
  },
  {
    stepNumber: '09',
    action: 'EXPECT',
    code: 'expect(page.locator(".summary_total_label")).toBeVisible()',
    duration: '0ms',
    status: 'skipped'
  }
];

export const RECENT_RUNS: TestRunItem[] = [
  {
    id: 'run-1',
    spec: 'e2e/checkout-journey.spec.ts',
    status: 'PASSED',
    details: 'Chromium 124 • Headless',
    worker: 'Worker #1 (PID 4912)',
    duration: '1.24s',
    notes: 'Steps: 18/18 verified',
    timeAgo: '1 min ago',
    actionType: 'trace'
  },
  {
    id: 'run-2',
    spec: 'visual/plp-asset-integrity.spec.ts',
    status: 'FAILED',
    details: 'Target: problem_user session',
    worker: 'Worker #3 (PID 4914)',
    duration: '842ms',
    notes: 'AssertionError: Image src mismatch at item_4_img_link',
    timeAgo: '4 mins ago',
    actionType: 'diff'
  },
  {
    id: 'run-3',
    spec: 'perf/inventory-load-sla.spec.ts',
    status: 'FLAKY',
    details: 'performance_glitch_user',
    worker: 'Worker #2 (PID 4913)',
    duration: '3,921ms',
    notes: 'Retry #1 passed after timeout warning',
    timeAgo: '9 mins ago',
    actionType: 'waterfall'
  },
  {
    id: 'run-4',
    spec: 'security/cookie-session-isolation.spec.ts',
    status: 'PASSED',
    details: 'Auth Guard Verify',
    worker: 'Worker #4 (PID 4915)',
    duration: '412ms',
    notes: '14 security assertions clean',
    timeAgo: '14 mins ago',
    actionType: 'trace'
  }
];

export const NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Test Failure in checkout.spec.ts',
    desc: 'problem_user encountered a TimeoutError on #last-name input',
    time: '4m ago',
    type: 'error',
  },
  {
    id: 'n2',
    title: '4 Asset 404s Discovered',
    desc: 'Content scraper flagged sl-404.jpg across 4 inventory items',
    time: '12m ago',
    type: 'error',
  },
  {
    id: 'n3',
    title: 'New Review Pin Created',
    desc: 'Sarah (Lead QA) added #PIN-01 to Sauce Labs Backpack',
    time: '14m ago',
    type: 'info',
  },
  {
    id: 'n4',
    title: 'SLA Warning on performance_glitch_user',
    desc: 'Inventory route TTFB breached 3.5s threshold (3.8s observed)',
    time: '25m ago',
    type: 'warning',
  },
  {
    id: 'n5',
    title: 'SQLite WAL Checkpoint Completed',
    desc: 'local.db synchronized 42.8 MB, 1,482 total records',
    time: '30m ago',
    type: 'success',
  },
  {
    id: 'n6',
    title: 'Visual Diff Regression Detected',
    desc: 'visual_user found 1px badge overflow on cart icon',
    time: '45m ago',
    type: 'warning',
  },
  {
    id: 'n7',
    title: 'Build #swag-v4.1.88-rc3 Deployed',
    desc: 'Chromium 124 Headless cluster ready for regression suite',
    time: '1h ago',
    type: 'info',
  }
];
