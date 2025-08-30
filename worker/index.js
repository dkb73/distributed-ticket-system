const config = require('./src/config');
const { consumer } = require('./src/services/kafka');
const { redisClient } = require('./src/services/redis');
const { pgPool } = require('./src/services/postgres'); // pgPool is needed to close the pool on exit
const { processBooking } = require('./src/handlers/bookingHandler');

const run = async () => {
  // Connect all external services
  await redisClient.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: config.kafka.bookingTopic, fromBeginning: true });

  console.log('Worker is running and waiting for booking requests...');
    
  // extract each message of subscribed kafka topic
  // number of consumer get self-balanced w.r.t number of partition in topic.  
  await consumer.run({
    // do processBooking on each message
    eachMessage: processBooking,
  });
};

run().catch(async (error) => {
  console.error("An error occurred in the worker:", error);
  // Graceful shutdown
  await consumer.disconnect();
  await redisClient.disconnect();
  await pgPool.end(); // Close all connections in the pool
  process.exit(1);
});