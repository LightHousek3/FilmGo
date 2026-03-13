const authController = require("./auth.controller");
const genreController = require("./genre.controller");
const theaterController = require("./theater.controller");
const promotionController = require("./promotion.controller");
const movieController = require("./movie.controller");
const seatController = require("./seat.controller");
const ticketPriceController = require("./ticketPrice.controller");
const showtimeController = require("./showtime.controller");
const userController = require('./user.controller');
const serviceController = require('./service.controller');
const bookingController = require('./booking.controller');
const paymentController = require('./payment.controller');

module.exports = {
  authController,
  genreController,
  theaterController,
  promotionController,
  movieController,
  showtimeController,
  seatController,
  ticketPriceController,
  userController,
  serviceController,
  bookingController,
  paymentController,
};
