const express = require("express");
const authRoute = require("./auth.route");
const genreRoute = require("./genre.route");
const promotionRoute = require("./promotion.routes");
const movieRoute = require("./movie.route");
const showtimeRoute = require("./showtime.route");
const theaterRoute = require("./theater.route");
const ticketPriceRoute = require("./ticketPrice.route");
const festivalRoute = require('./festival.routes');
const bannerRoute = require("./banner.routes");


const router = express.Router();

const routes = [

  { path: "/auth", route: authRoute },
  { path: "/genres", route: genreRoute },
  { path: "/theaters", route: theaterRoute },
  { path: "/promotions", route: promotionRoute },
  { path: "/movies", route: movieRoute },
  { path: "/showtimes", route: showtimeRoute },
  { path: "/ticket-prices", route: ticketPriceRoute },
  { path: '/festivals', route: festivalRoute },
  { path: "/banners", route: bannerRoute },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;