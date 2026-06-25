import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Category from './models/Category.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // Keep regular users but clean up duplicate superadmins
    await User.deleteMany({ role: 'superadmin', email: { $ne: 'superadmin@modsapp.com' } });
    
    // Clean up duplicate admins
    await User.deleteMany({ role: 'admin', email: { $ne: 'admin@modsapp.com' } });

    // Upsert Super Admin
    const superAdmin = await User.findOne({ email: 'superadmin@modsapp.com' });
    if (superAdmin) {
      superAdmin.password = 'supersecurepassword123';
      superAdmin.role = 'superadmin';
      await superAdmin.save();
    } else {
      await User.create({
        name: 'Super Admin',
        email: 'superadmin@modsapp.com',
        password: 'supersecurepassword123',
        role: 'superadmin',
        isEmailVerified: true
      });
    }

    // Upsert Admin
    const admin = await User.findOne({ email: 'admin@modsapp.com' });
    if (admin) {
      admin.password = 'adminpassword123';
      admin.role = 'admin';
      await admin.save();
    } else {
      await User.create({
        name: 'Admin User',
        email: 'admin@modsapp.com',
        password: 'adminpassword123',
        role: 'admin',
        isEmailVerified: true
      });
    }

    await Category.deleteMany();
    await Category.insertMany([
      { name: 'Games', slug: 'games', description: 'Action and arcade games' },
      { name: 'Apps', slug: 'apps', description: 'Productivity and utility apps' }
    ]);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Category.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
