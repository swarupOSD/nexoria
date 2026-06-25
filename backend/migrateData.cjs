const { MongoClient } = require('mongodb');

const localUri = 'mongodb://127.0.0.1:27017/mods_apps';
const cloudUri = 'mongodb://snehashisroy106_db_user:FaqlxFWKNYnsiB4L@ac-zogbjzw-shard-00-00.lr82ya3.mongodb.net:27017,ac-zogbjzw-shard-00-01.lr82ya3.mongodb.net:27017,ac-zogbjzw-shard-00-02.lr82ya3.mongodb.net:27017/nexoria?ssl=true&replicaSet=atlas-byknna-shard-0&authSource=admin&retryWrites=true&w=majority';

async function migrate() {
  let localClient, cloudClient;
  try {
    localClient = new MongoClient(localUri);
    await localClient.connect();
    console.log('Connected to Local DB');
    const localDb = localClient.db();

    cloudClient = new MongoClient(cloudUri);
    await cloudClient.connect();
    console.log('Connected to Cloud DB');
    const cloudDb = cloudClient.db();

    const collections = await localDb.listCollections().toArray();
    console.log(`Found ${collections.length} collections locally.`);

    for (const colInfo of collections) {
      const colName = colInfo.name;
      if (colName === 'users') {
        console.log(`Skipping 'users' collection so we don't mess up the new admin account.`);
        continue;
      }

      console.log(`Migrating collection: ${colName}...`);
      const docs = await localDb.collection(colName).find({}).toArray();
      
      if (docs.length > 0) {
        // Optional: clear cloud collection first to avoid duplicates
        // await cloudDb.collection(colName).deleteMany({});
        
        try {
          // Use ordered: false so if some documents have duplicate _ids, it just continues
          await cloudDb.collection(colName).insertMany(docs, { ordered: false });
          console.log(`  -> Inserted ${docs.length} documents into ${colName}.`);
        } catch (insertErr) {
          if (insertErr.code === 11000) {
             console.log(`  -> Inserted some documents, skipped duplicates in ${colName}.`);
          } else {
             console.log(`  -> Error inserting into ${colName}:`, insertErr.message);
          }
        }
      } else {
        console.log(`  -> Collection ${colName} is empty. Skipped.`);
      }
    }
    console.log('Migration complete!');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    if (localClient) await localClient.close();
    if (cloudClient) await cloudClient.close();
  }
}

migrate();
