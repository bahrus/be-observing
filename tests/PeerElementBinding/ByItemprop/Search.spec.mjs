import { test, expect } from '@playwright/test';
test('PeerElementBinding.ByItemprop.Search', async ({ page }) => {
    await page.goto('./tests/PeerElementBinding/ByItemprop/Search.html');
    // wait for 1 second
    await page.waitForTimeout(1500);
    const editor = page.locator('#target');
    await expect(editor).toHaveAttribute('mark', 'good');
});
