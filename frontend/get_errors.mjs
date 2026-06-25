import { chromium } from '@playwright/test';
(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    page.on('console', msg => {
      console.log(`[${msg.type()}] ${msg.text()}`);
    });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    // Check if ErrorBoundary is rendered
    const details = await page.locator('text=Details');
    if (await details.count() > 0) {
      await details.click();
      await page.waitForTimeout(500);
      const text = await page.evaluate(() => document.body.innerText);
      console.log('--- PAGE TEXT WITH ERROR ---');
      console.log(text);
    } else {
      console.log('No ErrorBoundary visible.');
    }
    
    await browser.close();
  } catch (e) {
    console.error(e);
  }
})();
