import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Category from './models/Category.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find a superadmin or admin
    const admin = await User.findOne({ role: { $in: ['superadmin', 'admin'] } });
    if (!admin) {
      console.log("No admin found!");
      process.exit(1);
    }
    
    // Generate token
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    
    // Find a category (e.g. Games or Apps)
    let category = await Category.findOne({ name: /Game|App/i });
    if (!category) category = await Category.findOne(); // fallback to any category
    
    console.log(`ADMIN_TOKEN=${token}`);
    console.log(`DEFAULT_CATEGORY_ID=${category ? category._id : 'missing'}`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
