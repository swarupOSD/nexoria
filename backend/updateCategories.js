import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';

dotenv.config();

async function updateCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // Music -> Nexoria Sound
    await Category.findOneAndUpdate(
      { slug: 'music' },
      { 
        name: 'Nexoria Sound',
        description: 'Immerse in the ultimate audio experience with premium music streaming and tools.'
      }
    );

    // Games -> Nexoria Arcade
    await Category.findOneAndUpdate(
      { slug: 'games' },
      { 
        name: 'Nexoria Arcade',
        description: 'Level up with premium mobile and kids games, all unlocked and ready to play.'
      }
    );

    // Apps/Editing -> Nexoria Studio
    await Category.findOneAndUpdate(
      { slug: 'apps' },
      { 
        name: 'Nexoria Studio',
        description: 'Professional editing tools and premium apps for your creative journey.'
      }
    );

    console.log('Categories updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateCategories();
