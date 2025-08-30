const { Kafka } = require('kafkajs');
const config = require('../config');

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: [config.kafka.broker],
});

const consumer = kafka.consumer({ groupId: config.kafka.groupId });

module.exports = { consumer };