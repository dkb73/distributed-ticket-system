const { Kafka } = require('kafkajs');
const config = require('../config');

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: [config.kafka.broker],
});

const consumer = kafka.consumer({ groupId: config.kafka.groupId });

async function connectWithRetry(retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await consumer.connect();
      console.log('Connected to Kafka successfully');
      return;
    } catch (error) {
      console.error(`Kafka connection failed (attempt ${i + 1}):`, error);
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw new Error('Exceeded maximum retry attempts to connect to Kafka');
      }
    }
  }
}

module.exports = { consumer, connectWithRetry };