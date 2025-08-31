const { Pool } = require('pg');
const config = require('../config');

const pgPool = new Pool(config.postgres);

// Initialize database with required tables and sample data
async function initializeDatabase() {
  try {
    // Check if tickets table exists
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
      
      // Insert sample data
      console.log('Inserting sample tickets...');
      await pgPool.query(`
        INSERT INTO tickets (event_id, seat_id, status) VALUES
        (1, 'A1', 'available'),
        (1, 'A2', 'available'),
        (1, 'A3', 'available'),
        (1, 'B1', 'available'),
        (1, 'B2', 'available'),
        (2, 'A1', 'available'),
        (2, 'A2', 'available'),
        (2, 'B1', 'available')
        ON CONFLICT (event_id, seat_id) DO NOTHING;
      `);
      
      console.log('Database initialized successfully.');
    } else {
      console.log('Tickets table already exists.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

module.exports = { pgPool, initializeDatabase };