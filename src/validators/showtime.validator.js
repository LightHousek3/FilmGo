const Joi = require("joi");
const { SHOWTIME_STATUS } = require("../constants");

const createShowtime = {
  body: Joi.object().keys({
    status: Joi.string()
      .valid(...Object.values(SHOWTIME_STATUS))
      .default(SHOWTIME_STATUS.UPCOMING),

    startTime: Joi.date().required(),

    endTime: Joi.date().greater(Joi.ref("startTime")).required().messages({
      "date.greater": "endTime must be greater than startTime",
    }),

    movie: Joi.string().hex().length(24).required(),

    screen: Joi.string().hex().length(24).required(),
  }),
};

const updateShowtime = {
  params: Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
  }),

  body: Joi.object()
    .keys({
      status: Joi.string().valid(...Object.values(SHOWTIME_STATUS)),

      startTime: Joi.date(),

      endTime: Joi.date(),

      movie: Joi.string().hex().length(24),

      screen: Joi.string().hex().length(24),
    })
    .custom((value, helpers) => {
      if (value.startTime && value.endTime && !(value.startTime < value.endTime)) {
        return helpers.message("endTime must be greater than startTime");
      }

      return value;
    })
    .min(1),
};

const deleteShowtime = {
  params: Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
  }),
};

const getShowtimes = {
  query: Joi.object().keys({
    status: Joi.string().valid(...Object.values(SHOWTIME_STATUS)),
    date: Joi.date(),
    startTime: Joi.date(),
    endTime: Joi.date(),
    location: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

module.exports = {
  createShowtime,
  getShowtimes,
  updateShowtime,
  deleteShowtime,
};