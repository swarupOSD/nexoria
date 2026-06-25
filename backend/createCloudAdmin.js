import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const createAdmin = async () => {
  try {
    const mongoUri = "mongodb+srv://snehashisroy106_db_user:FaqlxFWKNYnsiB4L@cluster0.lr82ya3.mongodb.net/nexoria?retryWrites=true&w=majority";
    await mongoose.connect(mongoUri);
    console.log('Connected to Cloud MongoDB');

    const adminEmail = 'admin@nexoria.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Super Admin already exists in cloud db!');
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin12345', salt);

    const adminUser = new User({
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'superadmin',
      isPremium: true,
      premiumType: 'Lifetime',
      status: 'active'
    });

    await adminUser.save();
    console.log('Super Admin created successfully in cloud db!');
    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
