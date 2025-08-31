'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import EventCard from '@/components/EventCard';
import { Event } from '@/lib/api';
import { ticketApi } from '@/lib/api';
import { Calendar, Users, Zap, Shield } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await ticketApi.getEvents();
        setEvents(data.slice(0, 3)); // Show only first 3 events on home
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Book Your Tickets
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Experience the power of distributed ticketing with CQRS architecture
          </p>
          <Link 
            href="/events" 
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Browse Events
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Our System?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">High Performance</h3>
              <p className="text-gray-600">Built with microservices and event-driven architecture</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reliable</h3>
              <p className="text-gray-600">Distributed locks prevent double bookings</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Scalable</h3>
              <p className="text-gray-600">CQRS pattern separates read and write operations</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time</h3>
              <p className="text-gray-600">Live updates with Kafka message streaming</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Events
            </h2>
            <Link 
              href="/events" 
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View All Events →
            </Link>
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Architecture Info */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            System Architecture
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Write Path</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• API Gateway receives booking requests</li>
                  <li>• Write API publishes to Kafka</li>
                  <li>• Workers process with Redis locks</li>
                  <li>• PostgreSQL stores confirmed bookings</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Read Path</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Read API serves from MongoDB</li>
                  <li>• Data sync service keeps consistency</li>
                  <li>• Optimized for fast queries</li>
                  <li>• Real-time event availability</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
