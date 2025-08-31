'use client';

import { Event } from '@/lib/api';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {event.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {event.description}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(event.date)}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{event.venue}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{event.availableSeats} of {event.totalSeats} seats available</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>${event.price}</span>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <Link 
            href={`/events/${event.id}`}
            className="btn-primary w-full text-center"
          >
            Book Tickets
          </Link>
        </div>
      </div>
    </div>
  );
}
