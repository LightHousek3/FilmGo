const { Seat, Screen, BookingSeat, Booking, Payment } = require("../models");
const { ApiError } = require("../utils");
const { httpStatus, messages } = require("../constants");
const logger = require("../config/logger");

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
  const bookingSeats = await BookingSeat.find({ seatId });

  if (!bookingSeats.length) {
    return false;
  }

  const bookingIds = bookingSeats.map((bs) => bs.bookingId);

  const activePayments = await Payment.find({
    bookingId: { $in: bookingIds },
    paymentStatus: { $in: ["PENDING", "COMPLETED"] },
  });

  return activePayments.length > 0;
};

const updateSeatById = async (seatId, updateBody) => {
  try {
    const seat = await getSeatById(seatId);

    // rule: không đổi type nếu đang có booking active
    if (updateBody.type && updateBody.type !== seat.type) {
      const hasActiveBooking = await checkActiveBooking(seatId);

      if (hasActiveBooking) {
        throw ApiError.conflict(
          "Cannot change seat type while seat has active booking",
        );
      }
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

module.exports = {
  createSeat,
  getSeats,
  getSeatById,
  updateSeatById,
  deleteSeatById,
  updateSeatStatus,
};
