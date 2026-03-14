/**
 * Centralized message constants
 */
const messages = {
  // Auth
  AUTH: {
    LOGIN_SUCCESS: "Login successful",
    LOGOUT_SUCCESS: "Logout successful",
    REGISTER_SUCCESS:
      "Registration successful. Please check your email to verify your account.",
    TOKEN_REFRESHED: "Token refreshed successfully",
    INVALID_CREDENTIALS: "Invalid email or password",
    UNAUTHORIZED: "Please authenticate",
    FORBIDDEN: "You do not have permission to perform this action",
    EMAIL_ALREADY_EXISTS: "Email already registered",
    EMAIL_NOT_VERIFIED: "Please verify your email to activate your account",
    INVALID_REFRESH_TOKEN: "Invalid or expired refresh token",
    ACCOUNT_BLOCKED: "Your account has been blocked. Please contact support.",
    ACCOUNT_INACTIVE:
      "Your account is not active. Please verify your email first.",
    VERIFICATION_EMAIL_SENT:
      "Verification email sent. Please check your inbox.",
    EMAIL_VERIFIED: "Email verified successfully. Your account is now active!",
    INVALID_VERIFICATION_TOKEN: "Invalid or expired verification token",
    FORGOT_PASSWORD_SENT:
      "Password reset instructions have been sent to your email.",
    RESET_PASSWORD_SUCCESS: "Password has been reset successfully.",
    INVALID_RESET_TOKEN: "Invalid or expired password reset token",
    RESEND_VERIFICATION_SENT: "Verification email resent successfully.",
    ALREADY_VERIFIED: "This email has already been verified.",
    RESEND_TOO_SOON: "Please wait before requesting another email.",
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
    FAILED: "Validation failed",
    INVALID_OBJECT_ID: "Invalid ID format",
    REQUIRED_FIELD: (field) => `${field} is required`,
    INVALID_TIME_RANGE: "endTime must be greater than startTime",
    MOVIE_SCHEDULE_NOT_CONFIGURED:
      "Movie must have releaseDate and endDate before creating showtimes",
    MOVIE_DURATION_NOT_CONFIGURED:
      "Movie must have a valid duration (minutes) before creating showtimes",
    SHOWTIME_OUTSIDE_MOVIE_RANGE:
      "Showtime must be within movie releaseDate and endDate",
    SHOWTIME_SHORTER_THAN_MOVIE_DURATION: (durationMinutes) =>
      `Showtime duration must be at least movie duration (${durationMinutes} minutes)`,
    SHOWTIME_OVERLAP_IN_SCREEN: (bufferMinutes) =>
      `Showtime overlaps with another showtime in the same screen (minimum ${bufferMinutes} minutes gap required)`,
    MOVIE_DATE_RANGE_CANNOT_SHRINK:
      "Cannot shorten movie release window because showtimes already exist",
  },

  // Server
  SERVER: {
    INTERNAL_ERROR: "Internal server error",
    SERVICE_UNAVAILABLE: "Service temporarily unavailable",
    TOO_MANY_REQUESTS: "Too many requests. Please try again later.",
  },

  // Booking
  BOOKING: {
    SEAT_UNAVAILABLE: "One or more selected seats are unavailable or already booked",
    SEAT_NOT_IN_SCREEN: "One or more seats do not belong to this showtime's screen",
    SHOWTIME_ENDED: "This showtime has already ended",
    SHOWTIME_NOT_BOOKABLE: "This showtime is not open for booking",
    BOOKING_SUCCESS: "Booking created successfully",
    BOOKING_CANCELLED: "Booking cancelled successfully",
    BOOKING_NOT_FOUND: "Booking not found",
    ALREADY_BOOKED: "You already have an active booking for this showtime",
    CANNOT_CANCEL: "Only pending bookings can be cancelled",
    EXPIRED: "Booking has expired",
    NOT_OWNER: "You are not authorized to access this booking",
    TICKET_PRICE_NOT_FOUND:
      "No ticket price found for this seat type, movie type, and showtime. Please contact support.",
    SERVICE_NOT_AVAILABLE: "One or more selected services are unavailable",
    SERVICE_NOT_IN_THEATER: "One or more services do not belong to this showtime's theater",
    PROMOTION_NOT_APPLICABLE: "The promotional code is not applicable to this booking",
  },

  // Payment
  PAYMENT: {
    SUCCESS: "Payment completed successfully",
    FAILED: "Payment failed",
    PENDING: "Payment is pending",
    NOT_FOUND: "Payment not found",
    ALREADY_PAID: "This booking has already been paid",
    BOOKING_EXPIRED: "Booking has expired. Please create a new booking.",
    INVALID_SIGNATURE: "Invalid payment signature",
    VNPAY_URL_CREATED: "VNPay payment URL created successfully",
  },

  // Service
  SERVICE: {
    NAME_THEATER_EXISTS: "A service with this name already exists in this theater",
  },

  // Theater
  THEATER: {
    GEOCODE_SUCCESS: "Theater coordinates updated successfully",
    GEOCODE_NOT_FOUND:
      "Could not determine coordinates for the provided address. Please try a more specific address.",
    GEOCODE_SERVICE_ERROR:
      "Geocoding service is temporarily unavailable. Please try again later.",
  },

  //Ticket Prices
  TICKETPRICE: {
    DUPLICATE: (resource) =>
      `${resource} with the same typeSeat, typeMovie, dayType and overlapping time range already exists`,
    TIME_RANGE: (resource) => `${resource}: Start time must be before end time`,
  },
};

module.exports = messages;
