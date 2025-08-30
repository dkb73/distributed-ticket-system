const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  mongo: {
    uri: process.env.MONGO_URI,
  },
  postgres: {
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT, 10),
  },
  syncInterval: parseInt(process.env.SYNC_INTERVAL_MS, 10),
};