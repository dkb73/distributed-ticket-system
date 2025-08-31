// write-api/index.js (Corrected, Refactored Version)

const express = require('express');
// This line loads the configuration from your .env file!
const config = require('./src/config');
const { producer } = require('./src/services/kafka');
const bookingRoutes = require('./src/routes/bookingRoutes');

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// All API routes will be prefixed with /api
app.use('/api', bookingRoutes);

const run = async () => {
  try {
    // producer.connect() will now use the correct 'kafka:9092' from your .env file
    console.log('Connecting to Kafka...');
    await producer.connect();
    console.log('Connected to Kafka successfully');
    
    app.listen(config.port, () => {
      console.log(`Write API is listening on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start Write API:', error);
    // Don't exit immediately, give it a chance to retry
    setTimeout(() => {
      console.log('Retrying connection...');
      run().catch(console.error);
    }, 5000);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Write API...');
  try {
    await producer.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

run().catch(console.error);