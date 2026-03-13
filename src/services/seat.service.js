const { Seat, Screen, Booking, Payment, Showtime } = require("../models");
const { ApiError } = require("../utils");
const { httpStatus, messages } = require("../constants");
const logger = require("../config/logger");
const { BOOKING_STATUS } = require("../constants");

const createSeat = async (body) => {
  try {
    // check screen tồn tại
    const screen = await Screen.findById(body.screenId);

    if (!screen) {
      throw ApiError.notFound(messages.CRUD.NOT_FOUND("Screen"));
    }

    // check seatNumber unique trong screen
    const existingSeat = await Seat.findOne({
      screenId: body.screenId,
      seatNumber: body.seatNumber,
    });

    if (existingSeat) {
      throw ApiError.conflict(messages.CRUD.ALREADY_EXISTS("Seat"));
    }

    return Seat.create(body);
  } catch (error) {
    logger.error("CREATE_SEAT_ERROR", error);
    throw error;
  }
};

const getSeats = async (filter, options) => {
  try {
    return Seat.paginate(filter, options);
  } catch (error) {
    logger.error("GET_SEATS_ERROR", error);
    throw error;
  }
};

const getSeatById = async (id) => {
  const seat = await Seat.findById(id);

  if (!seat) {
    throw ApiError.notFound(messages.CRUD.NOT_FOUND("Seat"));
  }

  return seat;
};

const checkActiveBooking = async (seatId) => {
  const now = new Date();

  const activeBooking = await Booking.findOne({
    "seats.seat": seatId,
    $or: [
      { status: BOOKING_STATUS.CONFIRMED },
      {
        status: BOOKING_STATUS.PENDING,
        expiresAt: { $gt: now },
      },
    ],
  }).populate({
    path: "showtime",
    match: { endTime: { $gt: now } },
  });

  if (activeBooking && activeBooking.showtime !== null) {
    return true;
  }
  return false;
};

const updateSeatById = async (seatId, updateBody) => {
  try {
    const seat = await getSeatById(seatId);

    // Prevent any update if seat has active booking
    const hasActiveBooking = await checkActiveBooking(seatId);

    if (hasActiveBooking) {
      throw ApiError.conflict("Cannot update seat while it has active booking");
    }

    Object.assign(seat, updateBody);

    await seat.save();

    return seat;
  } catch (error) {
    logger.error("UPDATE_SEAT_ERROR", error);
    throw error;
  }
};

const deleteSeatById = async (seatId) => {
  try {
    const seat = await getSeatById(seatId);

    const hasActiveBooking = await checkActiveBooking(seatId);

    if (hasActiveBooking) {
      throw ApiError.conflict("Cannot delete seat with active booking");
    }

    await seat.softDelete();

    return seat;
  } catch (error) {
    logger.error("DELETE_SEAT_ERROR", error);
    throw error;
  }
};

const updateSeatStatus = async (seatId, status) => {
  try {
    const seat = await getSeatById(seatId);

    const hasActiveBooking = await checkActiveBooking(seatId);

    if (hasActiveBooking) {
      throw ApiError.conflict("Cannot change seat status with active booking");
    }

    seat.status = status;

    await seat.save();

    return seat;
  } catch (error) {
    logger.error("UPDATE_SEAT_STATUS_ERROR", error);
    throw error;
  }
};

const createSeatsBulk = async (screenId, seatsData) => {
  try {
    // Check screen exists
    const screen = await Screen.findById(screenId);
    if (!screen) {
      throw ApiError.notFound(messages.CRUD.NOT_FOUND("Screen"));
    }

    // Validate and prepare seats
    const seatsToCreate = [];
    for (const data of seatsData) {
      // Check unique seatNumber
      const existing = await Seat.findOne({
        screenId,
        seatNumber: data.seatNumber,
      });
      if (existing) {
        throw ApiError.conflict(`Seat ${data.seatNumber} already exists`);
      }
      seatsToCreate.push({ screenId, ...data });
    }

    return Seat.insertMany(seatsToCreate);
  } catch (error) {
    logger.error("CREATE_SEATS_BULK_ERROR", error);
    throw error;
  }
};

const updateSeatsBulk = async (screenId, updates) => {
  try {
    // updates: array of { seatNumber, updateBody }
    const results = [];
    for (const update of updates) {
      const seat = await Seat.findOne({
        screenId,
        seatNumber: update.seatNumber,
      });
      if (!seat) {
        throw ApiError.notFound(`Seat ${update.seatNumber} not found`);
      }

      // Check active booking
      const hasActiveBooking = await checkActiveBooking(seat._id);
      if (hasActiveBooking) {
        throw ApiError.conflict(
          `Cannot update seat ${update.seatNumber} with active booking`,
        );
      }

      Object.assign(seat, update.updateBody);
      await seat.save();
      results.push(seat);
    }
    return results;
  } catch (error) {
    logger.error("UPDATE_SEATS_BULK_ERROR", error);
    throw error;
  }
};

const deleteSeatsBulk = async (screenId, seatNumbers) => {
  try {
    const results = [];
    for (const seatNumber of seatNumbers) {
      const seat = await Seat.findOne({ screenId, seatNumber });
      if (!seat) {
        throw ApiError.notFound(`Seat ${seatNumber} not found`);
      }

      const hasActiveBooking = await checkActiveBooking(seat._id);
      if (hasActiveBooking) {
        throw ApiError.conflict(
          `Cannot delete seat ${seatNumber} with active booking`,
        );
      }

      await seat.softDelete();
      results.push(seat);
    }
    return results;
  } catch (error) {
    logger.error("DELETE_SEATS_BULK_ERROR", error);
    throw error;
  }
};

module.exports = {
  createSeat,
  getSeats,
  getSeatById,
  updateSeatById,
  deleteSeatById,
  updateSeatStatus,
  createSeatsBulk,
  updateSeatsBulk,
  deleteSeatsBulk,
};
