const authValidator = require("./auth.validator");
const theaterValidator = require('./theater.validator');
const customValidator = require("./custom.validator");
const promotionValidator = require('./promotion.validator');
const movieValidator = require("./movie.validator");
const showtimeValidator = require("./showtime.validator");
const seatValidator = require("./seat.validator");

module.exports = {
  authValidator,
  theaterValidator,
  customValidator,
  promotionValidator,
  movieValidator,
  showtimeValidator,
  seatValidator,
};
