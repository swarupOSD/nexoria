import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
mongoose.connect('mongodb://127.0.0.1:27017/premium_apps').then(async () => {
  try {
    const hash = await bcrypt.hash('2006', 10);
    const result = await mongoose.connection.collection('users').updateOne(
      { email: 'superadmin@modsapp.com' },
      { $set: { password: hash } }
    );
    console.log('Update result:', result);
    
    const doc = await mongoose.connection.collection('users').findOne({ email: 'superadmin@modsapp.com' });
    console.log('Doc password:', doc.password);
    console.log('Match test:', await bcrypt.compare('2006', doc.password));
  } catch (err) { console.error(err); }
  process.exit(0);
});
