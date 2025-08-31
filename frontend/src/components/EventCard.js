import React from 'react';

function EventCard({ event, onViewDetails }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="card">
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#1f2937' }}>
        {event.name}
      </h3>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
        Event ID: {event.event_id}
      </p>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Date:</strong> {formatDate(event.date)}
      </div>
      <button 
        className="btn" 
        onClick={() => onViewDetails(event)}
        style={{ width: '100%' }}
      >
        View Details
      </button>
    </div>
  );
}

export default EventCard;
