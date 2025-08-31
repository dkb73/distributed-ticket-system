'use client';

import { useState } from 'react';
import { Event, BookingRequest } from '@/lib/api';
import { ticketApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface BookingFormProps {
  event: Event;
  onBookingComplete?: () => void;
}

export default function BookingForm({ event, onBookingComplete }: BookingFormProps) {
  const [formData, setFormData] = useState({
    userId: '',
    seatId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.seatId) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setBookingStatus('idle');

    try {
      const booking: BookingRequest = {
        userId: parseInt(formData.userId),
        eventId: event.id,
        seatId: formData.seatId,
      };

      const response = await ticketApi.bookTicket(booking);
      
      if (response.status === 'confirmed') {
        setBookingStatus('success');
        toast.success('Ticket booked successfully!');
        setFormData({ userId: '', seatId: '' });
        onBookingComplete?.();
      } else if (response.status === 'pending') {
        toast.success('Booking request submitted! Processing...');
        setFormData({ userId: '', seatId: '' });
        onBookingComplete?.();
      } else {
        setBookingStatus('error');
        toast.error(response.message || 'Booking failed');
      }
    } catch (error: any) {
      setBookingStatus('error');
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Book Tickets for {event.name}
      </h3>
      
      {bookingStatus === 'success' && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span>Booking successful!</span>
          </div>
        </div>
      )}
      
      {bookingStatus === 'error' && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-800">
            <XCircle className="h-5 w-5" />
            <span>Booking failed. Please try again.</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
            User ID
          </label>
          <input
            type="number"
            id="userId"
            name="userId"
            value={formData.userId}
            onChange={handleInputChange}
            className="input-field"
            placeholder="Enter your user ID"
            required
          />
        </div>

        <div>
          <label htmlFor="seatId" className="block text-sm font-medium text-gray-700 mb-1">
            Seat ID
          </label>
          <input
            type="text"
            id="seatId"
            name="seatId"
            value={formData.seatId}
            onChange={handleInputChange}
            className="input-field"
            placeholder="e.g., A1, B2, C3"
            required
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Event: {event.name}</div>
            <div>Price: ${event.price}</div>
            <div>Available Seats: {event.availableSeats}</div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{isLoading ? 'Processing...' : 'Book Ticket'}</span>
        </button>
      </form>
    </div>
  );
}
