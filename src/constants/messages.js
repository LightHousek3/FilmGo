/**
 * Centralized message constants
 */
const messages = {
    // Auth
    AUTH: {
        LOGIN_SUCCESS: 'Login successful',
        LOGOUT_SUCCESS: 'Logout successful',
        REGISTER_SUCCESS: 'Registration successful. Please verify your email.',
        TOKEN_REFRESHED: 'Token refreshed successfully',
        INVALID_CREDENTIALS: 'Invalid email or password',
        UNAUTHORIZED: 'Please authenticate',
        FORBIDDEN: 'You do not have permission to perform this action',
        EMAIL_ALREADY_EXISTS: 'Email already registered',
        EMAIL_NOT_VERIFIED: 'Please verify your email first',
        INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
        ACCOUNT_BLOCKED: 'Your account has been blocked',
        ACCOUNT_INACTIVE: 'Your account is inactive',
        VERIFICATION_EMAIL_SENT: 'Verification email sent',
        EMAIL_VERIFIED: 'Email verified successfully',
        INVALID_VERIFICATION_TOKEN: 'Invalid or expired verification token',
    },

    // Generic CRUD
    CRUD: {
        CREATED: (resource) => `${resource} created successfully`,
        UPDATED: (resource) => `${resource} updated successfully`,
        DELETED: (resource) => `${resource} deleted successfully`,
        FETCHED: (resource) => `${resource} fetched successfully`,
        NOT_FOUND: (resource) => `${resource} not found`,
        ALREADY_EXISTS: (resource) => `${resource} already exists`,
        LIST_FETCHED: (resource) => `${resource} list fetched successfully`,
    },

    // Validation
    VALIDATION: {
        FAILED: 'Validation failed',
        INVALID_OBJECT_ID: 'Invalid ID format',
        REQUIRED_FIELD: (field) => `${field} is required`,
    },

    // Server
    SERVER: {
        INTERNAL_ERROR: 'Internal server error',
        SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
        TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
    },

    // Booking
    BOOKING: {
        SEAT_UNAVAILABLE: 'One or more selected seats are unavailable',
        SHOWTIME_ENDED: 'This showtime has already ended',
        BOOKING_SUCCESS: 'Booking created successfully',
        BOOKING_CANCELLED: 'Booking cancelled successfully',
        ALREADY_BOOKED: 'You already have a booking for this showtime',
    },

    // Payment
    PAYMENT: {
        SUCCESS: 'Payment completed successfully',
        FAILED: 'Payment failed',
        PENDING: 'Payment is pending',
    },
};

module.exports = messages;
