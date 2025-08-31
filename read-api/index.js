const express = require('express');
const config = require('./src/config');
const { connectDB } = require('./src/services/database');
const eventRoutes = require('./src/routes/eventRoutes');

const app = express();
app.use(express.json());

// --- API Routes ---
// All routes will be prefixed with /api
app.use('/api', eventRoutes);

// --- Start Server ---
const run = async () => {
  try {
    // --- Connect to Database ---
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB successfully');
    
    app.listen(config.port, () => {
      console.log(`Read API is listening on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start Read API:', error);
    // Don't exit immediately, give it a chance to retry
    setTimeout(() => {
      console.log('Retrying connection...');
      run().catch(console.error);
    }, 5000);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Read API...');
  process.exit(0);
});

run().catch(console.error);