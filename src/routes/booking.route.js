const express = require('express');
const { bookingController } = require('../controllers');
const { authenticate, authorize, validate } = require('../middlewares');
const { bookingValidator } = require('../validators');
const { USER_ROLE } = require('../constants');

const router = express.Router();

// ═══════════════════════════════════════════════
// Customer routes (authenticated)
// ═══════════════════════════════════════════════

/**
 * @route   POST /api/v1/bookings
 * @desc    Create a booking (10-min seat hold, pending payment)
 * @access  Customer
 */
router.post(
    '/',
    authenticate,
    validate(bookingValidator.createBooking),
    bookingController.createBooking
);

/**
 * @route   GET /api/v1/bookings/me
 * @desc    Get current user's bookings
 * @access  Customer
 */
router.get(
    '/me',
    authenticate,
    validate(bookingValidator.getUserBookings),
    bookingController.getMyBookings
);

/**
 * @route   GET /api/v1/bookings/:id
 * @desc    Get booking detail (owner or admin)
 * @access  Customer / Admin
 */
router.get(
    '/:id',
    authenticate,
    validate(bookingValidator.getBookingById),
    bookingController.getBooking
);

/**
 * @route   PATCH /api/v1/bookings/:id/cancel
 * @desc    Cancel a PENDING booking
 * @access  Customer (owner)
 */
router.patch(
    '/:id/cancel',
    authenticate,
    validate(bookingValidator.cancelBooking),
    bookingController.cancelBooking
);

// ═══════════════════════════════════════════════
// Admin routes
// ═══════════════════════════════════════════════

/**
 * @route   GET /api/v1/bookings
 * @desc    Admin: list all bookings
 * @access  Admin
 */
router.get(
    '/',
    authenticate,
    authorize(USER_ROLE.ADMIN),
    validate(bookingValidator.getBookings),
    bookingController.getBookings
);

module.exports = router;
