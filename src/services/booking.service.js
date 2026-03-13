const {
  Booking,
  Showtime,
  Seat,
  Service,
  TicketPrice,
  Promotion,
  Payment,
} = require("../models");
const { ApiError } = require("../utils");
const {
  messages,
  BOOKING_STATUS,
  BOOKING_HOLD_MINUTES,
  SHOWTIME_STATUS,
} = require("../constants");
const logger = require("../config/logger");

// ── Helpers ──────────────────────────────────────────────

/**
 * Format time as "HH:MM" from a Date object (Vietnam time UTC+7)
 */
const toVietnamHHMM = (date) => {
  const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const hh = String(vnDate.getUTCHours()).padStart(2, "0");
  const mm = String(vnDate.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

/**
 * Determine day type (WEEKDAY / WEEKEND) from a Date (Vietnam time).
 * Also checks if the date is a public holiday in Vietnam (treated as WEEKEND).
 */
const getDayType = async (dateObj) => {
  const vnDate = new Date(dateObj.getTime() + 7 * 60 * 60 * 1000);
  const day = vnDate.getUTCDay(); // 0=Sun, 6=Sat

  const isWeekend = day === 0 || day === 6;
  if (isWeekend) return "WEEKEND";

  // Check if public holiday
  const year = vnDate.getUTCFullYear();
  const dateString = vnDate.toISOString().split("T")[0];

  // Simple cache for holiday sets
  global.holidayCache = global.holidayCache || {};

  if (!global.holidayCache[year]) {
    try {
      const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/VN`;
      const response = await fetch(url);
      if (response.ok) {
        const holidays = await response.json();
        global.holidayCache[year] = holidays.map((h) => h.date);
      } else {
        global.holidayCache[year] = [];
      }
    } catch (error) {
      logger.error("Failed to fetch public holidays", error);
      global.holidayCache[year] = [];
    }
  }

  const isHoliday = global.holidayCache[year].includes(dateString);
  return isHoliday ? "WEEKEND" : "WEEKDAY";
};

/**
 * Compare "HH:MM" strings
 */
const timeStringToMinutes = (timeStr) => {
  const [hh, mm] = timeStr.split(":").map(Number);
  return hh * 60 + mm;
};

/**
 * Find the ticket price applicable to a given seat for a showtime.
 * Matches: typeSeat, typeMovie, dayType, and startTime within [startTime, endTime).
 */
const findTicketPrice = async ({
  typeSeat,
  typeMovie,
  dayType,
  showtimeStartHHMM,
}) => {
  const showMinutes = timeStringToMinutes(showtimeStartHHMM);

  const prices = await TicketPrice.find({ typeSeat, typeMovie, dayType });

  for (const tp of prices) {
    const start = timeStringToMinutes(tp.startTime);
    const end = timeStringToMinutes(tp.endTime);
    // Handle overnight ranges (e.g., 22:00 – 08:00)
    if (start <= end) {
      if (showMinutes >= start && showMinutes < end) return tp;
    } else {
      // Wraps midnight
      if (showMinutes >= start || showMinutes < end) return tp;
    }
  }
  return null;
};

/**
 * Apply the current active promotion to the booking (if eligible).
 * Evaluates both ticket and service conditions.
 * Returns the effective discount amount.
 */
const applyActivePromotion = async ({
  seatTypes,
  movieType,
  dayType,
  seatTotal,
  serviceTypes,
  serviceTotal,
}) => {
  const now = new Date();

  // Since overlap logic prevents multiple active promos, we find the single active one
  const promo = await Promotion.findOne({
    status: "ACTIVE",
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  if (!promo) return { promotion: null, discount: 0 };

  let eligibleAmount = 0;

  // 1. Check ticket eligibility
  let ticketEligible = true;
  const pt = promo.promotionTickets;
  if (pt) {
    if (pt.typeSeat && pt.typeSeat.length > 0) {
      ticketEligible = seatTypes.some((st) => pt.typeSeat.includes(st));
    }
    if (ticketEligible && pt.typeMovie && pt.typeMovie.length > 0) {
      ticketEligible = pt.typeMovie.includes(movieType);
    }
    if (ticketEligible && pt.dayType && pt.dayType.length > 0) {
      ticketEligible = pt.dayType.includes(dayType);
    }
    if (ticketEligible) eligibleAmount += seatTotal;
  }

  // 2. Check service eligibility
  let serviceEligible = false;
  const ps = promo.promotionServices;
  if (ps && serviceTypes.length > 0) {
    serviceEligible = true;
    if (ps.typeService && ps.typeService.length > 0) {
      serviceEligible = serviceTypes.some((st) => ps.typeService.includes(st));
    }
    if (serviceEligible) eligibleAmount += serviceTotal;
  }

  if (eligibleAmount === 0 || (!ticketEligible && !serviceEligible)) {
    return { promotion: null, discount: 0 };
  }

  let discount = 0;
  if (promo.discountType === "PERCENT") {
    discount = Math.round((eligibleAmount * promo.discountValue) / 100);
  } else {
    discount = promo.discountValue; // Fixed amount off the eligible total
  }

  discount = Math.min(discount, eligibleAmount);

  return { promotion: promo, discount };
};

/**
 * Check if any booked seats conflict with existing non-expired, non-cancelled bookings
 * for the same showtime.
 */
const checkSeatConflicts = async (showtimeId, seatIds) => {
  const now = new Date();

  const conflict = await Booking.findOne({
    showtime: showtimeId,
    "seats.seat": { $in: seatIds },
    $or: [
      { status: BOOKING_STATUS.CONFIRMED },
      {
        status: BOOKING_STATUS.PENDING,
        expiresAt: { $gt: now },
      },
    ],
  });

  return conflict;
};

// ── Public API ────────────────────────────────────────────

/**
 * Create a booking (customer)
 *
 * @param {string}   userId
 * @param {Object}   body
 * @param {string}   body.showtime       - showtime ID
 * @param {Array}    body.seats          - [{ seatId }]
 * @param {Array}    [body.services]     - [{ serviceId, quantity }]
 * @param {string}   [body.promotionId]  - optional forced promotion ID
 */
const createBooking = async (userId, body) => {
  const {
    showtime: showtimeId,
    seats: seatInputs,
    services: serviceInputs = [],
  } = body;
  console.log("serviceInputs", serviceInputs);

  // ── 1. Validate showtime ──────────────────────────────
  const showtime = await Showtime.findById(showtimeId)
    .populate({ path: "movie", select: "type title" })
    .populate({ path: "screen", select: "theater" });

  if (!showtime) {
    throw ApiError.notFound(messages.CRUD.NOT_FOUND("Showtime"));
  }

  if (showtime.status === SHOWTIME_STATUS.ENDED) {
    throw ApiError.badRequest(messages.BOOKING.SHOWTIME_ENDED);
  }

  if (showtime.startTime <= new Date()) {
    throw ApiError.badRequest(messages.BOOKING.SHOWTIME_NOT_BOOKABLE);
  }

  const theaterId = showtime.screen.theater;
  const movieType = showtime.movie.type; // '2D' | '3D'
  const dayType = await getDayType(showtime.startTime);
  const showtimeStartHHMM = toVietnamHHMM(showtime.startTime);

  // ── 2. Validate seats ─────────────────────────────────
  const seats = await Seat.find({ _id: { $in: seatInputs } });

  if (seats.length !== seatInputs.length) {
    throw ApiError.notFound(messages.CRUD.NOT_FOUND("One or more seats"));
  }

  // All seats must belong to the showtime's screen
  const screenId = String(showtime.screen._id);
  const invalidScreenSeat = seats.find((s) => String(s.screenId) !== screenId);
  if (invalidScreenSeat) {
    throw ApiError.badRequest(messages.BOOKING.SEAT_NOT_IN_SCREEN);
  }

  // All seats must be physically available
  const unavailableSeat = seats.find((s) => s.status !== "AVAILABLE");
  if (unavailableSeat) {
    throw ApiError.conflict(messages.BOOKING.SEAT_UNAVAILABLE);
  }

  // Check for conflicts from existing bookings (atomic conflict detection)
  const conflict = await checkSeatConflicts(showtimeId, seatInputs);
  if (conflict) {
    throw ApiError.conflict(messages.BOOKING.SEAT_UNAVAILABLE);
  }

  // ── 3. Calculate seat prices ──────────────────────────
  const bookedSeats = [];
  let seatTotal = 0;

  for (const seat of seats) {
    const tp = await findTicketPrice({
      typeSeat: seat.type,
      typeMovie: movieType,
      dayType,
      showtimeStartHHMM,
    });

    if (!tp) {
      logger.warn(
        `No ticket price for seat ${seat._id} (${seat.type}, ${movieType}, ${dayType}, ${showtimeStartHHMM})`,
      );
      throw ApiError.badRequest(messages.BOOKING.TICKET_PRICE_NOT_FOUND);
    }

    bookedSeats.push({ seat: seat._id, price: tp.price });
    seatTotal += tp.price;
  }

  // ── 4. Validate services (optional) ──────────────────
  const bookedServices = [];
  let serviceTotal = 0;
  let services;
  if (serviceInputs.length > 0) {
    const serviceIds = serviceInputs.map((s) => s.serviceId);
    services = await Service.find({ _id: { $in: serviceIds } });

    if (services.length !== serviceIds.length) {
      throw ApiError.notFound(messages.CRUD.NOT_FOUND("One or more services"));
    }

    // All services must belong to the showtime's theater
    const badTheaterService = services.find(
      (svc) => String(svc.theater) !== String(theaterId),
    );
    if (badTheaterService) {
      throw ApiError.badRequest(messages.BOOKING.SERVICE_NOT_IN_THEATER);
    }

    // All services must be AVAILABLE
    const unavailableService = services.find(
      (svc) => svc.status !== "AVAILABLE",
    );
    if (unavailableService) {
      throw ApiError.conflict(messages.BOOKING.SERVICE_NOT_AVAILABLE);
    }

    const serviceMap = new Map(services.map((s) => [String(s._id), s]));

    for (const input of serviceInputs) {
      const svc = serviceMap.get(input.serviceId);
      const total = svc.price * input.quantity;
      bookedServices.push({
        service: svc._id,
        quantity: input.quantity,
        unitPrice: svc.price,
        total,
      });
      serviceTotal += total;
    }
  }

  // ── 5. Apply best promotion ───────────────────────────
  const seatTypes = [...new Set(seats.map((s) => s.type))];
  const serviceTypes = [...new Set(services?.map((s) => s.type))];

  const { promotion, discount: promotionDiscount } = await applyActivePromotion(
    {
      seatTypes,
      movieType,
      dayType,
      seatTotal,
      serviceTypes,
      serviceTotal,
    },
  );

  // Total price is already safely adjusted based on discount amount
  // applyActivePromotion correctly restricts discount <= eligible amount
  const totalPrice = Math.max(0, seatTotal + serviceTotal - promotionDiscount);

  // ── 6. Create booking ─────────────────────────────────
  const expiresAt = new Date(Date.now() + BOOKING_HOLD_MINUTES * 60 * 1000);

  const booking = await Booking.create({
    user: userId,
    showtime: showtimeId,
    seats: bookedSeats,
    services: bookedServices,
    totalSeat: seats.length,
    seatTotal,
    serviceTotal,
    promotionDiscount,
    totalPrice,
    status: BOOKING_STATUS.PENDING,
    expiresAt,
  });

  // Populate for response
  return Booking.findById(booking._id)
    .populate({
      path: "showtime",
      select: "startTime endTime status movie",
      populate: {
        path: "movie",
        select: "title type duration",
      },
    })
    .populate("seats.seat", "seatNumber type")
    .populate("services.service", "name type price");
};

/**
 * Get a single booking with full detail (owner or admin)
 */
const getBookingById = async (bookingId, userId, isAdmin = false) => {
  const booking = await Booking.findById(bookingId)
    .populate({
      path: "showtime",
      select: "startTime endTime status screen",
      populate: [
        { path: "movie", select: "title type duration image" },
        {
          path: "screen",
          select: "name theater",
          populate: { path: "theater", select: "name address" },
        },
      ],
    })
    .populate("seats.seat", "seatNumber type")
    .populate("services.service", "name type price imageUrl");

  if (!booking) {
    throw ApiError.notFound(messages.BOOKING.BOOKING_NOT_FOUND);
  }

  if (!isAdmin && String(booking.user) !== String(userId)) {
    throw ApiError.forbidden(messages.BOOKING.NOT_OWNER);
  }

  return booking;
};

/**
 * Get bookings for the current user with pagination
 */
const getUserBookings = async (userId, filter, options) => {
  const queryFilter = { user: userId };

  if (filter.status) queryFilter.status = filter.status;

  return Booking.paginate(queryFilter, {
    ...options,
    populate: "showtime",
  });
};

/**
 * Cancel a booking (customer can only cancel PENDING bookings)
 */
const cancelBooking = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw ApiError.notFound(messages.BOOKING.BOOKING_NOT_FOUND);
  }

  if (String(booking.user) !== String(userId)) {
    throw ApiError.forbidden(messages.BOOKING.NOT_OWNER);
  }

  if (booking.status !== BOOKING_STATUS.PENDING) {
    throw ApiError.badRequest(messages.BOOKING.CANNOT_CANCEL);
  }

  booking.status = BOOKING_STATUS.CANCELLED;
  await booking.save();

  // Cancel associated pending payment (if any)
  await Payment.findOneAndUpdate(
    { bookingId: booking._id, paymentStatus: "PENDING" },
    { paymentStatus: "CANCELLED" },
  );

  return booking;
};

/**
 * Admin: get all bookings
 */
const getBookings = async (filter, options) => {
  const queryFilter = {};
  if (filter.status) queryFilter.status = filter.status;
  if (filter.user) queryFilter.user = filter.user;
  if (filter.showtime) queryFilter.showtime = filter.showtime;

  return Booking.paginate(queryFilter, {
    ...options,
    populate: "user,showtime",
  });
};

module.exports = {
  createBooking,
  getBookingById,
  getUserBookings,
  cancelBooking,
  getBookings,
};
