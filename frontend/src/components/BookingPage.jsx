import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventService, bookingService } from '../services/api';
import toast from 'react-hot-toast';
import './BookingPage.css';

const BookingPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    seatId: ''
  });

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const eventData = await eventService.getEventById(eventId);
      setEvent(eventData);
    } catch (err) {
      toast.error('Failed to load event details');
      console.error('Error fetching event details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.userId.trim() || !formData.seatId.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setBooking(true);
      const result = await bookingService.bookSeat(eventId, formData.userId, formData.seatId);
      
      toast.success('🎉 Seat booked successfully!');
      
      // Reset form
      setFormData({ userId: '', seatId: '' });
      
      // Redirect to event details after a short delay
      setTimeout(() => {
        navigate(`/event/${eventId}`);
      }, 2000);
      
    } catch (error) {
      console.error('Booking error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to book seat';
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading booking form...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="booking-container">
        <div className="error">
          <h3>❌ Event Not Found</h3>
          <p>Unable to load event details for booking.</p>
          <Link to="/" className="back-btn">
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <div className="booking-header">
        <Link to={`/event/${eventId}`} className="back-link">
          ← Back to Event
        </Link>
        <h1>🎫 Book Your Seat</h1>
        <p>Complete your booking for <strong>{event.name}</strong></p>
      </div>

      <div className="booking-content">
        <div className="event-summary">
          <h3>📋 Event Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Event:</span>
              <span className="summary-value">{event.name}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Date:</span>
              <span className="summary-value">{event.date || 'Not specified'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Venue:</span>
              <span className="summary-value">{event.venue || 'Not specified'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Price:</span>
              <span className="summary-value">${event.price || 0}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Available Seats:</span>
              <span className="summary-value">
                {event.seats ? event.seats.filter(seat => seat.status === 'available').length : 0}
              </span>
            </div>
          </div>
        </div>

        <div className="booking-form-section">
          <h3>🎟️ Booking Details</h3>
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label htmlFor="userId">
                👤 User ID <span className="required">*</span>
              </label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                placeholder="Enter your user ID"
                required
                disabled={booking}
              />
              <small>Enter your unique user identifier</small>
            </div>

            <div className="form-group">
              <label htmlFor="seatId">
                🪑 Seat ID <span className="required">*</span>
              </label>
              <input
                type="text"
                id="seatId"
                name="seatId"
                value={formData.seatId}
                onChange={handleInputChange}
                placeholder="Enter desired seat ID"
                required
                disabled={booking}
              />
              <small>Enter the seat number you want to book</small>
            </div>

            <div className="form-actions">
                             <button
                 type="submit"
                 className="submit-btn"
                 disabled={booking || !event.seats || event.seats.filter(seat => seat.status === 'available').length === 0}
               >
                 {booking ? (
                   <>
                     <div className="btn-spinner"></div>
                     Processing...
                   </>
                 ) : (
                   <>
                     🎫 Book Seat
                   </>
                 )}
               </button>
              
              <Link to={`/event/${eventId}`} className="cancel-btn">
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {event.seats && event.seats.length > 0 && (
          <div className="seats-reference">
            <h3>🪑 Available Seats Reference</h3>
            <div className="seats-grid">
              {event.seats.slice(0, 30).map((seat, index) => (
                <div 
                  key={index} 
                  className={`seat ${seat.status}`}
                  title={`Seat ${seat.seat_id} - ${seat.status.charAt(0).toUpperCase() + seat.status.slice(1)}`}
                >
                  {seat.seat_id}
                </div>
              ))}
              {event.seats.length > 30 && (
                <div className="more-seats">
                  +{event.seats.length - 30} more
                </div>
              )}
            </div>
            <div className="seats-legend">
              <div className="legend-item">
                <div className="legend-color available"></div>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <div className="legend-color reserved"></div>
                <span>Reserved</span>
              </div>
              <div className="legend-item">
                <div className="legend-color booked"></div>
                <span>Booked</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
