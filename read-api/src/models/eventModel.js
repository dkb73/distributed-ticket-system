const mongoose = require('mongoose');

// Define the schema for a single seat
const SeatSchema = new mongoose.Schema({
  seat_id: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'reserved', 'booked'], // Define possible statuses
    default: 'available',
  },
}, { _id: false }); // _id: false prevents Mongoose from adding an _id to subdocuments

// Define the main schema for an event
const EventSchema = new mongoose.Schema({
  event_id: {
    type: String,
    required: true,
    unique: true, // Each event_id should be unique
  },
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  seats: [SeatSchema], // An array of seat subdocuments
}, { timestamps: true }); // timestamps: true adds createdAt and updatedAt fields

// Create and export the Mongoose model
const Event = mongoose.model('Event', EventSchema);

module.exports = Event;