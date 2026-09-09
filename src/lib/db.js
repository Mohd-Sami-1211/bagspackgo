import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
//Error message

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn?.connection?.readyState === 1) {
    return cached.conn;
  }

  // A dropped connection or a previously rejected promise must not poison
  // every later request handled by the same warm server process.
  if (cached.conn && cached.conn.connection?.readyState !== 1) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // fail fast if MongoDB Atlas is unreachable
      connectTimeoutMS: 10000,         // connection attempt timeout
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
}

export default dbConnect;
