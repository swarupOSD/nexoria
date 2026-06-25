const puppeteer = require('puppeteer');

const runAuthTests = async () => {
  console.log('Starting Authorization Matrix Tests...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  // Bypass rate limiting if possible, or wait between tests.
  
  const loginAs = async (email, password) => {
    console.log(`\n--- Logging in as ${email} ---`);
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await page.type('input[type="email"]', email);
    await page.type('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForFunction('window.location.pathname !== "/login"', { timeout: 10000 });
    console.log('✅ Login successful');
  };

  const logout = async () => {
    console.log(`--- Logging out ---`);
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });
    await page.waitForSelector('button, a');
    // Find logout button in navbar or dropdown
    const logoutBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Logout'));
    });
    if (logoutBtn) {
      await logoutBtn.click();
      await page.waitForFunction('window.location.pathname === "/" || window.location.pathname === "/login"', { timeout: 10000 });
      console.log('✅ Logout successful');
    } else {
      console.log('❌ Could not find logout button');
    }
  };

  const testRoute = async (route, expectedAccess) => {
    console.log(`Testing route: ${route} (Expect access: ${expectedAccess})`);
    await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle0' });
    
    // Check for Access Denied or Redirect
    const currentPath = await page.evaluate(() => window.location.pathname);
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    if (expectedAccess) {
      if (bodyText.includes('Access Denied') || currentPath === '/login' || currentPath === '/') {
        throw new Error(`❌ Failed: Was denied access to ${route}`);
      }
      console.log(`✅ Accessed ${route} successfully`);
      
      // Test refresh
      console.log(`Refreshing ${route}...`);
      await page.reload({ waitUntil: 'networkidle0' });
      const pathAfterRefresh = await page.evaluate(() => window.location.pathname);
      const textAfterRefresh = await page.evaluate(() => document.body.innerText);
      
      if (textAfterRefresh.includes('Access Denied') || pathAfterRefresh === '/login' || pathAfterRefresh === '/') {
        throw new Error(`❌ Failed: Refresh broke access on ${route}`);
      }
      console.log(`✅ Refresh successful on ${route}`);
    } else {
      if (!bodyText.includes('Access Denied') && currentPath === route) {
        throw new Error(`❌ Failed: Was granted access to ${route} when it should be denied`);
      }
      console.log(`✅ Access properly denied/redirected for ${route}`);
    }
  };

  try {
    // 1. TEST SUPER ADMIN
    await loginAs('superadmin@modsapp.com', 'supersecurepassword123');
    await testRoute('/dashboard', true);
    await testRoute('/admin', true);
    await testRoute('/superadmin', true);
    await logout();

    // 2. TEST ADMIN
    await loginAs('admin@modsapp.com', 'adminpassword123');
    await testRoute('/dashboard', true);
    await testRoute('/admin', true);
    await testRoute('/superadmin', false);
    await logout();

    // 3. TEST NORMAL USER
    // Assuming normal user exists or create one via signup (or test directly if seeder creates one)
    console.log('\n--- Testing Normal User (using invalid admin / default) ---');
    // First register a normal user via API or UI
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle0' });
    await page.type('input[name="name"]', 'Normal User');
    await page.type('input[name="email"]', 'user@modsapp.com');
    await page.type('input[name="password"]', 'userpassword123');
    await page.click('button[type="submit"]');
    try {
      await page.waitForFunction('window.location.pathname === "/dashboard"', { timeout: 10000 });
      console.log('✅ Normal User Registered and Logged In');
    } catch (e) {
      // If already exists, just login
      await loginAs('user@modsapp.com', 'userpassword123');
    }
    
    await testRoute('/dashboard', true);
    await testRoute('/admin', false);
    await testRoute('/superadmin', false);
    await logout();

    console.log('\n✅ ALL AUTHORIZATION TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
  } finally {
    await browser.close();
  }
};

runAuthTests();
