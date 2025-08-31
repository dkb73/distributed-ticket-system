const dotenv = require('dotenv');
// Only load dotenv if not already loaded
if (!process.env.MONGO_URI) {
  dotenv.config();
}

module.exports = {
  port: process.env.PORT,
  database: {
    uri: process.env.MONGO_URI,
  },
};