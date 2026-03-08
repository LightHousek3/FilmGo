const authValidator = require("./auth.validator");
const theaterValidator = require("./theater.validator");
const customValidator = require("./custom.validator");
const promotionValidator = require("./promotion.validator");
const movieValidator = require("./movie.validator");
const showtimeValidator = require("./showtime.validator");
const ticketPriceValidator = require("./ticketPrice.validator");
const userValidator = require('./user.validator');
const newsValidator = require('./news.validator');

module.exports = {
  authValidator,
  theaterValidator,
  customValidator,
    userValidator,
    newsValidator,
  promotionValidator,
  movieValidator,
  showtimeValidator,
  ticketPriceValidator,
};
