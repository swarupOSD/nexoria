import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/mods_apps').then(async () => {
  const db = mongoose.connection;
  await db.collection('users').updateOne(
    { email: 'sweetyswarup1324@gmail.com' },
    { $set: { role: 'owner' } }
  );
  console.log('User upgraded to owner successfully');
  process.exit(0);
}).catch(console.error);
