import { test, expect } from '@playwright/test';
test('FullInerence.HostToItemprop.Span', async ({ page }) => {
    await page.goto('./tests/FullInference/HostToItemprop/span.html');
    // wait for 1 second
    await page.waitForTimeout(2000);
    const editor = page.locator('#target');
    await expect(editor).toHaveAttribute('mark', 'good');
});
