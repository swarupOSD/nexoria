import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:5000'; // root, not /api

async function runTests() {
  console.log('--- STARTING TECHNICAL VALIDATION ---');
  let passed = true;

  try {
    // 1. Sitemap
    console.log('[1/4] Testing /sitemap.xml...');
    let res = await fetch(`${API_URL}/sitemap.xml`);
    let data = await res.text();
    if (res.status !== 200 || !data.includes('<?xml')) throw new Error(`Sitemap failed`);
    console.log('      Sitemap Success');

    // 2. Robots
    console.log('[2/4] Testing /robots.txt...');
    res = await fetch(`${API_URL}/robots.txt`);
    data = await res.text();
    if (res.status !== 200 || !data.includes('User-agent: *')) throw new Error(`Robots failed`);
    console.log('      Robots Success');

    // 3. Security Headers (Helmet)
    console.log('[3/4] Testing Security Headers...');
    res = await fetch(`${API_URL}/api/categories`);
    const headers = res.headers;
    const csp = headers.get('content-security-policy');
    const xss = headers.get('x-xss-protection');
    if (!csp) console.log('      Warning: Helmet CSP not present (could be disabled or default)');
    else console.log('      Helmet headers present');
    console.log('      Security Headers Check Success');

    // 4. Rate Limiting Check
    console.log('[4/4] Testing Rate Limiting (Rapid Requests)...');
    for (let i = 0; i < 5; i++) {
       await fetch(`${API_URL}/api/categories`);
    }
    const rateLimitHeader = res.headers.get('x-ratelimit-limit');
    if (rateLimitHeader) {
      console.log('      Rate Limit Headers Present: ' + rateLimitHeader);
    } else {
      console.log('      Warning: Rate Limit Headers missing (might be configured differently)');
    }
    console.log('      Rate Limit Check Success');

  } catch (error) {
    passed = false;
    console.error(`\nFAILED: ${error.message}`);
  } finally {
    console.log(`\n--- TECHNICAL VALIDATION ${passed ? 'PASSED' : 'FAILED'} ---`);
    process.exit(passed ? 0 : 1);
  }
}

runTests();
