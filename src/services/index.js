const authService = require("./auth.service");
const genreService = require("./genre.service");
const emailService = require("./email.service");
const theaterService = require("./theater.service");
const geocodeService = require("./geocode.service");
const promotionService = require("./promotion.service");
const movieService = require("./movie.service");
const showtimeService = require("./showtime.service");
const ticketPriceService = require("./ticketPrice.service");
const seatService = require('./seat.service');
const userService = require('./user.service');
const newsService = require('./news.service');
<<<<<<< Updated upstream
=======
const serviceService = require('./service.service');
const bookingService = require('./booking.service');
const paymentService = require('./payment.service');
>>>>>>> Stashed changes

module.exports = {
  authService,
  genreService,
  userService,
  newsService,
  emailService,
  theaterService,
  geocodeService,
  promotionService,
  movieService,
  showtimeService,
  seatService,
  ticketPriceService,
  serviceService,
  bookingService,
  paymentService,
};
