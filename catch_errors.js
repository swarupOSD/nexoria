import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: "new"
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    console.log('Page loaded successfully.');
    await page.screenshot({ path: 'catch_errors_screenshot.png', fullPage: true });
    console.log('Screenshot taken.');
  } catch (error) {
    console.error('Navigation failed:', error);
  }

  await browser.close();
})();
