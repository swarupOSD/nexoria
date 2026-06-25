import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
mongoose.connect('mongodb://127.0.0.1:27017/mods_apps').then(async () => {
  try {
    const hash = await bcrypt.hash('2006', 10);
    // Try to update first
    const result = await mongoose.connection.collection('users').updateOne(
      { email: 'superadmin@modsapp.com' },
      { $set: { password: hash, role: 'superadmin', name: 'Super Admin', status: 'active' } }
    );
    console.log('Update result:', result);
    
    if (result.matchedCount === 0) {
      // Create if doesn't exist
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
      console.log('Created superadmin@modsapp.com');
    }
  } catch (err) { console.error(err); }
  process.exit(0);
});
