const express = require('express');
const { createBooking } = require('../controllers/bookingController');

const router = express.Router();

// Define that a POST request to /book will be handled by the createBooking controllers
router.post('/book', createBooking);

module.exports = router;