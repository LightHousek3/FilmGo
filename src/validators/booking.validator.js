const Joi = require('joi');
const { objectId, paginationQuery } = require('./custom.validator');
const { BOOKING_STATUS } = require('../constants');

const createBooking = {
    body: Joi.object().keys({
        showtime: Joi.string().required().custom(objectId),
        seats: Joi.array()
            .items(Joi.string().required().custom(objectId))
            .min(1)
            .required(),
        services: Joi.array()
            .items(
                Joi.object().keys({
                    serviceId: Joi.string().required().custom(objectId),
                    quantity: Joi.number().integer().min(1).required(),
                })
            )
            .default([]),
    }),
};

const getBookingById = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
};

const getUserBookings = {
    query: Joi.object().keys({
        ...paginationQuery,
        status: Joi.string().valid(...Object.values(BOOKING_STATUS)),
    }),
};

const getBookings = {
    query: Joi.object().keys({
        ...paginationQuery,
        status: Joi.string().valid(...Object.values(BOOKING_STATUS)),
        user: Joi.string().custom(objectId),
        showtime: Joi.string().custom(objectId),
    }),
};

const cancelBooking = {
    params: Joi.object().keys({
        id: Joi.string().required().custom(objectId),
    }),
};

module.exports = {
    createBooking,
    getBookingById,
    getUserBookings,
    getBookings,
    cancelBooking,
};
