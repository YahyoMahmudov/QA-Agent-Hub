import { Page } from '@playwright/test';

export const SAUCE_PASSWORD = 'secret_sauce';

export async function login(page: Page, user: string) {
  await page.goto('/');
  await page.fill('#user-name', user);
  await page.fill('#password', SAUCE_PASSWORD);
  await page.click('#login-button');
}

export async function addFirstItemAndGoToCheckout(page: Page) {
  await page.locator('.inventory_item button').first().click();
  await page.click('.shopping_cart_link');
  await page.click('#checkout');
}

export async function fillCheckoutInfo(page: Page) {
  await page.fill('#first-name', 'QA');
  await page.fill('#last-name', 'Agent');
  await page.fill('#postal-code', '94107');
  await page.click('#continue');
}
