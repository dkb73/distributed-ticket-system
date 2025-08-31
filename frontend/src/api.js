import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ticketApi = {
  // Get all events
  getEvents: async () => {
    try {
      const response = await api.get('/api/events');
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },

  // Get single event by ID
  getEventById: async (eventId) => {
    try {
      const response = await api.get(`/api/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  },

  // Book a ticket
  bookTicket: async (booking) => {
    try {
      const response = await api.post('/api/book', booking);
      return response.data;
    } catch (error) {
      console.error('Error booking ticket:', error);
      throw error;
    }
  },
};

export default api;
