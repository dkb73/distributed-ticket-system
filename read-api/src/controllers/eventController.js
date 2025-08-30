const Event = require('../models/eventModel');

// Controllers to get a list of all events
// We exclude the detailed 'seats' array from this list view for efficiency.
const getAllEvents = async (req, res) => {
  try {
    // The second argument to find() is a "projection"
    // '-seats' means exclude the seats field from the results.
    const events = await Event.find({}, '-seats');
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controllers to get a single event by its event_id, including all seat details
const getEventById = async (req, res) => {
  try {
    const event = await Event.findOne({ event_id: req.params.id });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error(`Error fetching event ${req.params.id}:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
};