const mongoose = require('mongoose');

const uri = "mongodb://sami:sami786@ac-q3nflqs-shard-00-00.9zvpovs.mongodb.net:27017,ac-q3nflqs-shard-00-01.9zvpovs.mongodb.net:27017,ac-q3nflqs-shard-00-02.9zvpovs.mongodb.net:27017/bagspackgo?ssl=true&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(async () => {
    const db = mongoose.connection.db;
    const packages = await db.collection('packages').find().sort({ createdAt: -1 }).limit(3).toArray();
    
    console.log("Latest packages:");
    packages.forEach(p => {
      console.log(`Package: ${p.name}`);
      console.log(`- aboutPackage: ${p.aboutPackage ? 'YES' : 'NO'}`);
      console.log(`- packagePhotos count: ${p.packagePhotos ? p.packagePhotos.length : 0}`);
      console.log(`- photos count: ${p.photos ? p.photos.length : 0}`);
      console.log("---");
    });
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
