const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Set a common user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    
    console.log('Navigating to Instagram reel...');
    await page.goto('https://www.instagram.com/reel/DbA8W30oROp/', { waitUntil: 'networkidle2', timeout: 30000 });
    
    console.log('Waiting for video or main content...');
    await new Promise(r => setTimeout(r, 5000)); // give it some time to render
    
    // Extract text from the page to find the song name
    const pageText = await page.evaluate(() => document.body.innerText);
    fs.writeFileSync('ig_page_text.txt', pageText);
    
    // Also try to find elements that typically contain the audio name
    const audioElements = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.map(a => a.innerText).filter(t => t.trim().length > 0);
    });
    fs.writeFileSync('ig_links.txt', audioElements.join('\n'));
    
    console.log('Finished extracting text.');
  } catch (error) {
    console.error('Script Error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
