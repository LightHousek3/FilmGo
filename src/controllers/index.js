const authController = require("./auth.controller");
const genreController = require("./genre.controller");
const theaterController = require("./theater.controller");
const promotionController = require("./promotion.controller");
const movieController = require("./movie.controller");
const seatController = require("./seat.controller");
const ticketPriceController = require("./ticketPrice.controller");
const showtimeController = require("./showtime.controller");
const userController = require('./user.controller');

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
};
