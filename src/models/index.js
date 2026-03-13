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
const TicketPrice = require("./ticketPrice.model");
const News = require("./news.model");
const Service = require("./service.model");
const Booking = require("./booking.model");

module.exports = {
  User,
  RefreshToken,
  Genre,
  News,
  Promotion,
  Movie,
  Showtime,
  Screen,
  Payment,
  Seat,
  BookingSeat,
  Theater,
  TicketPrice,
  Service,
  Booking,
};
