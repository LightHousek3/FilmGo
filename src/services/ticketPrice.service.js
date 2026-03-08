const { TicketPrice } = require("../models");
const { ApiError } = require("../utils");
const { httpStatus, messages } = require("../constants");

// Helper: Check for overlapping ticket prices
const checkOverlap = async (
  typeSeat,
  typeMovie,
  dayType,
  startTime,
  endTime,
  excludeId = null,
) => {
  const query = {
    typeSeat,
    typeMovie,
    dayType,
    startTime: { $lte: endTime },
    endTime: { $gte: startTime },
    deleted: { $ne: true },
  };
  if (excludeId) query._id = { $ne: excludeId };
  return TicketPrice.findOne(query);
};

// Create a new ticket price
const createTicketPrice = async (body) => {
  const { typeSeat, typeMovie, dayType, startTime, endTime } = body;
  const overlap = await checkOverlap(
    typeSeat,
    typeMovie,
    dayType,
    startTime,
    endTime,
  );
  if (overlap) {
    throw new ApiError(
      httpStatus.CONFLICT,
      messages.TICKETPRICE.DUPLICATE("TicketPrice"),
    );
  }
  if (startTime >= endTime) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      messages.TICKETPRICE.TIME_RANGE("TicketPrice"),
    );
  }
  return TicketPrice.create(body);
};

// Get ticket prices with pagination
const getTicketPrices = async (filter, options) => {
  return TicketPrice.paginate(filter, options);
};

// Get a ticket price by ID
const getTicketPriceById = async (id) => {
  const ticketPrice = await TicketPrice.findById(id);
  if (!ticketPrice) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      messages.TICKETPRICE.NOT_FOUND("TicketPrice"),
    );
  }
  return ticketPrice;
};

// Update a ticket price by ID
const updateTicketPriceById = async (id, updateBody) => {
  const ticketPrice = await getTicketPriceById(id);
  const { typeSeat, typeMovie, dayType, startTime, endTime } = {
    ...ticketPrice.toObject(),
    ...updateBody,
  };
  if (startTime >= endTime) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      messages.TICKETPRICE.TIME_RANGE("TicketPrice"),
    );
  }
  const overlap = await checkOverlap(
    typeSeat,
    typeMovie,
    dayType,
    startTime,
    endTime,
    id,
  );
  if (overlap) {
    throw new ApiError(
      httpStatus.CONFLICT,
      messages.TICKETPRICE.DUPLICATE("TicketPrice"),
    );
  }
  Object.assign(ticketPrice, updateBody);
  await ticketPrice.save();
  return ticketPrice;
};

// Delete a ticket price by ID (soft delete)
const deleteTicketPriceById = async (id) => {
  const ticketPrice = await getTicketPriceById(id);
  await ticketPrice.softDelete();
  return ticketPrice;
};

module.exports = {
  createTicketPrice,
  getTicketPrices,
  updateTicketPriceById,
  getTicketPriceById,
  deleteTicketPriceById,
};
