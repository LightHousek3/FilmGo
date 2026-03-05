/**
 * Centralized message constants
 */
const messages = {
    // Auth
    AUTH: {
        LOGIN_SUCCESS: 'Login successful',
        LOGOUT_SUCCESS: 'Logout successful',
        REGISTER_SUCCESS: 'Registration successful. Please check your email to verify your account.',
        TOKEN_REFRESHED: 'Token refreshed successfully',
        INVALID_CREDENTIALS: 'Invalid email or password',
        UNAUTHORIZED: 'Please authenticate',
        FORBIDDEN: 'You do not have permission to perform this action',
        EMAIL_ALREADY_EXISTS: 'Email already registered',
        EMAIL_NOT_VERIFIED: 'Please verify your email to activate your account',
        INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
        ACCOUNT_BLOCKED: 'Your account has been blocked. Please contact support.',
        ACCOUNT_INACTIVE: 'Your account is not active. Please verify your email first.',
        VERIFICATION_EMAIL_SENT: 'Verification email sent. Please check your inbox.',
        EMAIL_VERIFIED: 'Email verified successfully. Your account is now active!',
        INVALID_VERIFICATION_TOKEN: 'Invalid or expired verification token',
        FORGOT_PASSWORD_SENT: 'Password reset instructions have been sent to your email.',
        RESET_PASSWORD_SUCCESS: 'Password has been reset successfully.',
        INVALID_RESET_TOKEN: 'Invalid or expired password reset token',
        RESEND_VERIFICATION_SENT: 'Verification email resent successfully.',
        ALREADY_VERIFIED: 'This email has already been verified.',
        RESEND_TOO_SOON: 'Please wait before requesting another email.',
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

    // Theater
    THEATER: {
        GEOCODE_SUCCESS: 'Theater coordinates updated successfully',
        GEOCODE_NOT_FOUND: 'Could not determine coordinates for the provided address. Please try a more specific address.',
        GEOCODE_SERVICE_ERROR: 'Geocoding service is temporarily unavailable. Please try again later.',
    },
};

module.exports = messages;
