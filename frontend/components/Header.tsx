'use client';

import Link from 'next/link';
import { Ticket, Home, Calendar } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Ticket className="h-8 w-8 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">Ticket System</h1>
          </div>
          
          <nav className="flex space-x-8">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link 
              href="/events" 
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Calendar className="h-5 w-5" />
              <span>Events</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
