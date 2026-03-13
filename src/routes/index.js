const express = require('express');
const genreRoute = require('./genre.route');
const promotionRoute = require('./promotion.routes');
const movieRoute = require('./movie.route');
const showtimeRoute = require('./showtime.route');
const authRoute = require('./auth.route');
const theaterRoute = require('./theater.route');
const seatRoute = require('./seat.route');
const ticketPriceRoute = require('./ticketPrice.route');
const newsRoute = require('./news.route');
const screenRoute = require('./screen.route');
const userRoute = require('./user.route');
const serviceRoute = require('./service.route');
const bookingRoute = require('./booking.route');
const paymentRoute = require('./payment.route');

const router = express.Router();

const routes = [
  { path: '/auth', route: authRoute },
  { path: '/genres', route: genreRoute },
  { path: '/news', route: newsRoute },
  { path: '/screens', route: screenRoute },
  { path: '/users', route: userRoute },
  { path: '/theaters', route: theaterRoute },
  { path: '/promotions', route: promotionRoute },
  { path: '/movies', route: movieRoute },
  { path: '/showtimes', route: showtimeRoute },
  { path: '/ticket-prices', route: ticketPriceRoute },
  { path: '/seats', route: seatRoute },
  { path: '/services', route: serviceRoute },
  { path: '/bookings', route: bookingRoute },
  { path: '/payments', route: paymentRoute },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
