import dotenv from 'dotenv';
dotenv.config();

async function populateCategories() {
  const baseUrl = 'http://localhost:5000/api';
  const adminEmail = `admin_${Date.now()}@test.com`;

  await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Admin User', email: adminEmail, password: 'password123' })
  });

  const { MongoClient } = await import('mongodb');
  const client = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017/premium-apps');
  await client.connect();
  const db = client.db();
  await db.collection('users').updateOne({ email: adminEmail }, { $set: { role: 'admin' } });
  await client.close();

  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.accessToken;
  const adminHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const catsToCreate = [
    { name: 'Apps', slug: 'apps' },
    { name: 'Games', slug: 'games' },
    { name: 'Movies', slug: 'movies' },
    { name: 'Music', slug: 'music' },
    { name: 'Editing', slug: 'editing' }
  ];

  for (let c of catsToCreate) {
    const res = await fetch(`${baseUrl}/categories`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify(c)
    });
    if (res.ok) {
      console.log(`Created: ${c.name}`);
    }
  }
}

populateCategories();
