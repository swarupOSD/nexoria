import mongoose from 'mongoose';
import User from './models/User.js';

mongoose.connect('mongodb://127.0.0.1:27017/premium_apps').then(async () => {
  try {
    await User.deleteMany({ email: { $in: ['admin@premium.com', 'testuser@gmail.com'] } });
    
    await User.create({
      name: 'Super Admin',
      email: 'admin@premium.com',
      password: 'admin123',
      role: 'superadmin',
      rewardPoints: 1000,
      status: 'active',
      isPremium: true
    });
    
    await User.create({
      name: 'Test User',
      email: 'testuser@gmail.com',
      password: 'admin123',
      role: 'user',
      rewardPoints: 500,
      status: 'active',
      isPremium: false
    });
    
    console.log('Accounts recreated using official Model');
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
});
