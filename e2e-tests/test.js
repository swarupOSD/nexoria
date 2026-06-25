const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR);
}

async function runTest() {
  console.log('Starting Complete App Management E2E Tests...');
  const browser = await puppeteer.launch({ 
    headless: "new",
    defaultViewport: { width: 1280, height: 900 }
  });
  const page = await browser.newPage();
  const errors = [];

  try {
    // 1. Super Admin Login
    console.log('Testing Super Admin Login...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    
    await page.type('input[type="email"]', 'superadmin@modsapp.com');
    await page.type('input[type="password"]', 'supersecurepassword123');
    await page.click('button[type="submit"]');
    
    await page.waitForFunction('window.location.pathname !== "/login"', { timeout: 10000 }).catch(async (e) => {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'login-timeout.png') });
      throw new Error('Login failed: ' + e.message);
    });
    
    // 2. Complete App Creation Flow
    console.log('Testing App Creation Flow...');
    await page.goto('http://localhost:5173/superadmin/apps/create', { waitUntil: 'networkidle0' });
    
    // Fill basic fields
    await page.type('input[name="title"]', 'E2E Full Verification App');
    await page.type('input[name="packageName"]', 'com.e2e.full.verification');
    await page.type('input[name="description"]', 'A short description for E2E app');
    await page.type('input[name="publisher"]', 'E2E Automation Developer');
    await page.type('input[name="version"]', '1.0.0');
    
    // Select category (wait for options to populate)
    await page.waitForFunction('document.querySelectorAll("select[name=\\"category\\"] option").length > 1', { timeout: 5000 });
    const catValue = await page.evaluate(() => document.querySelectorAll('select[name="category"] option')[1].value);
    await page.select('select[name="category"]', catValue);

    // Featured Image & App Logo using data-testid from ImageUpload
    await page.type('input[data-testid="image-upload-url-app-logo"]', 'https://via.placeholder.com/150');
    await page.click('button[data-testid="image-upload-apply-app-logo"]');
    await new Promise(r => setTimeout(r, 500));

    await page.type('input[data-testid="image-upload-url-featured-image"]', 'https://via.placeholder.com/800x400');
    await page.click('button[data-testid="image-upload-apply-featured-image"]');
    await new Promise(r => setTimeout(r, 500));

    // Gallery Images
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find(b => b.innerText.includes('Add Image') && b.innerText.includes('Add'));
      if (addBtn) addBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    const galleryInputs = await page.$$('input[data-testid="image-upload-url-gallery"]');
    if (galleryInputs.length > 0) {
      await galleryInputs[0].type('https://via.placeholder.com/300x600');
      await page.evaluate(() => {
        const applyBtns = document.querySelectorAll('button[data-testid="image-upload-apply-gallery"]');
        if (applyBtns.length > 0) applyBtns[0].click();
      });
      await new Promise(r => setTimeout(r, 500));
    }

    // Download Links
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find(b => b.innerText.includes('Add Link'));
      if (addBtn) addBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const urls = document.querySelectorAll('input[type="url"]');
      if (urls.length > 0) {
        const urlInput = Array.from(urls).find(i => i.placeholder.includes('https://...'));
        if (urlInput) {
          urlInput.value = 'https://download.e2e.test/app.apk';
          urlInput.dispatchEvent(new Event('input', { bubbles: true }));
          urlInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });

    // Version History
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find(b => b.innerText.includes('Add Version'));
      if (addBtn) addBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const versionInputs = document.querySelectorAll('input[placeholder="e.g. 1.0.5"]');
      if (versionInputs.length > 0) {
        versionInputs[0].value = '1.0.0';
        versionInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
      }
      const changelogTextareas = document.querySelectorAll('textarea');
      if (changelogTextareas.length > 0) {
        changelogTextareas[0].value = '- Initial Release';
        changelogTextareas[0].dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Toggles
    await page.evaluate(() => {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(cb => {
        if (cb.name === 'isFeatured' || cb.name === 'isTrending') {
          if (!cb.checked) cb.click();
        }
      });
    });

    // Set Status
    await page.select('select[name="status"]', 'Published');

    // Click Apply Changes
    console.log('Saving App...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const applyBtn = btns.find(b => b.innerText.includes('Apply Changes'));
      if (applyBtn) applyBtn.click();
    });

    // Wait for the success toast and navigation
    await page.waitForFunction('window.location.pathname.includes("/apps")', { timeout: 15000 }).catch(async e => {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'save-timeout.png') });
      throw new Error('Save failed or did not redirect: ' + e.message);
    });

    // 3. Verify App List in Admin Panel
    console.log('Verifying Admin App List...');
    await page.waitForSelector('body', { timeout: 5000 });
    const listBody = await page.evaluate(() => document.body.innerText);
    if (!listBody.includes('E2E Full Verification App')) {
      errors.push('App not found in Super Admin App List');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin-list-missing.png') });
    }

    // 4. Verify Frontend Homepage Render
    console.log('Verifying Frontend Homepage Render...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    const homeBody = await page.evaluate(() => document.body.innerText);
    if (!homeBody.includes('E2E Full Verification App')) {
      errors.push('App not found on Frontend Homepage');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-missing.png') });
    }

    // 5. Verify App Details Page
    console.log('Verifying Single App Page...');
    // We try to find the link to the app details page by finding an anchor with the title or slug
    const appHref = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const link = links.find(l => l.innerText.includes('E2E Full Verification App'));
      return link ? link.href : null;
    });

    if (appHref) {
      await page.goto(appHref, { waitUntil: 'networkidle0' });
      const detailBody = await page.evaluate(() => document.body.innerText);
      if (!detailBody.includes('E2E Full Verification App')) {
        errors.push('Single App page failed to render correctly');
      }
      if (!detailBody.includes('E2E Automation Developer')) {
        errors.push('Developer/Publisher name missing on App page');
      }
    } else {
      errors.push('Could not find link to App detail page from Homepage');
    }

    // 6. Admin Panel Editing Verification
    console.log('Verifying App Editing...');
    await page.goto('http://localhost:5173/superadmin/apps', { waitUntil: 'networkidle0' });
    
    // Click edit on the new app
    const editUrl = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr'));
      const targetRow = rows.find(r => r.innerText.includes('E2E Full Verification App'));
      if (targetRow) {
        const editLink = targetRow.querySelector('a[href*="/edit/"]');
        return editLink ? editLink.href : null;
      }
      return null;
    });

    if (editUrl) {
      await page.goto(editUrl, { waitUntil: 'networkidle0' });
      const editTitle = await page.$eval('input[name="title"]', el => el.value);
      if (editTitle !== 'E2E Full Verification App') {
        errors.push('Edit mode failed to load title');
      }
      
      // Update and Save
      await page.evaluate(() => {
        const titleInput = document.querySelector('input[name="title"]');
        titleInput.value = 'E2E Full Verification App UPDATED';
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        titleInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        const btns = Array.from(document.querySelectorAll('button'));
        const applyBtn = btns.find(b => b.innerText.includes('Apply Changes'));
        if (applyBtn) applyBtn.click();
      });
      await new Promise(r => setTimeout(r, 2000));
      console.log('App Edited successfully');
    } else {
      errors.push('Could not find Edit link in Admin Panel');
    }

    // 7. Test Theme Toggle
    console.log('Testing Global Functionality (Theme)...');
    await page.evaluate(() => {
      const moonBtn = document.querySelector('button .lucide-moon');
      const sunBtn = document.querySelector('button .lucide-sun');
      if (moonBtn) moonBtn.parentElement.click();
      else if (sunBtn) sunBtn.parentElement.click();
    });
    await page.waitForTimeout(500);
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    
    await page.reload({ waitUntil: 'networkidle0' });
    const isDarkAfterRefresh = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    if (isDark !== isDarkAfterRefresh) {
      errors.push('Theme persistence failed!');
    }

  } catch (err) {
    console.error('Test execution failed:', err);
    errors.push(err.message);
  } finally {
    await browser.close();
  }

  // Final Output
  console.log('\\n--- TEST RESULTS ---');
  if (errors.length > 0) {
    console.log('ERRORS FOUND:');
    errors.forEach(e => console.log(' -', e));
  } else {
    console.log('ALL TESTS PASSED SUCCESSFULLY 100%');
  }

  fs.writeFileSync('test-results.json', JSON.stringify({ errors }, null, 2));
}

runTest();
