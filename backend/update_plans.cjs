const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/modsapp').then(async () => {
  const db = mongoose.connection.db;
  await db.collection('premiumplans').deleteMany({});
  await db.collection('premiumplans').insertMany([
    { name: '1 Month', price: 199, currency: 'INR', durationDays: 30, benefits: ['Zero Advertisements', 'Lightning Fast Downloads', 'Exclusive Premium Apps', 'Premium Movies & Shows', 'Priority Support'], isActive: true },
    { name: '3 Months', price: 499, currency: 'INR', durationDays: 90, benefits: ['Zero Advertisements', 'Lightning Fast Downloads', 'Exclusive Premium Apps', 'Premium Movies & Shows', 'Priority Support'], isActive: true },
    { name: '1 Year', price: 999, currency: 'INR', durationDays: 365, benefits: ['Zero Advertisements', 'Lightning Fast Downloads', 'Exclusive Premium Apps', 'Premium Movies & Shows', 'Priority Support'], isActive: true }
  ]);
  console.log('Database plans fixed!');
  process.exit(0);
}).catch(console.error);
