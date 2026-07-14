const { MongoClient } = require('mongodb'); 
const localUri = 'mongodb://127.0.0.1:27017/mods_apps'; 
const cloudUri = 'mongodb://snehashisroy106_db_user:FaqlxFWKNYnsiB4L@ac-zogbjzw-shard-00-00.lr82ya3.mongodb.net:27017,ac-zogbjzw-shard-00-01.lr82ya3.mongodb.net:27017,ac-zogbjzw-shard-00-02.lr82ya3.mongodb.net:27017/nexoria?ssl=true&replicaSet=atlas-byknna-shard-0&authSource=admin&retryWrites=true&w=majority'; 
async function restore() { 
  let localClient, cloudClient; 
  try { 
    localClient = new MongoClient(localUri); 
    await localClient.connect(); 
    const localDb = localClient.db(); 
    cloudClient = new MongoClient(cloudUri); 
    await cloudClient.connect(); 
    const cloudDb = cloudClient.db(); 
    const collections = await cloudDb.listCollections().toArray(); 
    for (const col of collections) { 
      const colName = col.name; 
      if (colName === 'users') continue; 
      const docs = await cloudDb.collection(colName).find({}).toArray(); 
      if (docs.length > 0) { 
        try { 
          await localDb.collection(colName).insertMany(docs, { ordered: false }); 
          console.log(`Restored ${docs.length} to ${colName}`); 
        } catch(e) { 
          if(e.code === 11000) console.log(`Some duplicates skipped for ${colName}`); 
          else console.log(`Error ${colName}:`, e.message); 
        } 
      } 
    } 
    console.log('Restore complete!'); 
  } catch(e) { 
    console.error(e); 
  } finally { 
    if(localClient) await localClient.close(); 
    if(cloudClient) await cloudClient.close(); 
  } 
} 
restore();
