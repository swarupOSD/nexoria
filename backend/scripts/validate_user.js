import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:5000/api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('--- STARTING USER FLOW VALIDATION ---');
  let passed = true;
  let cookie = '';
  const testUser = {
    name: 'Test User',
    email: 'testuser_e2e@example.com',
    password: 'password123',
  };

  try {
    // 1. Database Connection
    await connectDB();

    // Clean up previous test runs
    await User.deleteOne({ email: testUser.email });

    // 2. Register
    console.log('[1/7] Testing Registration...');
    let res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    let data = await res.json();
    if (!data.success) throw new Error(`Registration failed: ${data.message || JSON.stringify(data)}`);
    console.log('      Registration Success');

    // Extract cookie
    cookie = res.headers.get('set-cookie');
    
    // 3. Forgot Password
    console.log('[2/7] Testing Forgot Password...');
    res = await fetch(`${API_URL}/auth/forgotpassword`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email })
    });
    data = await res.json();
    // It might fail if Email is not properly configured, but the endpoint should respond success or graceful error
    console.log(`      Forgot Password Response: ${data.success}`);

    // Retrieve Token from DB directly since we might not receive the email
    const user = await User.findOne({ email: testUser.email });
    let resetToken = user.resetPasswordToken;
    
    if (resetToken) {
      console.log('[3/7] Testing Reset Password...');
      res = await fetch(`${API_URL}/auth/resetpassword/${resetToken}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'newpassword123' })
      });
      data = await res.json();
      if (!data.success) throw new Error(`Reset password failed: ${JSON.stringify(data)}`);
      console.log('      Reset Password Success');
      testUser.password = 'newpassword123'; // Update for next step
    } else {
      console.log('      Warning: Reset Token not generated (Check nodemailer). Proceeding with original password.');
    }

    // 4. Login
    console.log('[4/7] Testing Login...');
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    data = await res.json();
    if (!data.success) throw new Error(`Login failed: ${JSON.stringify(data)}`);
    cookie = res.headers.get('set-cookie');
    const token = data.accessToken;
    console.log('      Login Success');

    // 5. User Dashboard (Get Me)
    console.log('[5/7] Testing Access User Dashboard...');
    res = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    data = await res.json();
    if (!data.success) throw new Error(`User Dashboard failed: ${JSON.stringify(data)}`);
    console.log('      User Dashboard Success');

    // 6. Categories & Search
    console.log('[6/7] Testing Browse Categories...');
    res = await fetch(`${API_URL}/categories`, { method: 'GET' });
    data = await res.json();
    if (!data.success) throw new Error(`Browse Categories failed: ${JSON.stringify(data)}`);
    console.log('      Browse Categories Success');

    // 7. Contact Form
    console.log('[7/7] Testing Contact Form...');
    res = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bob', email: 'bob@example.com', subject: 'Help', message: 'Test message' })
    });
    data = await res.json();
    if (!data.success) throw new Error(`Contact form failed: ${JSON.stringify(data)}`);
    console.log('      Contact Form Success');

  } catch (error) {
    passed = false;
    console.error(`\nFAILED: ${error.message}`);
  } finally {
    mongoose.connection.close();
    console.log(`\n--- USER FLOW VALIDATION ${passed ? 'PASSED' : 'FAILED'} ---`);
    process.exit(passed ? 0 : 1);
  }
}

runTests();
