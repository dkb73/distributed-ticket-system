import React from 'react';

function Header({ currentPage, onPageChange }) {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">🎫 Ticket System</div>
          <nav className="nav">
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                onPageChange('home');
              }}
              style={{ color: currentPage === 'home' ? '#2563eb' : '#666' }}
            >
              Home
            </a>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                onPageChange('events');
              }}
              style={{ color: currentPage === 'events' ? '#2563eb' : '#666' }}
            >
              Events
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
