const authValidator = require("./auth.validator");
const customValidator = require("./custom.validator");
const promotionValidator = require('./promotion.validator');
const movieValidator = require("./movie.validator");
const showtimeValidator = require("./showtime.validator");

module.exports = {
  authValidator,
  customValidator,
  promotionValidator,
  movieValidator,
  showtimeValidator,
};
