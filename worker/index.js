// worker/index.js (Corrected with a Stable Startup Pattern)

const config = require('./src/config');
const { consumer } = require('./src/services/kafka');
const { redisClient } = require('./src/services/redis');
const { pgPool } = require('./src/services/postgres');
const { processBooking } = require('./src/handlers/bookingHandler');

// The main function is now responsible for the one-time setup.
async function main() {
  console.log('Booking worker starting...');

  // Connections are now established ONCE here, outside of any loop.
  // The client libraries have their own internal retry logic, which is more reliable.
  await redisClient.connect();
  await consumer.connect();

  await consumer.subscribe({ topic: config.kafka.bookingTopic, fromBeginning: true });

  console.log('Worker is running and waiting for booking requests...');

  // The main application logic just runs. It's no longer in a recursive retry block.
  // We now PASS the database and redis clients into the handler on each message.
  await consumer.run({
    eachMessage: (payload) => processBooking(payload, { pgPool, redisClient }),
  });

  // Graceful shutdown for when you press Ctrl+C
  process.on('SIGINT', async () => {
    console.log('Shutting down worker...');
    await consumer.disconnect();
    await redisClient.disconnect();
    await pgPool.end();
    process.exit(0);
  });
}

// Start the application. If it fails here, it's a fatal error and the container should crash
// and be restarted by Docker, which is the correct behavior.
main().catch(async (error) => {
  console.error("A critical error occurred during worker startup:", error);
  process.exit(1);
});