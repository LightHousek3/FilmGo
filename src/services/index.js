const authService = require("./auth.service");
const genreService = require("./genre.service");
const emailService = require("./email.service");
const theaterService = require("./theater.service");
const geocodeService = require("./geocode.service");
const promotionService = require("./promotion.service");
const movieService = require("./movie.service");
const showtimeService = require("./showtime.service");
const ticketPriceService = require("./ticketPrice.service");
const userService = require('./user.service');
const newsService = require('./news.service');

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
  ticketPriceService,
};
