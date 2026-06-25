const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/modsapp').then(async () => {
  const db = mongoose.connection.db;
  await db.collection('premiumplans').deleteMany({});
  await db.collection('premiumplans').insertMany([
    { name: '1 Month', price: 199, currency: 'INR', durationDays: 30, features: ['Zero Advertisements', 'Lightning Fast Downloads', 'Exclusive Premium Apps', 'Premium Movies & Shows', 'Priority Support'], isActive: true },
    { name: '3 Months', price: 499, currency: 'INR', durationDays: 90, features: ['Zero Advertisements', 'Lightning Fast Downloads', 'Exclusive Premium Apps', 'Premium Movies & Shows', 'Priority Support'], isActive: true },
    { name: '1 Year', price: 999, currency: 'INR', durationDays: 365, features: ['Zero Advertisements', 'Lightning Fast Downloads', 'Exclusive Premium Apps', 'Premium Movies & Shows', 'Priority Support'], isActive: true }
  ]);
  
  await db.collection('settings').updateOne({}, { 
    $set: { 
      'paymentSettings.upiId': '8906372069@ybl', 
      'paymentSettings.upiQrUrl': 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=upi://pay?pa=8906372069@ybl&pn=SNEHASHIS%20ROY&cu=INR', 
      'paymentSettings.paymentInstructions': '1. Scan the QR code using PhonePe or any UPI app.\n2. Pay the exact plan amount.\n3. Enter the 12-digit UTR / Transaction ID below.\n4. Upload a screenshot of successful payment.' 
    } 
  }, { upsert: true });
  
  console.log('Database updated!');
  process.exit(0);
}).catch(console.error);
