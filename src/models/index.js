const User = require("./user.model");
const RefreshToken = require("./refreshToken.model");
const Genre = require("./genre.model");
const Movie = require("./movie.model");
const Showtime = require("./showtime.model");
const Screen = require("./screen.model");
const Theater = require("./theater.model");
const Promotion = require("./promotion.model");
const Payment = require("./payment.model");
const Seat = require("./seat.model");
const BookingSeat = require("./bookingseat.model");

module.exports = {
  User,
  RefreshToken,
  Genre,
  Theater,
  Promotion,
  Movie,
  Showtime,
  Screen,
  Payment,
  Seat,
  BookingSeat,
};
