'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import EventCard from '@/components/EventCard';
import { Event } from '@/lib/api';
import { ticketApi } from '@/lib/api';
import { Search, Filter } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'name'>('date');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await ticketApi.getEvents();
        setEvents(data);
        setFilteredEvents(data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = events.filter(event =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'price':
          return a.price - b.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);
  }, [events, searchTerm, sortBy]);

  return (
    <div>
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            All Events
          </h1>
          <p className="text-gray-600">
            Browse and book tickets for upcoming events
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search events by name or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'name')}
              className="input-field"
            >
              <option value="date">Sort by Date</option>
              <option value="price">Sort by Price</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms.' : 'No events are currently available.'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Results count */}
        {!loading && filteredEvents.length > 0 && (
          <div className="mt-8 text-center text-gray-600">
            Showing {filteredEvents.length} of {events.length} events
          </div>
        )}
      </div>
    </div>
  );
}
