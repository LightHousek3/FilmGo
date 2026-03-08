const express = require('express');

const authRoute = require('./auth.route');
const genreRoute = require('./genre.route');
const festivalRoute = require('./festival.routes');

const router = express.Router();

const routes = [
    { path: '/auth', route: authRoute },
    { path: '/genres', route: genreRoute },
    { path: '/festivals', route: festivalRoute },
];

routes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;