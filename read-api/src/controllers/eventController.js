const Event = require('../models/eventModel');

// Controllers to get a list of all events
// We exclude the detailed 'seats' array from this list view for efficiency.
const getAllEvents = async (req, res) => {
  try {
    // The second argument to find() is a "projection"
    // '-seats' means exclude the seats field from the results.
    
    console.log('🔍 DEBUG: Request received for event_id:', req.params.id);
    console.log('🔍 DEBUG: Type of event_id:', typeof req.params.id);
    console.log('🔍 DEBUG: Parsed event_id:', parseInt(req.params.id));
    
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
    console.log('🔍 DEBUG: Request received for event_id:', req.params.id);
    console.log('🔍 DEBUG: Type of event_id:', typeof req.params.id);
    console.log('🔍 DEBUG: Parsed event_id:', parseInt(req.params.id));
    
    const event = await Event.findOne({ event_id: req.params.id });
    
    console.log('🔍 DEBUG: MongoDB query result:', event);
    console.log('�� DEBUG: Event found:', !!event);
    
    if (!event) {
      console.log('🔍 DEBUG: No event found, returning 404');
      return res.status(404).json({ message: 'Event not found' });
    }

    console.log('�� DEBUG: Event found, returning success');
    res.status(200).json(event);
  } catch (error) {
    console.error('🔍 DEBUG: Error occurred:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
};