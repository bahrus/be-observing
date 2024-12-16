import { test, expect } from '@playwright/test';
test('boolishText', async ({ page }) => {
    await page.goto('./tests/Mapping/ByName/boolishText.html');
    // wait for 1 second
    await page.waitForTimeout(2000);
    const editor = page.locator('#target');
    await expect(editor).toHaveAttribute('mark', 'good');
});
