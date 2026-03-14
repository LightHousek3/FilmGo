const { Screen, Showtime, Booking } = require('../models');
const { BOOKING_STATUS } = require('../constants');
const { ApiError } = require('../utils');

const createScreen = async (body) => {
    const { name } = body;
    const existing = await Screen.findOne({ name });
    if (existing) {
        throw new ApiError(400, "Screen name already exists");
    }
    return Screen.create(body);
};

const getScreenList = async () => {
    return Screen.find();
};

const getScreenById = async (id) => {
    const screen = await Screen.findById(id);
    if (!screen) {
        throw new ApiError(404, "Screen not found");
    }
    return screen;
};

const updateScreenById = async (id, updateBody) => {
    // Check if screen exists before proceeding
    const existingScreen = await Screen.findById(id);
    if (!existingScreen) {
        throw new ApiError(404, "Screen not found");
    }

    const now = new Date();
    const activeShowtimes = await Showtime.find({
        screen: id,
        endTime: { $gt: now }
    });

    if (activeShowtimes.length > 0) {
        const showtimeIds = activeShowtimes.map(st => st._id);
        const activeBooking = await Booking.findOne({
            showtime: { $in: showtimeIds },
            status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING] },
            $or: [
                { status: BOOKING_STATUS.CONFIRMED },
                { status: BOOKING_STATUS.PENDING, expiresAt: { $gt: now } }
            ]
        });

        if (activeBooking) {
            throw new ApiError(409, "Cannot update screen while its seats have active bookings");
        }
    }

    const screen = await Screen.findByIdAndUpdate(id, updateBody, { new: true });
    if (!screen) {
        throw new ApiError(404, "Screen not found");
    }
    return screen;
};

const deleteScreenById = async (id) => {
    const screen = await Screen.findByIdAndDelete(id);
    if (!screen) {
        throw new ApiError(404, "Screen not found");
    }
    return screen;
};

module.exports = {
    createScreen,
    getScreenList,
    getScreenById,
    updateScreenById,
    deleteScreenById
};
