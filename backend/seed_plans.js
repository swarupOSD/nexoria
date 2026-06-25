import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import PremiumPlan from './models/PremiumPlan.js';

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mods-apps');
    
    await PremiumPlan.deleteMany();
    
    await PremiumPlan.create([
      {
        name: 'Monthly Premium',
        price: 99,
        currency: 'INR',
        durationDays: 30,
        benefits: ['Ad-free experience', 'Fast downloads', 'Premium badges'],
        badgeColor: 'blue',
        isActive: true
      },
      {
        name: '3 Months Premium',
        price: 249,
        currency: 'INR',
        durationDays: 90,
        benefits: ['Ad-free experience', 'Fast downloads', 'Premium badges', 'Priority support'],
        badgeColor: 'purple',
        isActive: true
      },
      {
        name: '1 Year Premium',
        price: 799,
        currency: 'INR',
        durationDays: 365,
        benefits: ['Ad-free experience', 'Fast downloads', 'Premium badges', 'Priority support', 'Early access to apps'],
        badgeColor: 'gold',
        isActive: true
      }
    ]);
    
    console.log('✅ Premium Plans seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedPlans();
