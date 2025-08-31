const config = require('./src/config');
const { consumer } = require('./src/services/kafka');
const { redisClient } = require('./src/services/redis');
const { pgPool, initializeDatabase } = require('./src/services/postgres'); // pgPool is needed to close the pool on exit
const { processBooking } = require('./src/handlers/bookingHandler');

const run = async () => {
  try {
    // Initialize database first
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    // Connect all external services
    console.log('Connecting to Redis...');
    await redisClient.connect();
    console.log('Connected to Redis successfully');
    
    console.log('Connecting to Kafka...');
    await consumer.connect();
    console.log('Connected to Kafka successfully');
    
    await consumer.subscribe({ topic: config.kafka.bookingTopic, fromBeginning: true });
    console.log(`Subscribed to topic: ${config.kafka.bookingTopic}`);

    console.log('Worker is running and waiting for booking requests...');
      
    // extract each message of subscribed kafka topic
    // number of consumer get self-balanced w.r.t number of partition in topic.  
    await consumer.run({
      // do processBooking on each message
      eachMessage: processBooking,
    });
  } catch (error) {
    console.error("An error occurred in the worker:", error);
    // Don't exit immediately, give it a chance to retry
    setTimeout(() => {
      console.log('Retrying worker startup...');
      run().catch(console.error);
    }, 5000);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down worker...');
  try {
    await consumer.disconnect();
    await redisClient.disconnect();
    await pgPool.end(); // Close all connections in the pool
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

run().catch(console.error);