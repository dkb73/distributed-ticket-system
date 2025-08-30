const express = require('express');
const config = require('./src/config');
const { connectDB } = require('./src/services/database');
const eventRoutes = require('./src/routes/eventRoutes');

const app = express();
app.use(express.json());

// --- Connect to Database ---
connectDB();

// --- API Routes ---
// All routes will be prefixed with /api
app.use('/api', eventRoutes);

// --- Start Server ---
app.listen(config.port, () => {
  console.log(`Read API is listening on port ${config.port}`);
});