import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';

const DB_URI = 'mongodb://127.0.0.1/mods_apps';
const API_BASE = 'http://localhost:5000/api';

async function run() {
  const client = await MongoClient.connect(DB_URI);
  const db = client.db('mods_apps');

  try {
    // 1. Get stats
    const heroCount = await db.collection('banners').countDocuments();
    const catCount = await db.collection('categories').countDocuments();
    const movieCount = await db.collection('movies').countDocuments();
    
    console.log('--- STATS ---');
    console.log(`Hero Displays DB Count: ${heroCount}`);
    console.log(`Categories DB Count: ${catCount}`);
    console.log(`MovieBox Movies DB Count: ${movieCount}`);

    // 2. Fetch User and Admin
    const user = await db.collection('users').findOne({ role: 'user' });
    const admin = await db.collection('users').findOne({ role: 'superadmin' });
    
    console.log(`User: ${user?.email}`);
    console.log(`Admin: ${admin?.email}`);

  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

run();
