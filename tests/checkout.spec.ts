import { test, expect } from '@playwright/test';
import { login, addFirstItemAndGoToCheckout, fillCheckoutInfo } from './helpers';

test('[standard_user] complete checkout end to end', async ({ page }) => {
  await login(page, 'standard_user');
  await addFirstItemAndGoToCheckout(page);
  await fillCheckoutInfo(page);
  await expect(page).toHaveURL(/checkout-step-two\.html/);
  await page.click('#finish');
  await expect(page).toHaveURL(/checkout-complete\.html/);
  await expect(page.locator('.complete-header')).toContainText('Thank you');
});

test('[problem_user] checkout information step advances to shipping overview', async ({ page }) => {
  await login(page, 'problem_user');
  await addFirstItemAndGoToCheckout(page);
  await fillCheckoutInfo(page);
  // Known defect (see ISS-1041): problem_user's Last Name field does not
  // retain typed input, so the form fails client-side validation and the
  // wizard never advances past checkout-step-one.
  await expect(page).toHaveURL(/checkout-step-two\.html/, { timeout: 5_000 });
});
