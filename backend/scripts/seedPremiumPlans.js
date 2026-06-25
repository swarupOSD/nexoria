import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PremiumPlan from '../models/PremiumPlan.js';

dotenv.config();

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1/modsapp');

    const benefits = [
      'No Advertisements',
      'Premium Badge',
      'Premium App Access',
      'Faster Downloads',
      'Exclusive Categories',
      'Early Access Apps',
      'Premium Support'
    ];

    const plans = [
      {
        name: 'Monthly Premium',
        price: 99,
        currency: 'INR',
        durationDays: 30,
        benefits,
        badgeColor: 'blue',
      },
      {
        name: '3 Months Premium',
        price: 249,
        currency: 'INR',
        durationDays: 90,
        benefits,
        badgeColor: 'purple',
      },
      {
        name: '1 Year Premium',
        price: 799,
        currency: 'INR',
        durationDays: 365,
        benefits,
        badgeColor: 'gold',
      }
    ];

    await PremiumPlan.deleteMany(); // Clear existing plans
    await PremiumPlan.insertMany(plans);

    console.log('Premium Plans Seeded successfully');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedPlans();
