const authValidator = require("./auth.validator");
const theaterValidator = require("./theater.validator");
const customValidator = require("./custom.validator");
const promotionValidator = require("./promotion.validator");
const movieValidator = require("./movie.validator");
const showtimeValidator = require("./showtime.validator");
const seatValidator = require("./seat.validator");
const ticketPriceValidator = require("./ticketPrice.validator");
const userValidator = require('./user.validator');
const newsValidator = require('./news.validator');
const serviceValidator = require('./service.validator');
const bookingValidator = require('./booking.validator');
const paymentValidator = require('./payment.validator');

module.exports = {
  authValidator,
  theaterValidator,
  customValidator,
  userValidator,
  newsValidator,
  promotionValidator,
  movieValidator,
  showtimeValidator,
  seatValidator,
  ticketPriceValidator,
  serviceValidator,
  bookingValidator,
  paymentValidator,
};
