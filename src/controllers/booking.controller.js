const { bookingService } = require('../services');
const { asyncHandler, ResponseHandler, pick } = require('../utils');
const { messages } = require('../constants');

/**
 * POST /bookings
 * Create a booking (customer). Returns the booking + 10-minute hold.
 */
const createBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.createBooking(req.user.id, req.body);
    ResponseHandler.created(res, {
        message: messages.BOOKING.BOOKING_SUCCESS,
        data: booking,
    });
});

/**
 * GET /bookings/me
 * Get current user's bookings (paginated).
 */
const getMyBookings = asyncHandler(async (req, res) => {
    const filter = pick(req.query, ['status']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await bookingService.getUserBookings(req.user.id, filter, options);

    ResponseHandler.paginated(res, {
        message: messages.CRUD.LIST_FETCHED('Bookings'),
        data: result.results,
        meta: result.meta,
    });
});

/**
 * GET /bookings/:id
 * Get booking detail (owner or admin).
 */
const getBooking = asyncHandler(async (req, res) => {
    const isAdmin = req.user.role === 'ADMIN';
    const booking = await bookingService.getBookingById(req.params.id, req.user.id, isAdmin);
    ResponseHandler.success(res, {
        message: messages.CRUD.FETCHED('Booking'),
        data: booking,
    });
});

/**
 * PATCH /bookings/:id/cancel
 * Cancel a PENDING_PAYMENT booking (owner only).
 */
const cancelBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.cancelBooking(req.params.id, req.user.id);
    ResponseHandler.success(res, {
        message: messages.BOOKING.BOOKING_CANCELLED,
        data: booking,
    });
});

/**
 * GET /bookings (admin only)
 * List all bookings with optional filters.
 */
const getBookings = asyncHandler(async (req, res) => {
    const filter = pick(req.query, ['status', 'user', 'showtime']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await bookingService.getBookings(filter, options);

    ResponseHandler.paginated(res, {
        message: messages.CRUD.LIST_FETCHED('Bookings'),
        data: result.results,
        meta: result.meta,
    });
});

module.exports = {
    createBooking,
    getMyBookings,
    getBooking,
    cancelBooking,
    getBookings,
};
