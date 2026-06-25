import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\30f47aa1-069e-4f1b-a876-117acc129b38';

async function run() {
  console.log("Starting puppeteer...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // 1. Home Page (Hero and Sidebar Displays)
    console.log("Navigating to Home...");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(outDir, 'screenshot_home.png'), fullPage: true });

    // 2. Category Page
    console.log("Navigating to Category (apps)...");
    await page.goto('http://localhost:5173/category/apps', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(outDir, 'screenshot_category_apps.png'), fullPage: true });

    // 3. Support Center
    console.log("Navigating to Support Center...");
    await page.goto('http://localhost:5173/support', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(outDir, 'screenshot_support.png'), fullPage: true });

    // 4. MovieBox Home
    console.log("Navigating to MovieBox...");
    await page.goto('http://localhost:5173/moviebox', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(outDir, 'screenshot_moviebox.png'), fullPage: true });

  } catch (err) {
    console.error("Error during puppeteer run:", err);
  } finally {
    await browser.close();
    console.log("Done.");
  }
}

run();
