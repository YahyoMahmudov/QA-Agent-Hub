// Runs the functional suite entirely in-process using playwright-core +
// @sparticuz/chromium (a Lambda-compatible Chromium build), instead of
// spawning the `playwright test` CLI. Vercel freezes a serverless function's
// execution the instant it sends its HTTP response, so a spawned child
// process has no chance to finish - everything here must run and complete
// synchronously within the same request/response lifecycle. Only used when
// process.env.VERCEL is set; local dev keeps using the full `playwright
// test` CLI via suite.service.ts's startSuiteRun(), unchanged.
import { chromium as playwrightChromium } from 'playwright-core';
import type { Page } from 'playwright-core';
import sparticuzChromium from '@sparticuz/chromium';
import { expect } from '@playwright/test';
import { persistSuiteRun, type TestEndEvent } from './suite.service.js';

const BASE_URL = 'https://www.saucedemo.com';
const SAUCE_PASSWORD = 'secret_sauce';

async function login(page: Page, user: string) {
  await page.goto('/');
  await page.fill('#user-name', user);
  await page.fill('#password', SAUCE_PASSWORD);
  await page.click('#login-button');
}

async function addFirstItemAndGoToCheckout(page: Page) {
  await page.locator('.inventory_item button').first().click();
  await page.click('.shopping_cart_link');
  await page.click('#checkout');
}

async function fillCheckoutInfo(page: Page) {
  await page.fill('#first-name', 'QA');
  await page.fill('#last-name', 'Agent');
  await page.fill('#postal-code', '94107');
  await page.click('#continue');
}

interface SuiteCase {
  file: string;
  title: string;
  run: (page: Page) => Promise<void>;
}

// Mirrors tests/*.spec.ts exactly - same assertions, same known-defect
// personas, same timeouts. Kept in sync manually since this runs via
// playwright-core directly rather than the @playwright/test CLI.
const CASES: SuiteCase[] = [
  {
    file: 'tests/auth.spec.ts',
    title: '[standard_user] verify authentication cookies',
    run: async (page) => {
      await login(page, 'standard_user');
      await expect(page).toHaveURL(/inventory\.html/);
      const cookies = await page.context().cookies();
      expect(cookies.some((c) => c.name === 'session-username')).toBeTruthy();
    },
  },
  {
    file: 'tests/auth.spec.ts',
    title: '[locked_out_user] verify sadface lockout banner',
    run: async (page) => {
      await login(page, 'locked_out_user');
      await expect(page.locator('[data-test="error"]')).toContainText('locked out');
      await expect(page).not.toHaveURL(/inventory\.html/);
    },
  },
  {
    file: 'tests/cart.spec.ts',
    title: '[standard_user] multi-item add & cart badge counter',
    run: async (page) => {
      await login(page, 'standard_user');
      await expect(page).toHaveURL(/inventory\.html/);
      const addButtons = page.locator('.inventory_item button');
      await addButtons.nth(0).click();
      await addButtons.nth(1).click();
      await addButtons.nth(2).click();
      await expect(page.locator('.shopping_cart_badge')).toHaveText('3');
    },
  },
  {
    file: 'tests/checkout.spec.ts',
    title: '[standard_user] complete checkout end to end',
    run: async (page) => {
      await login(page, 'standard_user');
      await addFirstItemAndGoToCheckout(page);
      await fillCheckoutInfo(page);
      await expect(page).toHaveURL(/checkout-step-two\.html/);
      await page.click('#finish');
      await expect(page).toHaveURL(/checkout-complete\.html/);
      await expect(page.locator('.complete-header')).toContainText('Thank you');
    },
  },
  {
    file: 'tests/checkout.spec.ts',
    title: '[problem_user] checkout information step advances to shipping overview',
    run: async (page) => {
      await login(page, 'problem_user');
      await addFirstItemAndGoToCheckout(page);
      await fillCheckoutInfo(page);
      // Known defect (see ISS-1041): problem_user's Last Name field does not
      // retain typed input, so the form fails client-side validation and the
      // wizard never advances past checkout-step-one.
      await expect(page).toHaveURL(/checkout-step-two\.html/, { timeout: 5_000 });
    },
  },
  {
    file: 'tests/edge_cases.spec.ts',
    title: '[error_user] complete checkout through the finish button',
    run: async (page) => {
      await login(page, 'error_user');
      await addFirstItemAndGoToCheckout(page);
      await fillCheckoutInfo(page);
      await expect(page).toHaveURL(/checkout-step-two\.html/);
      await page.click('#finish');
      // Known defect: error_user's finish button does not navigate to the
      // order confirmation page, silently stranding the shopper on step two.
      await expect(page).toHaveURL(/checkout-complete\.html/, { timeout: 5_000 });
    },
  },
  {
    file: 'tests/edge_cases.spec.ts',
    title: '[visual_user] inventory renders all six product cards',
    run: async (page) => {
      await login(page, 'visual_user');
      await expect(page).toHaveURL(/inventory\.html/);
      await expect(page.locator('.inventory_item')).toHaveCount(6);
    },
  },
  {
    file: 'tests/edge_cases.spec.ts',
    title: '[performance_glitch_user] login completes within generous SLA',
    run: async (page) => {
      await login(page, 'performance_glitch_user');
      await expect(page).toHaveURL(/inventory\.html/, { timeout: 15_000 });
    },
  },
];

export async function runSuiteServerless(): Promise<{ passed: number; failed: number; total: number }> {
  // sparticuz/chromium's default args include --single-process and
  // --no-zygote, which are tuned for Puppeteer's single-page-at-a-time
  // use case. Under Playwright, that combination was crashing Chromium
  // immediately after launch (process starts, then the first CDP command
  // - newPage - fails with "Target ... has been closed"), consistently,
  // regardless of memory. Playwright handles normal multi-process
  // Chromium fine, so drop those two flags and let it run multi-process.
  const args = sparticuzChromium.args.filter(
    (arg) => arg !== '--single-process' && arg !== '--no-zygote'
  );

  const browser = await playwrightChromium.launch({
    args,
    executablePath: await sparticuzChromium.executablePath(),
    headless: true,
  });

  const results: TestEndEvent[] = [];

  async function runOneCase(testCase: SuiteCase): Promise<void> {
    const context = await browser.newContext({ baseURL: BASE_URL });
    const page = await context.newPage();
    const start = Date.now();
    try {
      await testCase.run(page);
      results.push({
        type: 'test-end',
        title: testCase.title,
        file: testCase.file,
        line: 0,
        status: 'passed',
        duration: Date.now() - start,
        error: null,
        retry: 0,
      });
    } catch (err) {
      results.push({
        type: 'test-end',
        title: testCase.title,
        file: testCase.file,
        line: 0,
        status: 'failed',
        duration: Date.now() - start,
        error: (err as Error).message,
        retry: 0,
      });
    } finally {
      try {
        await context.close();
      } catch {
        // Browser may already be gone if a prior case crashed it - the
        // result above is already recorded either way, so just move on.
      }
    }
  }

  try {
    // Multi-process Chromium (no --single-process) is stable at 4-way
    // concurrency but just missed the 60s cap; a full 8-way burst crashes
    // it again (too many processes spawned at once for this sandbox,
    // separately from the --single-process issue). 6 splits the
    // difference: fewer simultaneous process spawns than 8, faster than
    // two sequential batches of 4.
    const BATCH_SIZE = 6;
    for (let i = 0; i < CASES.length; i += BATCH_SIZE) {
      const batch = CASES.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(runOneCase));
    }
  } finally {
    try {
      await browser.close();
    } catch {
      // Already closed/crashed - nothing more to do.
    }
  }

  await persistSuiteRun(results);

  const passed = results.filter((r) => r.status === 'passed').length;
  return { passed, failed: results.length - passed, total: results.length };
}
