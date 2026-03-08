const Joi = require("joi");

const createTicketPrice = {
  body: Joi.object().keys({
    typeSeat: Joi.string().valid("STANDARD", "VIP", "SWEETBOX").required(),
    typeMovie: Joi.string().valid("2D", "3D").required(),
    price: Joi.number().min(1).required(),
    dayType: Joi.string().valid("WEEKDAY", "WEEKEND").required(),
    startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
    endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  }),
};

module.exports = {
  createTicketPrice,
};
