const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const logger = require('../utils/logger');

let client = null;
let dbInstance = null;

async function connectDB() {
  if (dbInstance) return dbInstance;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    logger.error("MONGODB_URI tidak ditemukan di environment variables", { context: "MongoDB Config" });
    throw new Error("MONGODB_URI tidak terkonfigurasi di environment variables server.");
  }

  if (!client) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
  }

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

module.exports = { get client() { return client; }, connectDB, getDb };
