const express = require('express');
const { getAllEvents, getEventById } = require('../controllers/eventController');

const router = express.Router();

// GET /api/events -> lists all events
router.get('/events', getAllEvents);

// GET /api/events/some-event-id -> gets details for a specific event
router.get('/events/:id', getEventById);

module.exports = router;