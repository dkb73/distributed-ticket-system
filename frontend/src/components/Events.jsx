import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services/api';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const eventsData = await eventService.getAllEvents();
      setEvents(eventsData);
    } catch (err) {
      setError(err.message || 'Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchEvents();
  };

  if (loading) {
    return (
      <div className="events-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-container">
        <div className="error">
          <h3>❌ Error Loading Events</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-btn">
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="events-container">
      <div className="events-header">
        <h2>🎫 Events Demo</h2>
        <p>Successfully connected to backend through nginx!</p>
        <button onClick={handleRefresh} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {events.length === 0 ? (
        <div className="no-events">
          <h3>📭 No Events Found</h3>
          <p>The database appears to be empty. Try adding some events first.</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event._id || event.event_id} className="event-card">
              <div className="event-header">
                <h3>{event.name || 'Unnamed Event'}</h3>
                <span className="event-id">ID: {event.event_id}</span>
              </div>
              
              <div className="event-details">
                <p><strong>Date:</strong> {event.date || 'Not specified'}</p>
                <p><strong>Venue:</strong> {event.venue || 'Not specified'}</p>
                <p><strong>Description:</strong> {event.description || 'No description available'}</p>
              </div>

              <div className="event-stats">
                <div className="stat">
                  <span className="stat-label">Total Seats:</span>
                  <span className="stat-value">{event.total_seats || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Available:</span>
                  <span className="stat-value">{event.available_seats || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Price:</span>
                  <span className="stat-value">${event.price || 0}</span>
                </div>
              </div>

              <div className="event-actions">
                <Link 
                  to={`/event/${event.event_id}`} 
                  className="view-details-btn"
                >
                  📋 View Details
                </Link>
                {event.available_seats > 0 && (
                  <Link 
                    to={`/event/${event.event_id}/booking`} 
                    className="book-now-btn"
                  >
                    🎫 Book Now
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="events-footer">
        <p>✅ Frontend successfully connected to backend API through nginx gateway</p>
        <p>🔗 API Endpoint: http://localhost:8080/api/events</p>
        <p>📊 Total Events: {events.length}</p>
      </div>
    </div>
  );
};

export default Events;
