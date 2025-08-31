import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Event {
  _id: string;
  event_id: string;
  name: string;
  date: string;
  // Optional fields for future enhancement
  description?: string;
  venue?: string;
  availableSeats?: number;
  totalSeats?: number;
  price?: number;
}

export interface BookingRequest {
  userId: number;
  eventId: number;
  seatId: string;
}

export interface BookingResponse {
  message: string;
  bookingId?: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export const ticketApi = {
  // Get all events
  getEvents: async (): Promise<Event[]> => {
    const response = await api.get('/api/events');
    return response.data;
  },

  // Get single event by ID
  getEventById: async (eventId: string): Promise<Event | null> => {
    try {
      const response = await api.get(`/api/events/${eventId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Book a ticket
  bookTicket: async (booking: BookingRequest): Promise<BookingResponse> => {
    const response = await api.post('/api/book', booking);
    return response.data;
  },
};

export default api;
