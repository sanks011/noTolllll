const { MongoClient } = require('mongodb');
const logger = require('./logger');

let client;
let db;

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    client = new MongoClient(process.env.MONGODB_URI, {
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    db = client.db('tradenavigator');
    
    logger.info('MongoDB connected successfully');
    
    // Test the connection
    await db.admin().ping();
    logger.info('MongoDB ping successful');
    
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

const closeConnection = async () => {
  if (client) {
    await client.close();
    logger.info('MongoDB connection closed');
  }
};

module.exports = {
  connectDB,
  getDB,
  closeConnection
};
