import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventService } from '../services/api';
import './EventDetails.css';

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const eventData = await eventService.getEventById(eventId);
      setEvent(eventData);
    } catch (err) {
      setError(err.message || 'Failed to fetch event details');
      console.error('Error fetching event details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    navigate(`/event/${eventId}/booking`);
  };

  if (loading) {
    return (
      <div className="event-details-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-details-container">
        <div className="error">
          <h3>❌ Error Loading Event</h3>
          <p>{error}</p>
          <Link to="/" className="back-btn">
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-details-container">
        <div className="no-event">
          <h3>📭 Event Not Found</h3>
          <p>The event you're looking for doesn't exist.</p>
          <Link to="/" className="back-btn">
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="event-details-container">
      <div className="event-details-header">
        <Link to="/" className="back-link">
          ← Back to Events
        </Link>
        <h1>🎫 {event.name || 'Event Details'}</h1>
      </div>

      <div className="event-details-content">
        <div className="event-main-info">
          <div className="event-basic-details">
            <h2>{event.name || 'Unnamed Event'}</h2>
            <div className="event-meta">
              <div className="meta-item">
                <span className="meta-label">📅 Date:</span>
                <span className="meta-value">{event.date || 'Not specified'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">📍 Venue:</span>
                <span className="meta-value">{event.venue || 'Not specified'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">💰 Price:</span>
                <span className="meta-value">${event.price || 0}</span>
              </div>
            </div>
          </div>

          <div className="event-stats">
            <div className="stat-card">
              <div className="stat-number">{event.seats ? event.seats.length : 0}</div>
              <div className="stat-label">Total Seats</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {event.seats ? event.seats.filter(seat => seat.status === 'available').length : 0}
              </div>
              <div className="stat-label">Available</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {event.seats ? event.seats.filter(seat => seat.status === 'booked').length : 0}
              </div>
              <div className="stat-label">Booked</div>
            </div>
          </div>
        </div>

        <div className="event-description">
          <h3>📝 Description</h3>
          <p>{event.description || 'No description available for this event.'}</p>
        </div>

        {event.seats && event.seats.length > 0 && (
          <div className="seats-preview">
            <h3>🪑 Seats Preview</h3>
            <div className="seats-grid">
              {event.seats.slice(0, 20).map((seat, index) => (
                <div 
                  key={index} 
                  className={`seat ${seat.status}`}
                  title={`Seat ${seat.seat_id} - ${seat.status.charAt(0).toUpperCase() + seat.status.slice(1)}`}
                >
                  {seat.seat_id}
                </div>
              ))}
              {event.seats.length > 20 && (
                <div className="more-seats">
                  +{event.seats.length - 20} more seats
                </div>
              )}
            </div>
          </div>
        )}

        <div className="booking-section">
          <div className="booking-info">
            <h3>🎟️ Ready to Book?</h3>
            <p>Click the button below to proceed with seat booking for this event.</p>
          </div>
          <button 
            onClick={handleBookNow}
            className="book-now-btn"
            disabled={!event.seats || event.seats.filter(seat => seat.status === 'available').length === 0}
          >
            {event.seats && event.seats.filter(seat => seat.status === 'available').length > 0 ? '🎫 Book Now' : '❌ Sold Out'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
