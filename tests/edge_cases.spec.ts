import { test, expect } from '@playwright/test';
import { login, addFirstItemAndGoToCheckout, fillCheckoutInfo } from './helpers';

test('[error_user] complete checkout through the finish button', async ({ page }) => {
  await login(page, 'error_user');
  await addFirstItemAndGoToCheckout(page);
  await fillCheckoutInfo(page);
  await expect(page).toHaveURL(/checkout-step-two\.html/);
  await page.click('#finish');
  // Known defect: error_user's finish button does not navigate to the
  // order confirmation page, silently stranding the shopper on step two.
  await expect(page).toHaveURL(/checkout-complete\.html/, { timeout: 5_000 });
});

test('[visual_user] inventory renders all six product cards', async ({ page }) => {
  await login(page, 'visual_user');
  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.locator('.inventory_item')).toHaveCount(6);
});

test('[performance_glitch_user] login completes within generous SLA', async ({ page }) => {
  test.setTimeout(20_000);
  const start = Date.now();
  await login(page, 'performance_glitch_user');
  await expect(page).toHaveURL(/inventory\.html/, { timeout: 15_000 });
  // eslint-disable-next-line no-console
  console.log(`performance_glitch_user login took ${Date.now() - start}ms`);
});
