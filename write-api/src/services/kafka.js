const { Kafka } = require('kafkajs');
const config = require('../config');

// Setup the Kafka client and producer
const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: [config.kafka.broker],
});

const producer = kafka.producer();

// We export the producer so other parts of our app can use it
module.exports = { producer };