const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  kafka: {
    broker: process.env.KAFKA_BROKER,
    clientId: process.env.KAFKA_CLIENT_ID,
    groupId: process.env.KAFKA_GROUP_ID,
    bookingTopic: process.env.KAFKA_TOPIC_BOOKING,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  postgres: {
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT, 10),
  },
  lockTtl: parseInt(process.env.LOCK_TTL_SECONDS, 10),
};