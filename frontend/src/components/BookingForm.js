import React, { useState } from 'react';
import { ticketApi } from '../api';

function BookingForm({ event, onBookingComplete }) {
  const [formData, setFormData] = useState({
    userId: '',
    seatId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.seatId) {
      setMessage('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const booking = {
        userId: parseInt(formData.userId),
        eventId: parseInt(event.event_id.replace(/\D/g, '')), // Extract numbers from event_id
        seatId: formData.seatId,
      };

      const response = await ticketApi.bookTicket(booking);
      
      if (response.status === 'confirmed' || response.status === 'pending') {
        setMessage('Booking successful!');
        setFormData({ userId: '', seatId: '' });
        onBookingComplete && onBookingComplete();
      } else {
        setMessage(response.message || 'Booking failed');
      }
    } catch (error) {
      setMessage('Booking failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1rem' }}>Book Tickets for {event.name}</h3>
      
      {message && (
        <div className={message.includes('successful') ? 'success' : 'error'}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            User ID
          </label>
          <input
            type="number"
            name="userId"
            value={formData.userId}
            onChange={handleInputChange}
            className="input"
            placeholder="Enter your user ID"
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Seat ID
          </label>
          <input
            type="text"
            name="seatId"
            value={formData.seatId}
            onChange={handleInputChange}
            className="input"
            placeholder="e.g., A1, B2, C3"
            required
          />
        </div>

        <div style={{ 
          background: '#f8fafc', 
          padding: '1rem', 
          borderRadius: '0.375rem', 
          marginBottom: '1rem' 
        }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Booking Summary</h4>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            <div>Event: {event.name}</div>
            <div>Event ID: {event.event_id}</div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn"
          style={{ width: '100%' }}
        >
          {isLoading ? 'Processing...' : 'Book Ticket'}
        </button>
      </form>
    </div>
  );
}

export default BookingForm;
