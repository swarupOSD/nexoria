const { MongoClient } = require('mongodb');
const cloudUri = 'mongodb://snehashisroy106_db_user:FaqlxFWKNYnsiB4L@ac-zogbjzw-shard-00-00.lr82ya3.mongodb.net:27017,ac-zogbjzw-shard-00-01.lr82ya3.mongodb.net:27017,ac-zogbjzw-shard-00-02.lr82ya3.mongodb.net:27017/nexoria?ssl=true&replicaSet=atlas-byknna-shard-0&authSource=admin&retryWrites=true&w=majority';
async function fix() {
  const client = new MongoClient(cloudUri);
  await client.connect();
  const db = client.db();
  const result = await db.collection('sitesettings').updateOne({}, { $set: { maintenanceMode: false } });
  console.log('Updated SiteSettings:', result.modifiedCount);
  await client.close();
}
fix();
