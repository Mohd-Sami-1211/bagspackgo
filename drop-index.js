import mongoose from "mongoose";

const MONGODB_URI = "mongodb://sami:sami786@ac-q3nflqs-shard-00-00.9zvpovs.mongodb.net:27017,ac-q3nflqs-shard-00-01.9zvpovs.mongodb.net:27017,ac-q3nflqs-shard-00-02.9zvpovs.mongodb.net:27017/bagspackgo?ssl=true&authSource=admin&retryWrites=true&w=majority";

async function dropIndex() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
        const collection = mongoose.connection.collection("guides");
        await collection.dropIndex("phone_1");
        console.log("Phone index dropped successfully from guides");
    } catch (e) {
        if (e.codeName === 'IndexNotFound') {
            console.log("Index not found, ignoring.");
        } else {
            console.error(e);
        }
    } finally {
        mongoose.disconnect();
    }
}

dropIndex();
