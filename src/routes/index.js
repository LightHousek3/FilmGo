const express = require("express");

const authRoute = require("./auth.route");
const genreRoute = require("./genre.route");
const movieRoute = require("./movie.route");
const showtimeRoute = require("./showtime.route");

const router = express.Router();

const routes = [
  { path: "/auth", route: authRoute },
  { path: "/genres", route: genreRoute },
  { path: "/movies", route: movieRoute },
  { path: "/showtimes", route: showtimeRoute },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
