const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const logger = require('../utils/logger');

const uri = process.env.MONGODB_URI;

if (!uri) {
  logger.error("MONGODB_URI tidak ditemukan di file .env", { context: "MongoDB Config" });
  process.exit(1);
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let dbInstance = null;

async function connectDB() {
  if (dbInstance) return dbInstance;
  try {
    logger.info("Menghubungkan ke MongoDB Atlas...", { context: "MongoDB Connect" });
    await client.connect();
    
    // Default database name from URI or 'keuangan'
    dbInstance = client.db(process.env.DB_NAME || "keuangan");
    
    await dbInstance.command({ ping: 1 });
    logger.info("Berhasil terhubung ke MongoDB Atlas!", { context: "MongoDB Connect", dbName: dbInstance.databaseName });
    return dbInstance;
  } catch (error) {
    logger.error("Gagal terhubung ke MongoDB Atlas", {
      context: "MongoDB Connect",
      error: error.message,
      code: error.code,
      codeName: error.codeName
    });
    throw error;
  }
}

function getDb() {
  if (!dbInstance) {
    throw new Error("Database belum terhubung! Panggil connectDB() terlebih dahulu.");
  }
  return dbInstance;
}

module.exports = { client, connectDB, getDb };
