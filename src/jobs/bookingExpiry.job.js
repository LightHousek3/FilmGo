const cron = require('node-cron');
const { Booking, Payment } = require('../models');
const { BOOKING_STATUS } = require('../constants');
const logger = require('../config/logger');

/**
 * Release expired PENDING bookings.
 *
 * Runs every minute.
 * Logic:
 *  1. Find all PENDING bookings whose expiresAt has passed.
 *  2. Cancel any associated PENDING payment records.
 *  3. Hard-delete the expired booking (no need to soft-delete; unconfirmed holds have no audit value).
 *
 * Seats do NOT need explicit status updates — availability is checked dynamically
 * against non-expired / confirmed bookings when a new booking is created.
 */
const releaseExpiredBookings = async () => {
    const now = new Date();

    const expired = await Booking.find({
        status: BOOKING_STATUS.PENDING,
        expiresAt: { $lte: now },
    }).select('_id');

    if (!expired.length) return;

    const expiredIds = expired.map((b) => b._id);

    // Cancel any PENDING payment records tied to these bookings
    await Payment.updateMany(
        { bookingId: { $in: expiredIds }, paymentStatus: 'PENDING' },
        { paymentStatus: 'CANCELLED' }
    );

    // Hard-delete the expired bookings (they were never confirmed)
    const result = await Booking.deleteMany({ _id: { $in: expiredIds } });

    logger.info(`[BookingExpiryJob] Released ${result.deletedCount} expired booking(s)`);
};

/**
 * Start the booking expiry cron job.
 * Schedule: every minute (* * * * *)
 */
const startBookingExpiryJob = () => {
    cron.schedule('* * * * *', async () => {
        try {
            await releaseExpiredBookings();
        } catch (error) {
            logger.error('[BookingExpiryJob] Error releasing expired bookings', error);
        }
    });

    logger.info('[BookingExpiryJob] Booking expiry scheduler started (every 1 minute)');
};

module.exports = { startBookingExpiryJob };
