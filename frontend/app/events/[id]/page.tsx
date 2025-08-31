'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BookingForm from '@/components/BookingForm';
import { Event } from '@/lib/api';
import { ticketApi } from '@/lib/api';
import { Calendar, MapPin, Users, DollarSign, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const events = await ticketApi.getEvents();
        const foundEvent = events.find(e => e.id === parseInt(params.id as string));
        
        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          setError('Event not found');
        }
      } catch (error) {
        console.error('Failed to fetch event:', error);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  const handleBookingComplete = () => {
    // Refresh event data to show updated seat availability
    if (event) {
      ticketApi.getEvents().then(events => {
        const updatedEvent = events.find(e => e.id === event.id);
        if (updatedEvent) {
          setEvent(updatedEvent);
        }
      });
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Event not found'}
            </h1>
            <Link 
              href="/events" 
              className="btn-primary"
            >
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
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
    <div>
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          href="/events" 
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Events</span>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            <div className="card">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {event.name}
              </h1>
              
              <p className="text-gray-600 mb-6">
                {event.description}
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Date & Time</p>
                    <p className="text-gray-600">{formatDate(event.date)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Venue</p>
                    <p className="text-gray-600">{event.venue}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Seating</p>
                    <p className="text-gray-600">
                      {event.availableSeats} of {event.totalSeats} seats available
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Price</p>
                    <p className="text-gray-600">${event.price} per ticket</p>
                  </div>
                </div>
              </div>

              {/* Availability Status */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-900">Availability</span>
                </div>
                <p className="text-gray-600 mt-1">
                  {event.availableSeats > 0 
                    ? `${event.availableSeats} seats remaining` 
                    : 'Sold out'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <BookingForm 
              event={event} 
              onBookingComplete={handleBookingComplete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
