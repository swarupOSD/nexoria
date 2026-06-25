const { MongoClient } = require('mongodb');

async function fix() {
  const c = await MongoClient.connect('mongodb://snehashisroy106_db_user:FaqlxFWKNYnsiB4L@ac-zogbjzw-shard-00-00.lr82ya3.mongodb.net:27017,ac-zogbjzw-shard-00-01.lr82ya3.mongodb.net:27017,ac-zogbjzw-shard-00-02.lr82ya3.mongodb.net:27017/nexoria?ssl=true&replicaSet=atlas-byknna-shard-0&authSource=admin&retryWrites=true&w=majority');
  const db = c.db();

  // Fix advertisements
  const ads = await db.collection('advertisements').find().toArray();
  for (const ad of ads) {
    let loc = ad.location;
    if (loc === 'sidebar') loc = 'Sidebar';
    if (loc === 'header') loc = 'Header';
    if (loc === 'footer') loc = 'Footer';
    
    await db.collection('advertisements').updateOne({ _id: ad._id }, {
      $set: {
        adCode: ad.code || ad.adCode,
        enabled: ad.isActive !== undefined ? ad.isActive : ad.enabled,
        location: loc
      },
      $unset: { code: "", isActive: "" }
    });
  }
  console.log('Fixed advertisements');
  c.close();
}
fix().catch(console.error);
