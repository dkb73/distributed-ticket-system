const dotenv = require('dotenv');

// This loads the variables from your .env file into process.env
dotenv.config();

// We export an object with all our configuration variables
module.exports = {
  port: process.env.PORT,
  kafka: {
    broker: process.env.KAFKA_BROKER,
    clientId: process.env.KAFKA_CLIENT_ID,
    bookingTopic: process.env.KAFKA_TOPIC_BOOKING,
  },
};