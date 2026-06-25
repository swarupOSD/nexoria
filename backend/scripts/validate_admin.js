import mongoose from 'mongoose';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Post from '../models/Post.js';
import connectDB from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING ADMIN FLOW VALIDATION ---');
  let passed = true;
  const adminUser = {
    name: 'Admin Test',
    email: 'admintest_e2e@example.com',
    password: 'adminpassword123',
  };
  let token = '';

  try {
    await connectDB();
    await User.deleteOne({ email: adminUser.email });
    await Category.deleteOne({ name: 'E2E Category' });
    await Post.deleteOne({ title: 'E2E Test Post' });

    // 1. Create Admin User Directly in DB
    const user = await User.create({
      name: adminUser.name,
      email: adminUser.email,
      password: adminUser.password,
      role: 'admin'
    });

    // 2. Login
    console.log('[1/5] Admin Login...');
    let res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminUser.email, password: adminUser.password })
    });
    let data = await res.json();
    if (!data.success) throw new Error(`Login failed: ${JSON.stringify(data)}`);
    token = data.accessToken;
    console.log('      Admin Login Success');

    // 3. Create Category
    console.log('[2/5] Admin Create Category...');
    res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: 'E2E Category', slug: 'e2e-category', description: 'Test category' })
    });
    data = await res.json();
    if (!data.success) throw new Error(`Category creation failed: ${JSON.stringify(data)}`);
    const categoryId = data.data._id;
    console.log('      Create Category Success');

    // 4. Create Post
    console.log('[3/5] Admin Create Post (with simulated Cloudinary + TipTap)...');
    // Using a mocked upload simulation since we bypass FormData here
    // The backend postController expects image path, but we will send a direct JSON for the test or standard multipart
    res = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        title: 'E2E Test Post',
        slug: 'e2e-test-post',
        description: 'Testing the post',
        content: '<p>TipTap HTML Content</p>',
        category: categoryId,
        developer: 'E2E Dev',
        version: '1.0',
        size: '10MB',
        featuredImage: 'https://res.cloudinary.com/demo/image/upload/v1521276287/sample.jpg'
      })
    });
    data = await res.json();
    if (!data.success) throw new Error(`Post creation failed: ${JSON.stringify(data)}`);
    const postId = data.data._id;
    console.log('      Create Post Success');

    // 5. Edit Post
    console.log('[4/5] Admin Edit Post...');
    res = await fetch(`${API_URL}/posts/${postId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        version: '1.1'
      })
    });
    data = await res.json();
    if (!data.success) throw new Error(`Post edit failed: ${JSON.stringify(data)}`);
    console.log('      Edit Post Success');

    // 6. Delete Test Content
    console.log('[5/5] Deleting Test Content...');
    await Post.findByIdAndDelete(postId);
    await Category.findByIdAndDelete(categoryId);
    await User.findByIdAndDelete(user._id);
    console.log('      Cleanup Success');

  } catch (error) {
    passed = false;
    console.error(`\nFAILED: ${error.message}`);
  } finally {
    mongoose.connection.close();
    console.log(`\n--- ADMIN FLOW VALIDATION ${passed ? 'PASSED' : 'FAILED'} ---`);
    process.exit(passed ? 0 : 1);
  }
}

runTests();
