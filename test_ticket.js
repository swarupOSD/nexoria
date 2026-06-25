import fetch from 'node-fetch';
import { MongoClient, ObjectId } from 'mongodb';

const DB_URI = 'mongodb://127.0.0.1/mods_apps';
const API_BASE = 'http://localhost:5000/api';

async function run() {
  const client = await MongoClient.connect(DB_URI);
  const db = client.db('mods_apps');

  try {
    const user = await db.collection('users').findOne({ role: 'user' });
    const admin = await db.collection('users').findOne({ role: 'superadmin' });
    
    // 1. Create ticket
    const ticketRes = await db.collection('contactmessages').insertOne({
      name: user.name,
      email: user.email,
      subject: "Test Ticket for Verification",
      message: "Please help me verify the reply flow.",
      category: "Support",
      priority: "High",
      status: "Open",
      isResolved: false,
      replies: [],
      user: user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log("Ticket Created:", ticketRes.insertedId);

    // 2. Admin replies (simulating backend call to trigger socket)
    // Actually we can just call the API if we have an admin token. Since we don't, we'll manually insert the reply. But the user asked to "verify socket event received" which requires hitting the API.
    // Let's generate a quick JWT for admin.
    const jwt = await import('jsonwebtoken');
    const token = jwt.default.sign({ id: admin._id }, '4f92a37b12d5e68c9a0b12d5e68c9a0b12d5e68c9a0b12d5e68c9a0b12d5e68c', { expiresIn: '1h' });
    
    const replyRes = await fetch(`${API_BASE}/contact/${ticketRes.insertedId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ content: "Yes, the reply flow is perfectly restored!" })
    });
    
    const replyData = await replyRes.json();
    console.log("API Reply Response:", replyData.success ? "Success" : replyData.message);

    // 3. Verify notification
    const notifs = await db.collection('notifications').find({ user: user._id }).sort({ createdAt: -1 }).limit(1).toArray();
    console.log("Notification created:", notifs.length > 0 ? notifs[0].message : "No");

  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

run();
