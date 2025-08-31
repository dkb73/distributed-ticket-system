import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import EventCard from './components/EventCard';
import BookingForm from './components/BookingForm';
import { ticketApi } from './api';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await ticketApi.getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedEvent(null);
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setCurrentPage('event-detail');
  };

  const handleBookingComplete = () => {
    // Refresh events after booking
    fetchEvents();
  };

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.event_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderHomePage = () => (
    <div>
      <div className="hero">
        <div className="container">
          <h1>Book Your Tickets</h1>
          <p>Experience the power of distributed ticketing with CQRS architecture</p>
          <button 
            className="btn" 
            onClick={() => setCurrentPage('events')}
            style={{ fontSize: '1.125rem', padding: '0.75rem 2rem' }}
          >
            Browse Events
          </button>
        </div>
      </div>

      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Featured Events</h2>
          <p style={{ color: '#6b7280' }}>Latest events available for booking</p>
        </div>

        {loading ? (
          <div className="loading">Loading events...</div>
        ) : (
          <div className="grid">
            {filteredEvents.slice(0, 3).map((event) => (
              <EventCard 
                key={event._id} 
                event={event} 
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setCurrentPage('events')}
          >
            View All Events
          </button>
        </div>
      </div>
    </div>
  );

  const renderEventsPage = () => (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>All Events</h1>
        <p style={{ color: '#6b7280' }}>Browse and book tickets for upcoming events</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Search events by name or event ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input"
          style={{ maxWidth: '400px' }}
        />
      </div>

      {loading ? (
        <div className="loading">Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="loading">
          {searchTerm ? 'No events found matching your search.' : 'No events are currently available.'}
        </div>
      ) : (
        <div className="grid">
          {filteredEvents.map((event) => (
            <EventCard 
              key={event._id} 
              event={event} 
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderEventDetailPage = () => {
    if (!selectedEvent) {
      return (
        <div className="container">
          <div className="loading">Event not found</div>
        </div>
      );
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return (
      <div className="container">
        <button 
          className="btn btn-secondary" 
          onClick={() => setCurrentPage('events')}
          style={{ marginBottom: '2rem' }}
        >
          ← Back to Events
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div className="card">
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{selectedEvent.name}</h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Event ID: {selectedEvent.event_id}
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <strong>Date & Time:</strong> {formatDate(selectedEvent.date)}
            </div>

            <div style={{ 
              background: '#f8fafc', 
              padding: '1rem', 
              borderRadius: '0.375rem',
              marginTop: '2rem'
            }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Event Information</h3>
              <p style={{ color: '#6b7280' }}>
                This is a sample event. Additional details like venue, pricing, and seat availability 
                would be displayed here in a real application.
              </p>
            </div>
          </div>

          <div>
            <BookingForm 
              event={selectedEvent} 
              onBookingComplete={handleBookingComplete}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Header currentPage={currentPage} onPageChange={handlePageChange} />
      
      {currentPage === 'home' && renderHomePage()}
      {currentPage === 'events' && renderEventsPage()}
      {currentPage === 'event-detail' && renderEventDetailPage()}
    </div>
  );
}

export default App;
