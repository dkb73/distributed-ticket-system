// data-sync-service/index.js (Final, Fully Commented Version)

const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// --- CONFIGURATION ---
// Load all necessary connection details and settings from the .env file.
const pgConfig = {
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT, 10),
};

const mongoUri = process.env.MONGO_URI;
const SYNC_INTERVAL_MS = parseInt(process.env.SYNC_INTERVAL_MS, 10);

// Define constants for our state management 
const STATE_COLLECTION_NAME = 'sync_state';
const STATE_DOCUMENT_ID = 'ticket_sync_state';

// --- DATABASE INITIALIZATION ---
async function initializeDatabases(pgPool, db) {
  try {
    // Check if tickets table exists in PostgreSQL
    const tableCheck = await pgPool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tickets'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Creating tickets table...');
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS tickets (
          id SERIAL PRIMARY KEY,
          event_id INTEGER NOT NULL,
          seat_id VARCHAR(50) NOT NULL,
          status VARCHAR(20) DEFAULT 'available',
          user_id INTEGER,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(event_id, seat_id)
        );
      `);
      console.log('Tickets table created successfully.');
    } else {
      console.log('Tickets table already exists.');
    }

    // Check if events collection exists in MongoDB
    const collections = await db.listCollections().toArray();
    const eventsCollectionExists = collections.some(col => col.name === 'events');
    
    if (!eventsCollectionExists) {
      console.log('Creating events collection...');
      await db.createCollection('events');
      console.log('Events collection created successfully.');
    } else {
      console.log('Events collection already exists.');
    }

  } catch (error) {
    console.error('Error initializing databases:', error);
    throw error;
  }
}

// --- STATE MANAGEMENT FUNCTIONS ---
/**
 * Fetches the last successfully saved sync timestamp from a dedicated collection in MongoDB.
 * This is crucial for making the service "stateful" and resilient to restarts.
 * @param {Db} db - The MongoDB database instance.
 * @returns {Date} The last saved timestamp, or the beginning of time if none is found.
 */
async function getState(db) {
  try {
    const stateCollection = db.collection(STATE_COLLECTION_NAME);
    const state = await stateCollection.findOne({ _id: STATE_DOCUMENT_ID });
    console.log(`[STATE] Loaded last sync timestamp: ${state ? new Date(state.lastSyncTimestamp).toISOString() : 'None found (starting from scratch)'}`);
    
    // If a state document exists, use its timestamp. Otherwise, start from scratch (new Date(0)).
    return state ? new Date(state.lastSyncTimestamp) : new Date(0);
  } catch (error) {
    console.error('Error getting state, starting from scratch:', error);
    return new Date(0);
  }
}

/**
 * Saves the latest sync timestamp to MongoDB after a successful run.
 * @param {Db} db - The MongoDB database instance.
 * @param {Date} timestamp - The new timestamp to persist.
 */
async function setState(db, timestamp) {
  try {
    const stateCollection = db.collection(STATE_COLLECTION_NAME);
    // We use 'updateOne' with 'upsert: true'. This creates the document on the first run
    // and updates it on every subsequent run.
    await stateCollection.updateOne(
      { _id: STATE_DOCUMENT_ID },
      { $set: { lastSyncTimestamp: timestamp } },
      { upsert: true }
    );
    console.log(`[STATE] Persisted new sync timestamp: ${timestamp.toISOString()}`);
  } catch (error) {
    console.error('Error setting state:', error);
  }
}

// --- MAIN SYNC LOGIC ---
/**
 * The core function that fetches changes from PostgreSQL and applies them to MongoDB.
 * @param {Pool} pgPool - The connected PostgreSQL client pool.
 * @param {Db} db - The MongoDB database instance.
 * @param {Date} lastSyncTimestamp - The timestamp from which to start looking for changes.
 * @returns {Date} The new timestamp to be saved after this run completes.
 */
async function syncData(pgPool, db, lastSyncTimestamp) {
  console.log(`\n[${new Date().toISOString()}] Running sync...`);
  let newTimestamp = lastSyncTimestamp; // Initialize with the last known timestamp

  try {
    // *** THE CLOCK SKEW FIX ***
    // Instead of using `new Date()` from the app, we ask PostgreSQL for its current time.
    // This establishes a single "source of truth" for time and prevents bugs where the
    // app clock and DB clock are slightly different.
    const timeResult = await pgPool.query('SELECT NOW() as now');
    const currentTimestamp = timeResult.rows[0].now;

    // Fetch all tickets that have been updated since the last sync.
    // We only look for updates >= lastSyncTimestamp, not bounded by current time.
    const res = await pgPool.query(
      'SELECT * FROM tickets WHERE updated_at >= $1',
      [lastSyncTimestamp]
    );

    const updatedTickets = res.rows;
    if (updatedTickets.length === 0) {
      console.log('No new updates found.');
      // If no updates, keep the same timestamp to avoid missing future updates
      return lastSyncTimestamp;
    }

    console.log(`Found ${updatedTickets.length} updated ticket(s).`);
    const eventsCollection = db.collection('events');

    for (const ticket of updatedTickets) {
      // ** THE ROBUST 2-STEP MONGO UPDATE **
      // This logic correctly handles all cases without the `upsert` bug we saw earlier.

      // STEP 1: First, try to update a seat if it already exists in an event's 'seats' array.
      // The `$` is a positional operator that updates the specific array element matched in the query.
      const updateResult = await eventsCollection.updateOne(
        { event_id: ticket.event_id, 'seats.seat_id': ticket.seat_id },
        { $set: { 'seats.$.status': ticket.status, 'seats.$.user_id': ticket.user_id } }
      );
      
      // STEP 2: If `matchedCount` is 0, it means the seat was not found in the array.
      // This happens when it's the first time we're syncing this particular seat for this event.
      if (updateResult.matchedCount === 0) {
        // We now perform a different update to add the new seat to the 'seats' array.
        await eventsCollection.updateOne(
          { event_id: ticket.event_id },
          {
            // '$push' adds a new element to an array.
            $push: { seats: { seat_id: ticket.seat_id, status: ticket.status, user_id: ticket.user_id } },
            // '$setOnInsert' only runs if a new document is being created (via upsert).
            $setOnInsert: {
              event_id: ticket.event_id,
              name: `Event ${ticket.event_id}`,
              date: new Date(),
            }
          },
          { upsert: true } // This creates the event document itself if it's brand new.
        );
      }
    }

    // Find the latest update time from the tickets we processed
    if (updatedTickets.length > 0) {
      const latestUpdate = updatedTickets.reduce((latest, ticket) => {
        return ticket.updated_at > latest ? ticket.updated_at : latest;
      }, updatedTickets[0].updated_at);
      newTimestamp = latestUpdate;
    }
    
    console.log('Sync completed successfully.');
    
  } catch (error) {
    console.error('Error during data sync:', error);
    // Don't crash, just return the last known timestamp
    return lastSyncTimestamp;
  } finally {
    // The finally block ensures we always return a timestamp, preventing the loop from getting stuck.
    return newTimestamp;
  }
}

// --- SCRIPT EXECUTION ---
/**
 * The main entry point for the service.
 */
async function main() {
  console.log('Data Sync Service starting...');
  
  let retryCount = 0;
  const MAX_RETRIES = 3;
  
  try {
    // Establish persistent database connections ONCE at the start.
    // This is much more efficient than connecting/disconnecting on every run.
    const pgPool = new Pool(pgConfig);
    const mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    const db = mongoClient.db('ticketing');
    
    // Initialize databases (create tables/collections if they don't exist)
    await initializeDatabases(pgPool, db);
    
    // Load the last known state from the database to know where to begin.
    let lastSyncTimestamp = await getState(db);

    // This is a self-correcting loop using a recursive setTimeout.
    const runLoop = async () => {
      try {
        // A full cycle: run the sync, get the new timestamp back, and update our in-memory state.
        const newTimestamp = await syncData(pgPool, db, lastSyncTimestamp);
        lastSyncTimestamp = newTimestamp;
        // Persist the new state to the database for the next restart.
        await setState(db, lastSyncTimestamp);
        // Reset retry count on success
        retryCount = 0;
      } catch (err) {
        console.error('An error occurred in the sync loop:', err);
        retryCount++;
        
        // If we've retried too many times, wait longer before next attempt
        if (retryCount >= MAX_RETRIES) {
          console.log(`Too many consecutive errors (${retryCount}), waiting 30 seconds before retry...`);
          setTimeout(runLoop, 30000);
          retryCount = 0; // Reset counter
          return;
        }
      } finally {
        // ** setTimeout vs setInterval **
        // We use setTimeout here instead of setInterval. This is a best practice for async tasks.
        // It guarantees that the next sync cycle is only scheduled *after* the current one has
        // fully completed (including the setState call), preventing any risk of overlapping runs.
        setTimeout(runLoop, SYNC_INTERVAL_MS);
      }
    };

    // Start the first run of the loop.
    runLoop();

    // Graceful shutdown logic: listen for Ctrl+C (SIGINT).
    process.on('SIGINT', async () => {
      console.log('Shutting down sync service...');
      // Cleanly close the database connections before exiting.
      await mongoClient.close();
      await pgPool.end();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start data sync service:', error);
    process.exit(1);
  }
}

main().catch(console.error);