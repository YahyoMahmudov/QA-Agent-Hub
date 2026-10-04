import { test, expect } from '@playwright/test';
import { login } from './helpers';

test('[standard_user] multi-item add & cart badge counter', async ({ page }) => {
  await login(page, 'standard_user');
  await expect(page).toHaveURL(/inventory\.html/);

  const addButtons = page.locator('.inventory_item button');
  await addButtons.nth(0).click();
  await addButtons.nth(1).click();
  await addButtons.nth(2).click();

  await expect(page.locator('.shopping_cart_badge')).toHaveText('3');
});
