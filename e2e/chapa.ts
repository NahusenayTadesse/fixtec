import { expect, type Page } from '@playwright/test';
import { BASE_URL } from './base-url';

/**
 * Completes a payment on Chapa's hosted test-mode page. `0900123456` is one of
 * Chapa's documented test numbers that always succeeds
 * (https://developer.chapa.co/docs/testing-mobile/).
 */
export async function payOnChapa(page: Page) {
	await page.waitForURL(/checkout\.chapa\.co/, { timeout: 30_000 });
	await page.getByPlaceholder('09********').fill('0900123456');
	await page.getByRole('button', { name: 'Pay using Test Mode' }).click();
	await page.waitForURL(`${BASE_URL}/checkout/payment?ref=**`, { timeout: 60_000 });
	await expect(page.getByRole('heading', { name: 'Payment received' })).toBeVisible();
}
