const { producer } = require('../services/kafka');
const config = require('../config');

// This function contains the core logic for the /book endpoint
const createBooking = async (req, res) => {
  const { userId, eventId, seatId } = req.body;

  if (!userId || !eventId || !seatId) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    console.log(`Received booking request for seat ${seatId}`);
    await producer.send({
      topic: config.kafka.bookingTopic,
      messages: [{
        // kafka automatically hashes on bases of key and pushes msg in partitions
        key: `${eventId}:${seatId}`,
        value: JSON.stringify({ userId, eventId, seatId }),
      }],
    });

    res.status(202).json({
      message: 'Booking request received and is being processed.'
    });
  } catch (error) {
    console.error('Error publishing to Kafka:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = { createBooking };