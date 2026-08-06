import mongoose from 'mongoose';
import dotenv from 'dotenv';
import HackingTool from './models/HackingTool.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI).then(async () => {
  console.log('Connected to MongoDB');

  const newTool = new HackingTool({
    title: 'OSINT Bomber',
    description: 'Advanced Open Source Intelligence tracking and bomber system. Deploys intelligence gathering over target footprints.',
    icon: 'ShieldCheckIcon',
    color: 'from-purple-500/20 to-indigo-900/20',
    border: 'border-purple-500/30',
    isActive: true,
    order: 10,
    actionUrl: 'https://osint-bomber.streamlit.app/'
  });

  await newTool.save();
  console.log('Added OSINT Bomber successfully!');
  
  mongoose.connection.close();
}).catch(err => {
  console.error('Connection error:', err);
});
