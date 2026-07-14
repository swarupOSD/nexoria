const { MongoClient } = require('mongodb');
const cloudUri = 'mongodb://snehashisroy106_db_user:FaqlxFWKNYnsiB4L@ac-zogbjzw-shard-00-00.lr82ya3.mongodb.net:27017,ac-zogbjzw-shard-00-01.lr82ya3.mongodb.net:27017,ac-zogbjzw-shard-00-02.lr82ya3.mongodb.net:27017/nexoria?ssl=true&replicaSet=atlas-byknna-shard-0&authSource=admin&retryWrites=true&w=majority';
const localUri = 'mongodb://127.0.0.1:27017/mods_apps';
async function setOwner(uri, name) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const res = await client.db().collection('users').updateOne(
      { email: 'sweetyswarup1324@gmail.com' },
      { $set: { role: 'owner' } }
    );
    console.log(name, res.modifiedCount ? 'Updated' : 'Not updated/No change');
  } catch(e) {
    console.error(name, e.message);
  } finally {
    await client.close();
  }
}
setOwner(cloudUri, 'Cloud');
setOwner(localUri, 'Local');
