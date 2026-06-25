const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/modsapp')
  .then(async () => {
    console.log("Connected to MongoDB.");
    const db = mongoose.connection.db;
    const settingsCollection = db.collection('sitesettings');
    
    // Check if settings document exists
    const settings = await settingsCollection.findOne({});
    if (settings) {
        console.log("Found settings. Updating upiQrUrl to /my-qr.jpg");
        await settingsCollection.updateOne({}, { $set: { "paymentSettings.upiQrUrl": "/my-qr.jpg" } });
        console.log("Updated!");
    } else {
        console.log("Settings not found!");
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
