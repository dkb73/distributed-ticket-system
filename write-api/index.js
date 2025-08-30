// write-api/index.js (Corrected, Refactored Version)

const express = require('express');
// This line loads the configuration from your .env file!
const config = require('./src/config');
const { producer } = require('./src/services/kafka');
const bookingRoutes = require('./src/routes/bookingRoutes');

const app = express();
app.use(express.json());

// All API routes will be prefixed with /api
app.use('/api', bookingRoutes);

const run = async () => {
  // producer.connect() will now use the correct 'kafka:9092' from your .env file
  await producer.connect();
  
  app.listen(config.port, () => {
    console.log(`Write API is listening on port ${config.port}`);
  });
};

run().catch(console.error);