import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

mongoose.connect('mongodb://127.0.0.1:27017/premium_apps').then(async () => {
  try {
    // Hash the password ONCE manually
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('2006', salt);
    
    // Insert bypassing mongoose hooks entirely
    await mongoose.connection.collection('users').insertOne({
      name: 'Super Admin',
      email: 'superadmin@modsapp.com',
      password: hash,
      role: 'superadmin',
      rewardPoints: 1000,
      status: 'active',
      isPremium: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0
    });
    
    console.log('Superadmin account created successfully: superadmin@modsapp.com / 2006');
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
});
