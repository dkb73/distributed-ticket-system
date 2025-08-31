# Ticket Booking System Frontend

A simple React frontend for the distributed ticket booking system.

## Features

- 🎫 **Event Browsing**: View all available events
- 📅 **Event Details**: Detailed event information with booking functionality
- 🎯 **Real-time Booking**: Book tickets with immediate feedback
- 📱 **Responsive Design**: Works on all devices
- 🔍 **Search**: Find events by name or event ID

## Tech Stack

- **Framework**: React 18
- **HTTP Client**: Axios
- **Styling**: CSS (no external dependencies)

## Getting Started

### Prerequisites

- Node.js 14+ installed
- Backend services running (see main README.md)

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── public/
│   └── index.html          # Main HTML file with styles
├── src/
│   ├── components/         # React components
│   │   ├── Header.js       # Navigation header
│   │   ├── EventCard.js    # Event display card
│   │   └── BookingForm.js  # Ticket booking form
│   ├── api.js             # API client
│   ├── App.js             # Main app component
│   └── index.js           # App entry point
└── package.json           # Dependencies and scripts
```

## API Integration

The frontend connects to your backend at `http://localhost:8080`:

- **GET** `/api/events` → Fetch all events
- **POST** `/api/book` → Book a ticket

## Usage

1. **Home Page**: Overview with featured events
2. **Events Page**: Complete list with search functionality
3. **Event Detail**: Individual event with booking form

## Building for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.
