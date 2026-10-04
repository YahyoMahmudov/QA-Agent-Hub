import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('auth', () => {
  test('[standard_user] verify authentication cookies', async ({ page }) => {
    await login(page, 'standard_user');
    await expect(page).toHaveURL(/inventory\.html/);
    const cookies = await page.context().cookies();
    expect(cookies.some((c) => c.name === 'session-username')).toBeTruthy();
  });

  test('[locked_out_user] verify sadface lockout banner', async ({ page }) => {
    await login(page, 'locked_out_user');
    await expect(page.locator('[data-test="error"]')).toContainText('locked out');
    await expect(page).not.toHaveURL(/inventory\.html/);
  });
});
