// worker/src/handlers/bookingHandler.js (Updated)

const config = require('../config');

// The handler now accepts the message payload AND a 'clients' object containing the connections.
const processBooking = async ({ message }, { pgPool, redisClient }) => {
  const bookingRequest = JSON.parse(message.value.toString());
  const { userId, eventId, seatId } = bookingRequest;

  const lockKey = `lock:${eventId}:${seatId}`;

  console.log(`\n[WORKER] Processing request for seat ${seatId} from user ${userId}...`);

  const lockAcquired = await redisClient.set(lockKey, 'processing', {
    NX: true,
    EX: config.lockTtl,
  });

  if (!lockAcquired) {
    console.log(`[FAILED] Could not acquire lock for ${lockKey}. Another process is handling it.`);
    return;
  }

  console.log(`[SUCCESS] Lock acquired for ${lockKey}`);
  // Get a client from the single, shared pool passed into this function
  const client = await pgPool.connect();

  try {
    await client.query('BEGIN');
    const res = await client.query(
      `UPDATE tickets SET status = 'reserved', user_id = $1, updated_at = NOW() WHERE event_id = $2 AND seat_id = $3 AND status = 'available'`,
      [userId, eventId, seatId]
    );

    if (res.rowCount > 0) {
      await client.query('COMMIT');
      console.log(`[SUCCESS] Seat ${seatId} booked successfully for user ${userId}.`);
    } else {
      await client.query('ROLLBACK');
      console.log(`[FAILED] Seat ${seatId} was not available. Booking failed.`);
    }
  } catch (dbError) {
    await client.query('ROLLBACK');
    console.error('Database transaction error:', dbError);
  } finally {
    client.release();
    await redisClient.del(lockKey);
    console.log(`[INFO] Lock released for ${lockKey}`);
  }
};

module.exports = { processBooking };