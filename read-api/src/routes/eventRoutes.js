const express = require('express');
const { getAllEvents, getEventById } = require('../controllers/eventController');

const router = express.Router();

// GET /api/events -> lists all events
router.get('/events', getAllEvents);

// GET /api/events/some-event-id -> gets details for a specific event
router.get('/events/:id', getEventById);

// Test route to verify routing is working
router.get('/events/test', (req, res) => {
  res.json({ message: 'Test route working', params: req.params });
});

module.exports = router;