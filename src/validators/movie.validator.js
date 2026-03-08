const Joi = require("joi");
const { MOVIE_TYPE, AGE_RATING } = require("../constants");

const createMovie = {
  body: Joi.object().keys({
    title: Joi.string().trim().required(),

    genres: Joi.array().items(
      Joi.string().hex().length(24), // ObjectId
    ),

    description: Joi.string().allow(""),

    author: Joi.string().allow(""),

    image: Joi.object({
      url: Joi.string().uri(),
      publicId: Joi.string(),
    }),

    trailer: Joi.object({
      url: Joi.string().uri(),
      publicId: Joi.string(),
    }),

    type: Joi.string().valid(...Object.values(MOVIE_TYPE)),

    duration: Joi.number().min(1),

    origin: Joi.string(),

    releaseDate: Joi.date().required(),

    endDate: Joi.date().greater(Joi.ref("releaseDate")).required().messages({
      "date.greater": "endDate must be greater than releaseDate",
    }),

    ageRating: Joi.string().valid(...Object.values(AGE_RATING)),

    actors: Joi.array().items(Joi.string()),
  }),
};

const updateMovie = {
  params: Joi.object().keys({
    id: Joi.string().hex().length(24),
  }),

  body: Joi.object()
    .keys({
      title: Joi.string().trim(),

      genres: Joi.array().items(Joi.string().hex().length(24)),

      description: Joi.string(),

      author: Joi.string(),

      image: Joi.object({
        url: Joi.string().uri(),
        publicId: Joi.string(),
      }),

      trailer: Joi.object({
        url: Joi.string().uri(),
        publicId: Joi.string(),
      }),

      type: Joi.string().valid(...Object.values(MOVIE_TYPE)),

      duration: Joi.number().min(1),

      origin: Joi.string(),

      releaseDate: Joi.date(),

      endDate: Joi.date(),

      ageRating: Joi.string().valid(...Object.values(AGE_RATING)),

      actors: Joi.array().items(Joi.string()),
    })
    .custom((value, helpers) => {
      if (value.releaseDate && value.endDate && !(value.releaseDate < value.endDate)) {
        return helpers.message("endDate must be greater than releaseDate");
      }

      return value;
    })
    .min(1),
};

const deleteMovie = {
  params: Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
  }),
};

const getMovies = {
  query: Joi.object().keys({
    title: Joi.string(),
    genres: Joi.string(),
    type: Joi.string().valid(...Object.values(MOVIE_TYPE)),
    origin: Joi.string(),
    ageRating: Joi.string().valid(...Object.values(AGE_RATING)),
    releaseDate: Joi.date(),
    endDate: Joi.date(),
    location: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

const getNowShowingMovies = {
  query: Joi.object().keys({
    location: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

const getUpcomingMovies = {
  query: Joi.object().keys({
    location: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

module.exports = {
  createMovie,
  updateMovie,
  deleteMovie,
  getMovies,
  getNowShowingMovies,
  getUpcomingMovies,
};
