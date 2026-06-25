const puppeteer = require('puppeteer');
const path = require('path');

async function run() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });

  console.log("Testing Home Page...");
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(__dirname, 'home_restored.png'), fullPage: true });

  console.log("Testing Category Page...");
  await page.goto('http://localhost:5173/category/apps', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(__dirname, 'category_restored.png'), fullPage: true });

  console.log("Testing Premium Page...");
  await page.goto('http://localhost:5173/premium', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(__dirname, 'premium_restored.png'), fullPage: true });

  console.log("Testing Support Page...");
  await page.goto('http://localhost:5173/support', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(__dirname, 'support_restored.png'), fullPage: true });

  console.log("Tests complete.");
  await browser.close();
}

run();
